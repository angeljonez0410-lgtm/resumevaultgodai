import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const IS_PRODUCTION = false;
const stripeSecretKey = IS_PRODUCTION ? Deno.env.get('STRIPE_SECRET_KEY') : Deno.env.get('STRIPE_SECRET_KEYtest');
const stripe = new Stripe(stripeSecretKey);

console.log(`🔐 STRIPE WEBHOOK: ${IS_PRODUCTION ? '🔴 LIVE' : '🟢 TEST'} MODE`);

// ── Retry helper (immediate retries for transient errors) ──────────────────
async function retryOperation(operation, maxRetries = 3, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      console.error(`Retry ${i + 1}/${maxRetries}:`, err.message);
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
}

// ── Slow retry: every 60s for up to 5 minutes ─────────────────────────────
async function retrySlowOnFailure(operation, base44, userEmail, context) {
  const maxAttempts = 5;
  const intervalMs = 60 * 1000;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await operation();
      console.log(`✅ Slow retry succeeded on attempt ${i + 1}`);
      return true;
    } catch (err) {
      console.error(`Slow retry ${i + 1}/${maxAttempts} failed:`, err.message);
      if (i < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, intervalMs));
      } else {
        // All retries failed — alert admin
        await logAdminAlert(base44, 'payment_error', 'critical',
          `CRITICAL: All retries failed for ${userEmail}. Manual action needed. Error: ${err.message}`,
          userEmail, context);
        return false;
      }
    }
  }
}

// ── Log admin alert ────────────────────────────────────────────────────────
async function logAdminAlert(base44, alertType, severity, message, userEmail, metadata) {
  try {
    await base44.asServiceRole.entities.AdminAlert.create({
      alert_type: alertType,
      severity,
      message,
      user_email: userEmail,
      metadata: JSON.stringify(metadata),
      resolved: false
    });
    console.log(`🚨 Admin alert logged: ${severity} — ${message}`);
  } catch (err) {
    console.error('Failed to log admin alert:', err);
  }
}

