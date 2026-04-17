import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

let stripePromise = null;

const getStripeKey = async () => {
  if (stripePromise) return stripePromise;
  
  try {
    const response = await base44.functions.invoke('getStripePublicKey', {});
    const key = response.data?.publicKey;
    if (key) {
      stripePromise = loadStripe(key);
      return stripePromise;
    }
  } catch (error) {
    console.error('Failed to fetch Stripe key:', error);
  }
  return null;
};

export default function StripeSubscription({ 
  priceId,
  planName,
  planId,
  onSuccess,
  onError,
  label = "Subscribe",
  variant = "default",
  className = ""
}) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      toast.loading('🔐 Connecting to Stripe...', { id: 'stripe-sub', duration: 10000 });
      
      const stripe = await getStripeKey();

      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Create subscription checkout session
      const response = await base44.functions.invoke('createStripeSubscription', {
        priceId,
        planName,
        planId,
        successUrl: `${window.location.origin}/Dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/Pricing?subscription=cancelled`
      });

      if (!response.data || !response.data.sessionId) {
        throw new Error('Failed to create subscription session');
      }

      const { sessionId } = response.data;
      toast.success('✅ Redirecting to secure checkout...', { id: 'stripe-sub' });

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('❌ Subscription failed', {
        id: 'stripe-sub',
        description: error.message || 'Unable to create subscription'
      });
      if (onError) onError(error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}