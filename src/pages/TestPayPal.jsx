import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import PayPalCheckout from '../components/pricing/PayPalCheckout';
import PayPalSubscription from '../components/pricing/PayPalSubscription';

export default function TestPayPal() {
  const [amount, setAmount] = useState('29.99');
  const [description, setDescription] = useState('Test Purchase');
  const [planId, setPlanId] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  const handleSuccess = (data) => {
    console.log('Payment successful:', data);
    setPaymentResult({
      success: true,
      message: 'Payment completed successfully!',
      data: data
    });
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    setPaymentResult({
      success: false,
      message: `Payment failed: ${errorMessage}`,
      error: error,
      details: 'Check browser console (F12) for more details'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Step 7: Test Your PayPal Payment Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-blue-900">
            <div>
              <p className="font-semibold mb-2">🔧 Before Testing - Required Setup:</p>
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  <strong>Get PayPal Sandbox Credentials:</strong>
                  <ul className="list-disc ml-5 mt-1 text-xs space-y-1">
                    <li>Go to <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">PayPal Developer Dashboard</a></li>
                    <li>Login with your PayPal account</li>
                    <li>Navigate to "Sandbox" → "Accounts"</li>
                    <li>You'll see TWO accounts: Business (merchant) and Personal (buyer)</li>
                    <li>Click "View/Edit" on the PERSONAL account to see the test email/password</li>
                  </ul>
                </li>
                <li>
                  <strong>Get Your Client ID:</strong>
                  <ul className="list-disc ml-5 mt-1 text-xs space-y-1">
                    <li>Go to "Apps & Credentials" tab</li>
                    <li>Under "Sandbox", you'll see your app or create one</li>
                    <li>Copy the "Client ID" (starts with something like "AZ...")</li>
                  </ul>
                </li>
                <li>
                  <strong>Add to Environment Variables:</strong>
                  <ul className="list-disc ml-5 mt-1 text-xs">
                    <li>Add in your app settings: <code className="bg-white px-1.5 py-0.5 rounded font-mono">PAYPAL_CLIENT_ID=your_client_id_here</code></li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="border-t border-blue-300 pt-3">
              <p className="font-semibold mb-2">✅ Testing Steps (Follow Exactly):</p>
              <ol className="list-decimal ml-5 space-y-2">
                <li><strong>Enter amount below</strong> (e.g., $29.99)</li>
                <li><strong>Click "Pay with PayPal"</strong> button</li>
                <li><strong>You'll be redirected to PayPal</strong> - this is NORMAL, don't panic</li>
                <li><strong>Login with your SANDBOX PERSONAL ACCOUNT credentials</strong>
                  <ul className="list-disc ml-5 mt-1 text-xs">
                    <li>NOT your real PayPal account!</li>
                    <li>Use the test email from PayPal Developer Dashboard (usually sb-xxxxx@personal.example.com)</li>
                    <li>Use the test password (default is usually "Test1234" or shown in dashboard)</li>
                  </ul>
                </li>
                <li><strong>Complete the payment</strong> in the PayPal popup/page</li>
                <li><strong>You'll be redirected back</strong> to this page</li>
                <li><strong>Success message will appear</strong> above if everything worked</li>
              </ol>
            </div>

            <div className="border-t border-blue-300 pt-3">
              <p className="font-semibold mb-2 text-red-700">⚠️ Common Issues & Fixes:</p>
              <ul className="list-disc ml-5 space-y-2 text-xs">
                <li><strong>PayPal button doesn't appear:</strong> Make sure PAYPAL_CLIENT_ID is set in environment variables</li>
                <li><strong>Can't login to PayPal:</strong> Use SANDBOX credentials from Developer Dashboard, NOT your real PayPal</li>
                <li><strong>Payment fails:</strong> Ensure you're using the Personal/Buyer sandbox account, not Business</li>
                <li><strong>"Invalid Client ID" error:</strong> Double-check you copied the full Client ID and it's from Sandbox (not Live)</li>
                <li><strong>Redirect doesn't work:</strong> Check browser console for errors (F12)</li>
                <li><strong>Amount is $0:</strong> Enter a valid amount in the field below before clicking Pay</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {paymentResult && (
        <Alert className={`mb-6 ${paymentResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {paymentResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription className={paymentResult.success ? 'text-green-800' : 'text-red-800'}>
            <p className="font-semibold">{paymentResult.message}</p>
            {paymentResult.data && (
              <p className="text-xs mt-1">Order ID: {paymentResult.data.id || paymentResult.data.subscriptionID}</p>
            )}
            {paymentResult.details && (
              <p className="text-xs mt-1">{paymentResult.details}</p>
            )}
            {!paymentResult.success && (
              <div className="mt-2 text-xs">
                <p className="font-medium">Troubleshooting:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li>Check that PAYPAL_CLIENT_ID is set correctly</li>
                  <li>Verify you're using Sandbox credentials</li>
                  <li>Make sure amount is greater than $0</li>
                  <li>Open browser console (F12) to see detailed error</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="one-time" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="one-time">One-Time Payment</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="one-time">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Test One-Time Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Amount (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="29.99"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this payment for?"
                  className="mt-1.5"
                />
              </div>

              <PayPalCheckout
                amount={parseFloat(amount) || 0}
                description={description}
                onSuccess={handleSuccess}
                onError={handleError}
                label={`Pay $${amount} with PayPal`}
                className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
              />

              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-xs">
                <p className="font-semibold mb-2 text-amber-900">🔑 Sandbox Login Credentials:</p>
                <p className="text-amber-800 mb-1">You MUST get these from PayPal Developer Dashboard:</p>
                <ol className="list-decimal ml-4 space-y-1 text-amber-800">
                  <li>Go to <a href="https://developer.paypal.com/dashboard/accounts" target="_blank" className="underline">developer.paypal.com/dashboard/accounts</a></li>
                  <li>Find your PERSONAL (Buyer) sandbox account</li>
                  <li>Click "View/Edit Account" to see email and password</li>
                  <li>Use those credentials when PayPal asks you to login</li>
                </ol>
                <p className="mt-2 text-amber-700 font-medium">⚠️ Default example credentials (may not work for you):</p>
                <p className="text-amber-700">Email: sb-xxxxx@personal.example.com</p>
                <p className="text-amber-700">Password: (shown in your dashboard)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Test Subscription Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>PayPal Plan ID</Label>
                <Input
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  placeholder="P-XXXXXXXXXXXXXXXXXXXX"
                  className="mt-1.5"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Create a subscription plan in PayPal Dashboard and paste the Plan ID here
                </p>
              </div>

              <PayPalSubscription
                planId={planId}
                onSuccess={handleSuccess}
                onError={handleError}
                label="Subscribe with PayPal"
                className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
              />

              <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600">
                <p className="font-semibold mb-2">Setup Steps:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to PayPal Developer Dashboard</li>
                  <li>Create a Product and Subscription Plan</li>
                  <li>Copy the Plan ID and paste above</li>
                  <li>Test with sandbox credentials</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-semibold mb-1">1. Environment Setup</p>
            <p className="text-slate-600">Add to your environment variables:</p>
            <code className="block bg-slate-100 p-2 rounded mt-1 text-xs">
              PAYPAL_CLIENT_ID=your_client_id_here
            </code>
          </div>

          <div>
            <p className="font-semibold mb-1">2. Usage Examples</p>
            <code className="block bg-slate-100 p-2 rounded text-xs whitespace-pre">
{`// One-time payment
<PayPalCheckout
  amount={29.99}
  description="Premium Plan"
  onSuccess={(order) => console.log(order)}
/>

// Subscription
<PayPalSubscription
  planId="P-XXXXX"
  onSuccess={(data) => console.log(data)}
/>`}
            </code>
          </div>

          <div>
            <p className="font-semibold mb-1">3. Webhook Setup (Production)</p>
            <p className="text-slate-600">Configure webhooks in PayPal to handle:</p>
            <ul className="list-disc ml-4 mt-1 text-xs text-slate-600">
              <li>Payment capture completed</li>
              <li>Subscription created</li>
              <li>Subscription cancelled</li>
              <li>Payment failed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}