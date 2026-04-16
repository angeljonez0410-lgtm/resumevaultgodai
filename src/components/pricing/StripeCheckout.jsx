import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
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

export default function StripeCheckout({ 
  priceId,
  amount,
  description,
  purchaseType,
  itemId,
  onSuccess,
  onError,
  label = "Purchase Now",
  variant = "default",
  className = ""
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      toast.loading('🔐 Preparing your checkout...', { id: 'stripe-checkout', duration: 10000 });
      
      const stripe = await getStripeKey();

      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Create checkout session via backend function
      const response = await base44.functions.invoke('createStripeCheckout', {
        amount: Math.round(amount * 100),
        description,
        purchaseType,
        itemId,
        successUrl: `${window.location.origin}/Dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/Pricing?payment=cancelled`
      });

      if (!response.data || !response.data.sessionId) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = response.data;
      toast.success('✅ Redirecting to secure payment...', { id: 'stripe-checkout' });

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('❌ Checkout failed', {
        id: 'stripe-checkout',
        description: error.message || 'Unable to process checkout'
      });
      if (onError) onError(error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}