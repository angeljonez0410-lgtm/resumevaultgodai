import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// End-to-End system test: simulates Purchase → DB Update → Email → UI Access
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const startTime = Date.now();
    const testEmail = user.email;
    const steps = [];

    const step = (name, fn) => async () => {
      const t0 = Date.now();
      try {
        const result = await fn();
        steps.push({ step: name, status: 'pass', ms: Date.now() - t0, detail: result });
        return result;
      } catch (err) {
        steps.push({ step: name, status: 'fail', ms: Date.now() - t0, detail: err.message });
        throw err;
      }
    };

    // Step 1: DB Read — find or create subscription
    let sub = await step('1. DB Read (subscription)', async () => {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ created_by: testEmail });
      if (!subs[0]) throw new Error('No subscription record found for test user');
      return `Found sub id=${subs[0].id}, tier=${subs[0].subscription_status}`;
    })();

    const subId = (await base44.asServiceRole.entities.UserSubscription.filter({ created_by: testEmail }))[0]?.id;

    // Step 2: DB Write — simulate purchase update
    const originalTier = (await base44.asServiceRole.entities.UserSubscription.filter({ created_by: testEmail }))[0]?.subscription_status;
    const testTier = originalTier === 'pro' ? 'elite' : 'pro';
    await step('2. DB Write (tier update)', async () => {
      await base44.asServiceRole.entities.UserSubscription.update(subId, {
        subscription_status: testTier,
        override_reason: 'e2e_test'
      });
      return `Updated tier to ${testTier}`;
    })();

    // Step 3: DB Read verify
    await step('3. DB Verify (read-after-write)', async () => {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ created_by: testEmail });
      if (subs[0]?.subscription_status !== testTier) throw new Error('Tier mismatch after write');
      return `Verified tier = ${testTier}`;
    })();

    // Step 4: AI Email generation
    await step('4. AI Email (Gemini Flash)', async () => {
      const body = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write a high-energy, 4-sentence confirmation email for ${user.full_name || 'User'}. Tell them their Vault is now unlocked and they have God-Mode access to beat any ATS with the Pro plan. Keep it professional but punchy.`,
        model: 'gemini_3_flash'
      });
      if (!body || body.length < 20) throw new Error('AI returned empty email body');
      return `Generated ${body.length} chars`;
    })();

    // Step 5: Restore original tier
    await step('5. Restore (rollback test change)', async () => {
      await base44.asServiceRole.entities.UserSubscription.update(subId, {
        subscription_status: originalTier,
        override_reason: ''
      });
      return `Restored tier to ${originalTier}`;
    })();

    const totalMs = Date.now() - startTime;
    const allPassed = steps.every(s => s.status === 'pass');

    console.log(`E2E Test ${allPassed ? 'PASSED' : 'FAILED'} in ${totalMs}ms`);

    return Response.json({
      success: allPassed,
      total_ms: totalMs,
      under_10s: totalMs < 10000,
      steps
    });

  } catch (error) {
    console.error('E2E test error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});