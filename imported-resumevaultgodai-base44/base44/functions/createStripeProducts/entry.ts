import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const products = [
      // Subscriptions
      {
        name: 'Pro Monthly',
        amount: 2999,
        currency: 'usd',
        interval: 'month',
        metadata: { type: 'subscription', plan: 'pro_monthly' }
      },
      {
        name: 'Pro Annual',
        amount: 24999,
        currency: 'usd',
        interval: 'year',
        metadata: { type: 'subscription', plan: 'pro_annual' }
      },
      {
        name: 'Elite Monthly',
        amount: 7999,
        currency: 'usd',
        interval: 'month',
        metadata: { type: 'subscription', plan: 'elite_monthly' }
      },
      // Credits
      {
        name: '50 Credits',
        amount: 999,
        currency: 'usd',
        metadata: { type: 'credits', amount: 50 }
      },
      {
        name: '150 Credits',
        amount: 2499,
        currency: 'usd',
        metadata: { type: 'credits', amount: 150 }
      },
      {
        name: '400 Credits',
        amount: 5999,
        currency: 'usd',
        metadata: { type: 'credits', amount: 400 }
      },
      {
        name: '1000 Credits',
        amount: 12999,
        currency: 'usd',
        metadata: { type: 'credits', amount: 1000 }
      },
      // One-time purchases
      {
        name: 'Interview Mastery Bundle',
        amount: 9999,
        currency: 'usd',
        metadata: { type: 'addon', id: 'interview_mastery' }
      },
      {
        name: 'Executive Resume Package',
        amount: 19999,
        currency: 'usd',
        metadata: { type: 'addon', id: 'executive_resume' }
      },
      {
        name: 'Salary Mastery Course',
        amount: 14999,
        currency: 'usd',
        metadata: { type: 'addon', id: 'salary_master' }
      },
      {
        name: 'Portfolio Website Pro',
        amount: 29999,
        currency: 'usd',
        metadata: { type: 'addon', id: 'portfolio_pro' }
      }
    ];

    const results = [];

    for (const prod of products) {
      try {
        const stripeProduct = await stripe.products.create({
          name: prod.name,
          metadata: prod.metadata
        });

        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: prod.amount,
          currency: prod.currency,
          ...(prod.interval && {
            recurring: { interval: prod.interval }
          })
        });

        results.push({
          name: prod.name,
          productId: stripeProduct.id,
          priceId: price.id,
          amount: prod.amount,
          type: prod.metadata.type
        });
      } catch (error) {
        results.push({
          name: prod.name,
          error: error.message
        });
      }
    }

    return Response.json({ 
      success: true,
      products: results,
      message: 'Copy your Price IDs from the results above'
    });
  } catch (error) {
    console.error('Stripe product creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});