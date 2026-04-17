import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const loadPayPalScript = (clientId) => {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error('PayPal SDK failed to load'));
    document.body.appendChild(script);
  });
};

export default function PayPalSubscription({
  planId,
  planName = 'pro',
  label = "Subscribe with PayPal",
  onSuccess,
  onError,
  variant = "default",
  className = ""
}) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) {
      console.error('PayPal Client ID not configured');
      setLoading(false);
      return;
    }

    loadPayPalScript(PAYPAL_CLIENT_ID)
      .then(() => {
        setPaypalLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('PayPal SDK load error:', err);
        toast.error('Failed to load PayPal');
        setLoading(false);
      });
  }, [PAYPAL_CLIENT_ID]);

  const handleSubscribe = () => {
    if (!paypalLoaded) {
      toast.error('PayPal is not ready yet');
      return;
    }

    setProcessing(true);

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: async (data, actions) => {
        const user = await base44.auth.me();
        return actions.subscription.create({
          plan_id: planId,
          custom_id: `${user.email}|${planName}`
        });
      },
      onApprove: (data, actions) => {
        toast.success('Subscription successful!', {
          description: `Subscription ID: ${data.subscriptionID}`,
          duration: 5000
        });

        if (onSuccess) {
          onSuccess({
            subscriptionID: data.subscriptionID,
            orderID: data.orderID
          });
        }

        setProcessing(false);
      },
      onError: (err) => {
        toast.error('Subscription failed');
        console.error('PayPal subscription error:', err);
        if (onError) onError(err);
        setProcessing(false);
      },
      onCancel: () => {
        toast.info('Subscription cancelled');
        setProcessing(false);
      }
    }).render('#paypal-subscription-container');
  };

  if (loading) {
    return (
      <Button disabled variant={variant} className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }

  if (!paypalLoaded) {
    return (
      <div className="space-y-2">
        <Button 
          disabled 
          variant={variant} 
          className={className}
          onClick={() => {
            toast.error('PayPal not configured', {
              description: 'Add VITE_PAYPAL_CLIENT_ID to your environment variables. Visit /TestPayPal for setup instructions.',
              duration: 6000
            });
          }}
        >
          {!PAYPAL_CLIENT_ID ? '⚠️ Configure PayPal' : 'PayPal Unavailable'}
        </Button>
        {!PAYPAL_CLIENT_ID && (
          <p className="text-xs text-amber-600 text-center">
            Missing VITE_PAYPAL_CLIENT_ID • <a href="/TestPayPal" className="underline">Setup Guide</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={handleSubscribe}
        disabled={processing}
        variant={variant}
        className={className}
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.763-4.46z"/>
            </svg>
            {label}
          </>
        )}
      </Button>
      <div id="paypal-subscription-container"></div>
    </div>
  );
}