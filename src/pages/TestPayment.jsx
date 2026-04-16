import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Initialize Stripe from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('29.00');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // In a real app, you'd call your backend to create a payment intent
      // For testing, we'll just simulate success
      
      const cardElement = elements.getElement(CardElement);
      
      // Test card: 4242 4242 4242 4242
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Simulate successful payment
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        toast.success(`Payment of $${amount} successful!`);
      }, 1500);

    } catch (err) {
      toast.error('Payment failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-slate-600 mb-4">Amount: ${amount}</p>
        <Button onClick={() => setSuccess(false)}>Make Another Payment</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Amount (USD)</Label>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="29.00"
        />
      </div>

      <div>
        <Label>Card Details</Label>
        <div className="border rounded-lg p-3 mt-1">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Test card: 4242 4242 4242 4242 | Any future date | Any CVC
        </p>
      </div>

      <Button type="submit" disabled={!stripe || loading} className="w-full">
        <CreditCard className="w-4 h-4 mr-2" />
        {loading ? 'Processing...' : `Pay $${amount}`}
      </Button>
    </form>
  );
}

export default function TestPayment() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Test Mode Instructions:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Use test card: <code className="bg-white px-1 rounded">4242 4242 4242 4242</code></li>
                <li>Any future expiry date (e.g., 12/34)</li>
                <li>Any 3-digit CVC (e.g., 123)</li>
                <li>Any ZIP code</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Test Payment Checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Next Steps (Real Payments)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>1. Replace the publishable key</strong> in line 12 with your real Stripe key</p>
          <p><strong>2. Create a backend function</strong> to handle payment intents securely</p>
          <p><strong>3. Create products</strong> in Stripe Dashboard with Price IDs</p>
          <p><strong>4. Add webhooks</strong> to handle subscription events</p>
        </CardContent>
      </Card>
    </div>
  );
}