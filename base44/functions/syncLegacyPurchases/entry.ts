import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const IS_PRODUCTION = false;
const stripeSecretKey = IS_PRODUCTION ? Deno.env.get('STRIPE_SECRET_KEY') : Deno.env.get('STRIPE_SECRET_KEYtest');
const stripe = new Stripe(stripeSecretKey);

console.log(`🔐 LEGACY SYNC RUNNING IN ${IS_PRODUCTION ? '🔴 LIVE' : '🟢 TEST'} MODE`);

// Retry with exponential backoff
async function retryOperation(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.error(`Retry ${i + 1}/${maxRetries}:`, err.message);
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}

async function logAdminAlert(base44, message, userEmail, metadata) {
  try {
    await base44.asServiceRole.entities.AdminAlert.create({
      alert_type: 'sync_error',
      severity: 'high',
      message,
      user_email: userEmail,
      metadata: JSON.stringify(metadata),
      resolved: false
    });
  } catch (e) {
    console.error('Failed to log alert:', e.message);
  }
}

async function sendGodModeEmail(base44, userEmail, userName, planName) {
  try {
    const emailBody = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a high-energy, 4-sentence confirmation email for ${userName}. Tell them their Vault is now unlocked and they have God-Mode access to beat any ATS with the ${planName} plan. Keep it professional but punchy. Use emojis sparingly.`,
      model: 'gemini_3_flash'
    });
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: `🚀 God-Mode Activated: Your ${planName} Access is Live!`,
      body: emailBody
    });
    console.log(`✅ God-Mode email sent to ${userEmail}`);
    return true;
  } catch (e) {
    console.error('Email failed:', e.message);
    return false;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const daysBack = body.days_back || 30;
    const sendEmails = body.send_emails !== false;

    console.log(`🔄 Starting legacy sync — last ${daysBack} days, emails: ${sendEmails}`);

    const since = Math.floor(Date.now() / 1000) - (daysBack * 24 * 60 * 60);
    const sessions = await stripe.checkout.sessions.list({ created: { gte: since }, limit: 100 });
    console.log(`Found ${sessions.data.length} sessions to process`);

    const results = { processed: 0, updated: 0, emails_sent: 0, errors: [], details: [] };

    for (const session of sessions.data) {
      if (session.payment_status !== 'paid') continue;

      // Normalize email — fix type mismatch (trim, lowercase)
      const rawEmail = session.customer_details?.email || session.metadata?.user_email || '';
      const email = rawEmail.toLowerCase().trim();

      if (!email || !email.includes('@')) {
        await logAdminAlert(base44, 'No valid email in session', null, { sessionId: session.id });
        results.errors.push({ session: session.id, reason: 'No valid email' });
        continue;
      }

      results.processed++;

      try {
        // Get or create subscription with retry
        let subscription = await retryOperation(async () => {
          const subs = await base44.asServiceRole.entities.UserSubscription.filter({ created_by: email });
          if (subs[0]) return subs[0];
          return await base44.asServiceRole.entities.UserSubscription.create({
            created_by: email,
            stripe_customer_id: session.customer,
            subscription_status: 'free',
            ai_tasks_used: 0,
            credits_balance: 0
          });
        });

        const updates = {};
        const purchaseType = session.metadata?.purchase_type;
        const itemId = (session.metadata?.item_id || '').toLowerCase();
        let planName = null;

        // Subscription
        if (session.mode === 'subscription' || purchaseType === 'subscription') {
          updates.stripe_customer_id = session.customer;
          updates.subscription_id = session.subscription;
          if (itemId.includes('elite')) {
            updates.subscription_status = 'elite';
            planName = 'Elite';
          } else {
            updates.subscription_status = 'pro';
            planName = 'Pro';
          }
        }

        // Credits
        if (purchaseType === 'credits' && itemId) {
          const creditMap = { credits_50: 50, credits_150: 150, credits_400: 400, credits_1000: 1000 };
          const creditsToAdd = creditMap[itemId] || 0;
          if (creditsToAdd > 0) {
            const current = subscription.credits_balance || 0;
            updates.credits_balance = current + creditsToAdd;
            await retryOperation(() => base44.asServiceRole.entities.CreditTransaction.create({
              created_by: email,
              credits_amount: creditsToAdd,
              transaction_type: 'purchase',
              description: `Legacy sync: +${creditsToAdd} credits`,
              payment_id: session.id,
              balance_after: updates.credits_balance
            }));
          }
        }

        // Addons
        if (purchaseType === 'addon' && itemId) {
          const existing = (subscription.premium_addons || '').split(',').filter(Boolean);
          if (!existing.includes(itemId)) {
            existing.push(itemId);
            updates.premium_addons = existing.join(',');
          }
        }

        // CRITICAL: Never overwrite a manual override with sync data
        if (subscription.is_manual_override === true) {
          // Only update non-tier fields (credits, stripe IDs) — never subscription_status or tier
          delete updates.subscription_status;
          delete updates.subscription_tier;
          delete updates.subscription_expires_at;
        }

        if (Object.keys(updates).length > 0) {
          await retryOperation(() =>
            base44.asServiceRole.entities.UserSubscription.update(subscription.id, updates)
          );
          results.updated++;
          results.details.push({ email, session: session.id, updates });
          console.log(`✅ Updated ${email}:`, updates);

          // Send God-Mode email for subscription upgrades
          if (planName && sendEmails) {
            const userName = session.customer_details?.name || email.split('@')[0];
            const sent = await sendGodModeEmail(base44, email, userName, planName);
            if (sent) results.emails_sent++;
          }
        }

      } catch (error) {
        console.error(`❌ Error for ${email}:`, error.message);
        await logAdminAlert(base44, `Legacy sync failed: ${error.message}`, email, { sessionId: session.id });
        results.errors.push({ session: session.id, email, error: error.message });
      }
    }

    console.log('✅ Legacy sync complete:', results);
    return Response.json({ success: true, ...results });

  } catch (error) {
    console.error('Legacy sync fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});