import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  Circle, 
  CreditCard, 
  ExternalLink, 
  Copy, 
  AlertCircle,
  Zap,
  Code,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const StepCard = ({ number, title, completed, children }) => (
  <Card className={`mb-4 ${completed ? 'border-green-200 bg-green-50' : ''}`}>
    <CardHeader>
      <div className="flex items-center gap-3">
        {completed ? (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {number}
          </div>
        )}
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const CodeBlock = ({ code, language = 'bash' }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
        onClick={copyToClipboard}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default function PaymentSetupGuide() {
  const [activeTab, setActiveTab] = useState('stripe');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Integration Setup Guide</h1>
        <p className="text-slate-600">Step-by-step instructions to integrate Stripe, PayPal, and Papy payments</p>
      </div>

      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <p className="font-semibold mb-1">Before You Start:</p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li>Choose which payment provider you want to use (you can integrate multiple)</li>
            <li>Have your business information ready for account creation</li>
            <li>Test in sandbox/test mode before going live</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="stripe">
            <CreditCard className="w-4 h-4 mr-2" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="paypal">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.763-4.46z"/>
            </svg>
            PayPal
          </TabsTrigger>
          <TabsTrigger value="papy">
            <Zap className="w-4 h-4 mr-2" />
            Papy
          </TabsTrigger>
        </TabsList>

        {/* STRIPE SETUP */}
        <TabsContent value="stripe">
          <StepCard number={1} title="Create Stripe Account">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Sign up for a Stripe account to accept payments.</p>
              <Button asChild>
                <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Create Stripe Account
                </a>
              </Button>
            </div>
          </StepCard>

          <StepCard number={2} title="Get Your API Keys">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Navigate to: <strong>Dashboard → Developers → API keys</strong>
              </p>
              <ul className="text-sm text-slate-600 space-y-2 ml-4 list-disc">
                <li>Copy your <strong>Publishable key</strong> (starts with pk_test_ or pk_live_)</li>
                <li>Copy your <strong>Secret key</strong> (starts with sk_test_ or sk_live_)</li>
                <li>⚠️ Keep your Secret key private - never expose it in frontend code</li>
              </ul>
              <Button asChild variant="outline">
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get API Keys
                </a>
              </Button>
            </div>
          </StepCard>

          <StepCard number={3} title="Add Environment Variables">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Add these to your environment configuration:</p>
              <CodeBlock code={`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here`} />
              <p className="text-xs text-amber-600 mt-2">⚠️ Never expose STRIPE_SECRET_KEY in frontend code - keep it backend only</p>
            </div>
          </StepCard>

          <StepCard number={4} title="Install Stripe Libraries">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">The Stripe libraries are already installed:</p>
              <CodeBlock code={`@stripe/stripe-js
@stripe/react-stripe-js`} />
            </div>
          </StepCard>

          <StepCard number={5} title="Use Stripe Components">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Import and use in your pages:</p>
              <CodeBlock code={`import StripeCheckout from '../components/pricing/StripeCheckout';

// One-time payment
<StripeCheckout
  amount={49.99}
  description="Premium Plan"
  onSuccess={(session) => {
    console.log('Payment successful!', session);
  }}
/>`} language="jsx" />
            </div>
          </StepCard>

          <StepCard number={6} title="Test Your Integration">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Use Stripe test cards:</p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Test Card Numbers:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>✅ Success: <code className="bg-white px-2 py-0.5 rounded">4242 4242 4242 4242</code></li>
                  <li>❌ Declined: <code className="bg-white px-2 py-0.5 rounded">4000 0000 0000 0002</code></li>
                  <li>🔄 3D Secure: <code className="bg-white px-2 py-0.5 rounded">4000 0027 6000 3184</code></li>
                </ul>
                <p className="text-xs text-slate-500 mt-2">Use any future expiry date and any 3-digit CVC</p>
              </div>
              <Button asChild variant="outline">
                <a href="/TestPayment">
                  <Code className="w-4 h-4 mr-2" />
                  Test Stripe Integration
                </a>
              </Button>
            </div>
          </StepCard>

          <StepCard number={7} title="Go Live (Production)">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Before accepting real payments:</p>
              <ul className="text-sm text-slate-600 space-y-2 ml-4 list-disc">
                <li>Complete your Stripe account verification</li>
                <li>Switch to live API keys (pk_live_ and sk_live_)</li>
                <li>Set up webhooks for payment notifications</li>
                <li>Enable payment methods you want to accept</li>
              </ul>
            </div>
          </StepCard>
        </TabsContent>

        {/* PAYPAL SETUP */}
        <TabsContent value="paypal">
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              <strong>Quick Start:</strong> If you already have a PayPal Business account, you can skip to Step 2. Otherwise, start with Step 1.
            </AlertDescription>
          </Alert>

          <StepCard number={1} title="Create PayPal Business Account">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                First, you need a PayPal Business account (different from personal PayPal).
              </p>
              <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                <li>Go to <a href="https://www.paypal.com/bizsignup" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PayPal Business Signup</a></li>
                <li>Select "Business Account"</li>
                <li>Enter your business information</li>
                <li>Verify your email and phone number</li>
                <li>Complete identity verification</li>
              </ol>
            </div>
          </StepCard>

          <StepCard number={2} title="Access PayPal Developer Dashboard">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Now go to the developer portal to get your API credentials.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open PayPal Developer Dashboard
                </a>
              </Button>
              <p className="text-xs text-slate-500">Log in with your PayPal Business account credentials</p>
            </div>
          </StepCard>

          <StepCard number={3} title="Create a REST API App">
            <div className="space-y-3">
              <p className="text-sm text-slate-600 font-semibold">In the Developer Dashboard:</p>
              <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                <li>Click <strong>"Apps & Credentials"</strong> in the top menu</li>
                <li>Make sure you're on the <strong>"Sandbox"</strong> tab (for testing)</li>
                <li>Click the blue <strong>"Create App"</strong> button</li>
                <li>Enter an app name (e.g., "ApplyAI Payment")</li>
                <li>Select your sandbox business account from dropdown</li>
                <li>Click <strong>"Create App"</strong></li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                💡 <strong>Tip:</strong> Start with Sandbox (test mode) to safely test payments without real money.
              </div>
            </div>
          </StepCard>

          <StepCard number={4} title="Copy Your Client ID">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">After creating the app, you'll see your credentials:</p>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">On the app details page:</p>
                <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                  <li>Find <strong>"Client ID"</strong> - this is your public key</li>
                  <li>Click the <strong>"Show"</strong> button next to Secret to reveal it (you'll need this for backend later)</li>
                  <li>Copy your <strong>Client ID</strong></li>
                </ol>
              </div>
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-900 text-xs">
                  ⚠️ You're currently in <strong>Sandbox mode</strong> - these are test credentials. For production, switch to "Live" tab and create another app.
                </AlertDescription>
              </Alert>
            </div>
          </StepCard>

          <StepCard number={5} title="Add Client ID to Your App">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Add your PayPal Client ID as an environment variable in your app settings:
              </p>
              <CodeBlock code={`VITE_PAYPAL_CLIENT_ID=your_client_id_here`} />
              <p className="text-xs text-slate-500">
                Go to App Settings → Secrets to add this variable
              </p>
            </div>
          </StepCard>

          <StepCard number={6} title="Test with Sandbox Account">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                PayPal provides test accounts to simulate payments:
              </p>
              <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                <li>In Developer Dashboard, go to <strong>"Sandbox → Accounts"</strong></li>
                <li>You'll see pre-created Personal and Business test accounts</li>
                <li>Click on a Personal account and view the email/password</li>
                <li>Use these credentials when testing payments</li>
              </ol>
              <div className="bg-slate-50 rounded-lg p-4 text-sm mt-3">
                <p className="font-semibold mb-2">Typical Sandbox Account:</p>
                <ul className="space-y-1 text-slate-600 text-xs">
                  <li>📧 Email: <code className="bg-white px-2 py-0.5 rounded">sb-xxxxx@personal.example.com</code></li>
                  <li>🔐 Password: Click "View" to see it</li>
                  <li>💰 Balance: $9,999.99 (fake money for testing)</li>
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full sm:w-auto mt-3">
                <a href="/TestPayPal">
                  <Code className="w-4 h-4 mr-2" />
                  Go to Test Page
                </a>
              </Button>
            </div>
          </StepCard>

          <StepCard number={7} title="Test a Payment">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Now test your integration:</p>
              <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                <li>Go to the <strong>TestPayPal</strong> page</li>
                <li>Enter an amount and description</li>
                <li>Click <strong>"Pay with PayPal"</strong></li>
                <li>You'll be redirected to PayPal's checkout</li>
                <li>Log in with your <strong>sandbox Personal account</strong> credentials</li>
                <li>Complete the payment</li>
                <li>You'll be redirected back with success message</li>
              </ol>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-900 mt-3">
                ✅ <strong>Success!</strong> If payment works, you've successfully integrated PayPal!
              </div>
            </div>
          </StepCard>

          <StepCard number={8} title="(Optional) Set Up Subscriptions">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">For recurring monthly/yearly payments:</p>
              <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                <li>In Developer Dashboard, go to <strong>"Sandbox → Products & Plans"</strong></li>
                <li>Click <strong>"Create Product"</strong></li>
                <li>Enter product name, type, and category</li>
                <li>Create product, then click <strong>"Add Plan"</strong></li>
                <li>Set billing cycle (monthly/yearly) and price</li>
                <li>Save and copy the <strong>Plan ID</strong> (starts with P-)</li>
                <li>Use this Plan ID in the <code className="bg-slate-100 px-1 rounded">PayPalSubscription</code> component</li>
              </ol>
            </div>
          </StepCard>

          <StepCard number={9} title="Go Live (Production)">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">When ready for real payments:</p>
              <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                <li>In Developer Dashboard, switch to <strong>"Live"</strong> tab</li>
                <li>Create a new app (same as Step 3, but on Live tab)</li>
                <li>Copy the <strong>Live Client ID</strong></li>
                <li>Replace sandbox Client ID with Live Client ID in your code</li>
                <li>Complete PayPal Business account verification if not done</li>
                <li>Test one more time with a real (small amount) payment</li>
              </ol>
              <Alert className="border-red-200 bg-red-50 mt-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-900 text-xs">
                  ⚠️ <strong>Important:</strong> Live mode uses real money. Make sure everything works perfectly in Sandbox first!
                </AlertDescription>
              </Alert>
            </div>
          </StepCard>

          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm text-blue-900 mb-3">Quick Reference - Using PayPal Components</h4>
              <CodeBlock code={`// One-time payment
import PayPalCheckout from '../components/pricing/PayPalCheckout';

<PayPalCheckout
  amount={29.99}
  description="Premium Plan Purchase"
  onSuccess={(order) => {
    console.log('Payment successful!', order);
    // Save to database, update user, etc.
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
/>

// Subscription payment
import PayPalSubscription from '../components/pricing/PayPalSubscription';

<PayPalSubscription
  planId="P-1AB23456CD789012E"
  onSuccess={(data) => {
    console.log('Subscription active!', data);
    // Update user subscription status
  }}
/>`} language="jsx" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAPY SETUP */}
        <TabsContent value="papy">
          <StepCard number={1} title="Create Papy Account">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Sign up for a Papy merchant account.</p>
              <Button asChild>
                <a href="https://papy.co/signup" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Create Papy Account
                </a>
              </Button>
            </div>
          </StepCard>

          <StepCard number={2} title="Get API Keys">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Navigate to <strong>Settings → API Keys</strong></p>
              <ul className="text-sm text-slate-600 space-y-2 ml-4 list-disc">
                <li>Copy your <strong>Public Key</strong></li>
                <li>Copy your <strong>Secret Key</strong> (keep this private)</li>
              </ul>
            </div>
          </StepCard>

          <StepCard number={3} title="Add Environment Variable">
            <div className="space-y-3">
              <CodeBlock code={`VITE_PAPY_PUBLIC_KEY=your_public_key_here`} />
              <p className="text-xs text-amber-600 mt-2">⚠️ Never expose PAPY_SECRET_KEY in frontend code - keep it backend only</p>
            </div>
          </StepCard>

          <StepCard number={4} title="Configure Webhooks">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Set up webhook endpoints to receive payment notifications:</p>
              <ol className="text-sm text-slate-600 space-y-2 ml-4 list-decimal">
                <li>Go to <strong>Developers → Webhooks</strong></li>
                <li>Add endpoint URL: <code className="bg-slate-100 px-2 py-0.5 rounded">https://yourdomain.com/api/webhooks/papy</code></li>
                <li>Select events: payment.succeeded, payment.failed, subscription.created, etc.</li>
              </ol>
            </div>
          </StepCard>

          <StepCard number={5} title="Use Papy Components">
            <div className="space-y-3">
              <CodeBlock code={`import PapyCheckout from '../components/pricing/PapyCheckout';

// One-time payment
<PapyCheckout
  amount={49.99}
  description="Premium Feature"
  onSuccess={(data) => {
    console.log('Payment successful!', data);
  }}
/>

// Subscription
import PapySubscription from '../components/pricing/PapySubscription';

<PapySubscription
  planId="plan_xyz"
  planName="Pro Plan"
  amount={29.99}
  interval="month"
  onSuccess={(data) => {
    console.log('Subscribed!', data);
  }}
/>`} language="jsx" />
            </div>
          </StepCard>

          <StepCard number={6} title="Test Integration">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Use test mode for development:</p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Test Card:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>Card: <code className="bg-white px-2 py-0.5 rounded">4242 4242 4242 4242</code></li>
                  <li>Expiry: Any future date</li>
                  <li>CVV: Any 3 digits</li>
                </ul>
              </div>
              <Button asChild variant="outline">
                <a href="/TestPapy">
                  <Code className="w-4 h-4 mr-2" />
                  Test Papy Integration
                </a>
              </Button>
            </div>
          </StepCard>

          <StepCard number={7} title="Go Live">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Before accepting real payments:</p>
              <ul className="text-sm text-slate-600 space-y-2 ml-4 list-disc">
                <li>Complete business verification</li>
                <li>Switch to live API keys</li>
                <li>Test webhook integrations</li>
                <li>Set up customer support contact</li>
              </ul>
            </div>
          </StepCard>
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card className="mt-8 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 text-indigo-900">Stripe</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>✓ Best for US/EU businesses</li>
                <li>✓ Lowest fees (2.9% + $0.30)</li>
                <li>✓ Advanced features</li>
                <li>✓ Excellent developer tools</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 text-blue-900">PayPal</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>✓ Global reach</li>
                <li>✓ Trusted brand</li>
                <li>✓ No merchant account needed</li>
                <li>✓ Buyer protection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 text-purple-900">Papy</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>✓ Fast integration</li>
                <li>✓ Flexible pricing</li>
                <li>✓ Good for startups</li>
                <li>✓ Simple dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}