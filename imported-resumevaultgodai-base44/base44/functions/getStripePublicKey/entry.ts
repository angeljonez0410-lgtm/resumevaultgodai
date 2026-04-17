import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ============================================
// STRIPE SAFETY SWITCH - CRITICAL CONFIGURATION
// ============================================
// Change IS_PRODUCTION to true ONLY when ready for real customers
const IS_PRODUCTION = false;

const STRIPE_TEST_PUBLIC_KEY = Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEYtest');
const STRIPE_LIVE_PUBLIC_KEY = Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY');

const publicKey = IS_PRODUCTION ? STRIPE_LIVE_PUBLIC_KEY : STRIPE_TEST_PUBLIC_KEY;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🔐 RETURNING ${IS_PRODUCTION ? '🔴 LIVE' : '🟢 TEST'} PUBLISHABLE KEY`);
    console.log(`Publishable key: ${publicKey?.substring(0, 12)}... (${IS_PRODUCTION ? 'pk_live_' : 'pk_test_'})`);
    
    if (!publicKey) {
      return Response.json({ error: 'Stripe key not configured' }, { status: 500 });
    }

    return Response.json({ publicKey });
  } catch (error) {
    console.error('Get Stripe key error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});