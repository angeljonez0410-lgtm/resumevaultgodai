import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { productName, currency = 'usd', unitAmount, billingPeriod } = await req.json();

    if (!productName || !unitAmount) {
      return Response.json({ error: 'Missing productName or unitAmount' }, { status: 400 });
    }

    // Create product
    const product = await stripe.products.create({
      name: productName,
      metadata: {
        billing_period: billingPeriod || 'one_time'
      }
    });

    // Create price for the product
    const priceData = {
      product: product.id,
      currency,
      unit_amount: Math.round(unitAmount * 100)
    };

    // Add recurring if it's a subscription
    if (billingPeriod) {
      priceData.recurring = {
        interval: billingPeriod === 'monthly' ? 'month' : billingPeriod === 'annual' ? 'year' : null
      };
      if (!priceData.recurring.interval) {
        delete priceData.recurring;
      }
    }

    const price = await stripe.prices.create(priceData);

    return Response.json({
      productId: product.id,
      priceId: price.id,
      unitAmount,
      currency
    });
  } catch (error) {
    console.error('Product creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});