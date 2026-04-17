import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

// ============================================
// STRIPE SAFETY SWITCH - CRITICAL CONFIGURATION
// ============================================
// Change IS_PRODUCTION to true ONLY when ready for real customers
const IS_PRODUCTION = false;

const STRIPE_TEST_KEY = Deno.env.get('STRIPE_SECRET_KEYtest');
const STRIPE_LIVE_KEY = Deno.env.get('STRIPE_SECRET_KEY');

const stripeSecretKey = IS_PRODUCTION ? STRIPE_LIVE_KEY : STRIPE_TEST_KEY;
const stripe = new Stripe(stripeSecretKey);

console.log(`🔐 STRIPE CHECKOUT RUNNING IN ${IS_PRODUCTION ? '🔴 LIVE' : '🟢 TEST'} MODE`);
console.log(`Stripe initialized with key: ${stripeSecretKey?.substring(0, 12)}... (${IS_PRODUCTION ? 'sk_live_' : 'sk_test_'})`);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description, successUrl, cancelUrl, purchaseType, itemId } = await req.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Purchase',
            },
            unit_amount: amount,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        purchase_type: purchaseType || 'addon',
        item_id: itemId || 'unknown',
      },
    });

    return Response.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});