// ── Send Gemini 3 Flash 2-sentence confirmation email ──────────────────────
async function sendConfirmationEmail(base44, userEmail, userName, productName) {
  try {
    const emailBody = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a 2-sentence confirmation email for ${userName}. Tell them their ${productName} pack is now live and they are ready to God-Mode their job search. Be energetic and professional.`,
      model: 'gemini_3_flash'
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: `🚀 Vault Secured! Your ${productName} is Live`,
      body: typeof emailBody === 'string' ? emailBody : JSON.stringify(emailBody)
    });

    console.log(`✅ Confirmation email sent to ${userEmail}`);
  } catch (err) {
    console.error('Failed to send confirmation email:', err.message);
  }
}

// ── Find user in Users table by email ─────────────────────────────────────
async function findUser(base44, email) {
  if (!email) return null;
  const users = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase().trim() });
  return users[0] || null;
}

// ── Get or create subscription record (handles both created_by and user_email) ──
async function getOrCreateSubscription(base44, userEmail, customerId) {
  const emailNorm = userEmail.toLowerCase().trim();

  // Check by created_by first (user-created), then user_email (admin-created)
  let subs = await base44.asServiceRole.entities.UserSubscription.filter({ created_by: emailNorm });
  if (!subs || subs.length === 0) {
    subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: emailNorm });
  }

  if (subs && subs.length > 0) {
    // Always refresh stripe_customer_id if we have it
    if (customerId && !subs[0].stripe_customer_id) {
      await base44.asServiceRole.entities.UserSubscription.update(subs[0].id, {
        stripe_customer_id: customerId
      });
    }
    return subs[0];
  }

  // Create new subscription record
  const newSub = await base44.asServiceRole.entities.UserSubscription.create({
    user_email: emailNorm,
    stripe_customer_id: customerId,
    subscription_status: 'free',
    subscription_tier: 'free',
    ai_tasks_used: 0,
    credits_balance: 0,
    is_manual_override: false
  });
  console.log(`📋 Created subscription record for: ${emailNorm}`);
  return newSub;
}

// ── Detect product type from line items ───────────────────────────────────
function detectProduct(productName, purchaseType, itemId) {
  const name = (productName || '').toLowerCase();
  const item = (itemId || '').toLowerCase();

  if (name.includes('premium elite') || name.includes('elite') || item.includes('elite')) {
    return { type: 'premium_elite', productName: 'Premium Elite' };
  }

  const creditMatch = name.match(/(\d+)\s*credit/i) || item.match(/credits_(\d+)/i);
  if (creditMatch || purchaseType === 'credits') {
    const amount = parseInt(creditMatch?.[1] || '0');
    const knownAmounts = { credits_50: 50, credits_150: 150, credits_400: 400, credits_1000: 1000 };
    const credits = amount || knownAmounts[item] || 0;
    return { type: 'credits', credits, productName: `${credits} Credits Pack` };
  }

  if (name.includes('pro') || purchaseType === 'subscription') {
    return { type: 'subscription_pro', productName: 'Pro Plan' };
  }

  return { type: 'addon', productName: productName || itemId || 'Premium Addon' };
}

// ═══════════════════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log('📨 Webhook event:', event.type);

    // ══════════════════════════════════════════════════════════════════════
    // CHECKOUT.SESSION.COMPLETED — Main fulfillment logic
    // ══════════════════════════════════════════════════════════════════════
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // 1. Identify user: customer_email → receipt_email → metadata
      const rawEmail = session.customer_details?.email
        || session.customer_email
        || session.metadata?.user_email;

      if (!rawEmail) {
        console.error('❌ No email found in session');
        await logAdminAlert(base44, 'payment_error', 'high', 'No user email in checkout session', null, { sessionId: session.id });
        return Response.json({ received: true });
      }

      const userEmail = rawEmail.toLowerCase().trim();
      const userName = session.customer_details?.name || userEmail.split('@')[0];
      const purchaseType = session.metadata?.purchase_type || '';
      const itemId = session.metadata?.item_id || '';

      console.log(`💳 Payment: ${userEmail} | type: ${purchaseType} | item: ${itemId}`);

      // Check if user exists in Users table; log alert if not (but still proceed)
      const existingUser = await findUser(base44, userEmail);
      if (!existingUser) {
        console.warn(`⚠️ No user account found for ${userEmail} — proceeding with subscription record only`);
        await logAdminAlert(base44, 'sync_error', 'medium',
          `Payment received but no matching user account for: ${userEmail}`,
          userEmail, { sessionId: session.id, purchaseType, itemId });
      }

      // 2. Get or create subscription record
      let userSub;
      try {
        userSub = await retryOperation(() => getOrCreateSubscription(base44, userEmail, session.customer));
      } catch (err) {
        console.error('❌ Failed to get/create subscription:', err);
        await logAdminAlert(base44, 'payment_error', 'critical',
          `Failed to process payment for ${userEmail}: ${err.message}`,
          userEmail, { sessionId: session.id });
        return Response.json({ received: true });
      }

      // 3. Get product name from line items if available
      let productNameFromStripe = itemId;
      try {
        if (session.id) {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          productNameFromStripe = lineItems.data[0]?.description || lineItems.data[0]?.price?.product?.name || itemId;
        }
      } catch (_e) {
        // Non-critical — fall back to itemId
      }

      const product = detectProduct(productNameFromStripe, purchaseType, itemId);
      console.log(`🎯 Detected product: ${product.type} — ${product.productName}`);

      // 4. FULFILL based on product type
      const now = new Date().toISOString();

      // ── PREMIUM ELITE ────────────────────────────────────────────────────
      if (product.type === 'premium_elite') {
        const fulfillElite = async () => {
          await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
            subscription_tier: 'Premium Elite',
            subscription_status: 'elite',
            is_manual_override: false,
            credits_balance: 9999,
            stripe_customer_id: session.customer,
            subscription_id: session.subscription || null,
            last_reset_date: now.split('T')[0]
          });
          console.log(`✅ Premium Elite granted to ${userEmail} with 9999 credits`);
        };

        try {
          await retryOperation(fulfillElite);
        } catch (err) {
          await retrySlowOnFailure(fulfillElite, base44, userEmail, { sessionId: session.id, product: 'Premium Elite' });
        }
        await sendConfirmationEmail(base44, userEmail, userName, 'Premium Elite');
      }

      // ── CREDITS PACK ─────────────────────────────────────────────────────
      else if (product.type === 'credits' && product.credits > 0) {
        const fulfillCredits = async () => {
          // Always re-fetch fresh balance to guarantee increment (never overwrite)
          let fresh = await base44.asServiceRole.entities.UserSubscription.filter({ created_by: userEmail });
          if (!fresh || fresh.length === 0) {
            fresh = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: userEmail });
          }
          const currentBalance = fresh[0]?.credits_balance || 0;
          const newBalance = currentBalance + product.credits;

          await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
            credits_balance: newBalance,
            stripe_customer_id: session.customer,
            is_manual_override: false
          });

          // Log transaction (use asServiceRole, store user_email for RLS)
          await base44.asServiceRole.entities.CreditTransaction.create({
            user_email: userEmail,
            credits_amount: product.credits,
            transaction_type: 'purchase',
            description: `Purchased ${product.credits} credits via Stripe`,
            payment_id: session.id,
            balance_after: newBalance,
            feature_used: 'credit_purchase'
          });

          console.log(`✅ ${product.credits} credits added. ${userEmail}: ${currentBalance} → ${newBalance}`);
        };

        try {
          await retryOperation(fulfillCredits);
        } catch (err) {
          await retrySlowOnFailure(fulfillCredits, base44, userEmail, { sessionId: session.id, credits: product.credits });
        }
        await sendConfirmationEmail(base44, userEmail, userName, product.productName);
      }

      // ── PRO/ELITE SUBSCRIPTION ───────────────────────────────────────────
      else if (product.type === 'subscription_pro' || session.mode === 'subscription') {
        const planName = itemId.toLowerCase().includes('elite') ? 'Elite' : 'Pro';
        const newStatus = planName.toLowerCase();

        const fulfillSub = async () => {
          await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
            subscription_status: newStatus,
            subscription_tier: planName === 'Elite' ? 'Premium Elite' : 'free',
            stripe_customer_id: session.customer,
            subscription_id: session.subscription || null,
            is_manual_override: false
          });
          console.log(`✅ Subscription ${planName} activated for ${userEmail}`);
        };

        try {
          await retryOperation(fulfillSub);
        } catch (err) {
          await retrySlowOnFailure(fulfillSub, base44, userEmail, { sessionId: session.id, plan: planName });
        }
        await sendConfirmationEmail(base44, userEmail, userName, `${planName} Plan`);
      }

      // ── ADDON ────────────────────────────────────────────────────────────
      else if (session.mode === 'payment' && itemId) {
        const addonNames = {
          interview_mastery: 'Interview Mastery Bundle',
          executive_resume: 'Executive Resume Package',
          salary_master: 'Salary Mastery Course',
          portfolio_pro: 'Portfolio Website Pro'
        };
        const addonLabel = addonNames[itemId] || product.productName;

        const fulfillAddon = async () => {
          await base44.asServiceRole.entities.PremiumAddon.create({
            created_by: userEmail,
            addon_id: itemId,
            addon_name: addonLabel,
            price: 0,
            purchase_date: now.split('T')[0],
            status: 'active'
          });
          const currentAddons = userSub.premium_addons || '';
          const arr = currentAddons ? currentAddons.split(',').filter(Boolean) : [];
          if (!arr.includes(itemId)) {
            arr.push(itemId);
            await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
              premium_addons: arr.join(','),
              is_manual_override: false
            });
          }
          console.log(`✅ Addon ${itemId} granted to ${userEmail}`);
        };

        try {
          await retryOperation(fulfillAddon);
        } catch (err) {
          await retrySlowOnFailure(fulfillAddon, base44, userEmail, { sessionId: session.id, addon: itemId });
        }
        await sendConfirmationEmail(base44, userEmail, userName, addonLabel);
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // SUBSCRIPTION UPDATED / CANCELLED
    // ══════════════════════════════════════════════════════════════════════
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const stripeSub = event.data.object;
      const customerId = stripeSub.customer;

      const userSubs = await base44.asServiceRole.entities.UserSubscription.filter({ stripe_customer_id: customerId });
      if (userSubs.length > 0) {
        const record = userSubs[0];

        // CRITICAL: Never downgrade a manually overridden account
        if (record.is_manual_override === true) {
          console.log(`🔒 Manual override active for ${customerId} — skipping Stripe status change`);
        } else {
          const updates = {};
          if (event.type === 'customer.subscription.deleted' || stripeSub.status === 'canceled') {
            updates.subscription_status = 'free';
            updates.subscription_tier = 'free';
            updates.subscription_id = null;
            console.log(`✅ Subscription cancelled for customer: ${customerId}`);
          } else if (stripeSub.status === 'active' || stripeSub.status === 'trialing') {
            updates.subscription_id = stripeSub.id;
            console.log(`✅ Subscription renewed/updated for customer: ${customerId}`);
          } else if (stripeSub.status === 'past_due' || stripeSub.status === 'unpaid') {
            updates.subscription_status = 'free';
            updates.subscription_tier = 'free';
            console.log(`⚠️ Subscription past_due, downgrading: ${customerId}`);
          }
          if (Object.keys(updates).length > 0) {
            await base44.asServiceRole.entities.UserSubscription.update(record.id, updates);
          }
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // INVOICE PAYMENT SUCCEEDED (renewal)
    // ══════════════════════════════════════════════════════════════════════
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.billing_reason === 'subscription_cycle') {
        console.log(`✅ Subscription renewal confirmed for customer: ${invoice.customer}`);
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return Response.json({ error: err.message }, { status: 400 });
  }
});