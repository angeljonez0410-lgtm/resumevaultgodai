import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return Response.json({ error: 'Products array is required' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const product of products) {
      try {
        const { name, type, price, billingPeriod, description } = product;

        // Create Stripe product
        const stripeProduct = await stripe.products.create({
          name: name,
          description: description || '',
        });

        // Create Stripe price
        const priceData = {
          product: stripeProduct.id,
          currency: 'usd',
          unit_amount: Math.round(price * 100),
        };

        if (type === 'Subscription') {
          priceData.recurring = {
            interval: billingPeriod === 'yearly' ? 'year' : 'month',
          };
        }

        const stripePrice = await stripe.prices.create(priceData);

        results.push({
          name: name,
          productId: stripeProduct.id,
          priceId: stripePrice.id,
          success: true
        });
      } catch (error) {
        errors.push({
          name: product.name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      created: results.length,
      failed: errors.length,
      results: results,
      errors: errors
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});