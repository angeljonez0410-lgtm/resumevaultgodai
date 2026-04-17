// v2 - force redeploy
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { credits_required, feature_name, description } = await req.json();

    if (!credits_required || !feature_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user subscription
    const subscriptions = await base44.asServiceRole.entities.UserSubscription.filter({
      created_by: user.email
    });

    let subscription = subscriptions[0];

    if (!subscription) {
      // Create new subscription record
      subscription = await base44.asServiceRole.entities.UserSubscription.create({
        created_by: user.email,
        subscription_status: 'free',
        credits_balance: 0,
        ai_tasks_used: 0
      });
    }

    const tier = subscription.subscription_status || 'free';

    // Check if user has unlimited access (Pro or Elite tier)
    if (tier === 'pro' || tier === 'elite') {
      return Response.json({
        success: true,
        unlimited: true,
        message: `${tier.toUpperCase()} plan - unlimited access`
      });
    }

    // For free tier, check credits
    const currentBalance = subscription.credits_balance || 0;

    if (currentBalance < credits_required) {
      return Response.json({
        success: false,
        error: 'insufficient_credits',
        required: credits_required,
        available: currentBalance,
        message: `You need ${credits_required} credits but only have ${currentBalance}`
      }, { status: 402 });
    }

    // Deduct credits
    const newBalance = currentBalance - credits_required;

    await base44.asServiceRole.entities.UserSubscription.update(subscription.id, {
      credits_balance: newBalance
    });

    // Log transaction
    await base44.asServiceRole.entities.CreditTransaction.create({
      created_by: user.email,
      credits_amount: -credits_required,
      transaction_type: 'usage',
      description: description || `Used ${credits_required} credits for ${feature_name}`,
      balance_after: newBalance,
      feature_used: feature_name
    });

    return Response.json({
      success: true,
      unlimited: false,
      credits_deducted: credits_required,
      new_balance: newBalance,
      message: `${credits_required} credits used. Remaining: ${newBalance}`
    });

  } catch (error) {
    console.error('Credit usage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});