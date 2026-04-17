import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink, Copy, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PayPalSetup() {
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          PayPal Setup Guide
        </h1>
        <p className="text-lg text-slate-600">Follow these steps to accept payments with PayPal</p>
      </div>

      <Alert className="mb-8 bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-900">
          <strong>⏱️ Time needed:</strong> 10-15 minutes &nbsp;|&nbsp; <strong>💰 Cost:</strong> Free to setup
        </AlertDescription>
      </Alert>

      {/* Step 1 */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              1
            </div>
            <CardTitle>Create PayPal Business Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-700">
            You need a PayPal Business account (not a personal account) to accept payments.
          </p>
          
          <div className="bg-slate-50 rounded-lg p-4 border">
            <p className="font-semibold mb-2">📝 Steps:</p>
            <ol className="space-y-2 text-sm text-slate-700 ml-4 list-decimal">
              <li>Click the button below to open PayPal Business signup</li>
              <li>Select <strong>"Business Account"</strong></li>
              <li>Fill in your business details</li>
              <li>Verify your email and phone</li>
              <li>Complete identity verification (may take 1-2 days)</li>
            </ol>
          </div>

          <Button size="lg" className="w-full sm:w-auto" asChild>
            <a href="https://www.paypal.com/bizsignup" target="_blank" rel="noopener noreferrer">
              Create PayPal Business Account
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>

          <p className="text-xs text-slate-500">
            💡 Already have a PayPal Business account? Skip to Step 2
          </p>
        </CardContent>
      </Card>

      {/* Step 2 */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
              2
            </div>
            <CardTitle>Open Developer Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-700">
            Go to PayPal's developer portal to get your API keys.
          </p>

          <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700" asChild>
            <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer">
              Open Developer Dashboard
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>

          <p className="text-sm text-slate-600">
            🔑 Log in with your PayPal Business account credentials
          </p>
        </CardContent>
      </Card>

      {/* Step 3 */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              3
            </div>
            <CardTitle>Create a REST API App</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 border">
            <p className="font-semibold mb-3">Follow these steps in the dashboard:</p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-semibold text-sm">Click "Apps & Credentials"</p>
                  <p className="text-xs text-slate-600">In the top menu bar</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-semibold text-sm">Switch to "Sandbox" tab</p>
                  <p className="text-xs text-slate-600">For testing (you'll use this first)</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-semibold text-sm">Click blue "Create App" button</p>
                  <p className="text-xs text-slate-600">Usually in the top right</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <p className="font-semibold text-sm">Enter app name</p>
                  <p className="text-xs text-slate-600">Example: "My App Payments" or "ApplyAI"</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">5</div>
                <div>
                  <p className="font-semibold text-sm">Select sandbox account</p>
                  <p className="text-xs text-slate-600">Choose your business account from dropdown</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">6</div>
                <div>
                  <p className="font-semibold text-sm">Click "Create App"</p>
                  <p className="text-xs text-slate-600">Wait for app to be created</p>
                </div>
              </div>
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-900 text-sm">
              ⚠️ <strong>Sandbox = Test Mode:</strong> You're using fake money for testing. No real charges will happen.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 4 */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg">
              4
            </div>
            <CardTitle>Copy Your Client ID</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-700">
            After creating the app, you'll see your credentials on the app details page.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 border">
            <p className="font-semibold mb-2">🔑 What to copy:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Client ID</p>
                  <p className="text-xs text-slate-600">Long string like: AaB123xyz456...</p>
                  <p className="text-xs text-slate-600 mt-1">This is what you'll use in your app</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
            <p className="font-semibold text-blue-900 mb-1">📋 Example Client ID:</p>
            <code className="text-xs bg-white px-2 py-1 rounded border text-slate-800 block">
              AZaGtHD5YgN_PkX4E6j2Qr3sT8uV9wXyZ0aB1cD2eF3gH4iJ5
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Step 5 */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              5
            </div>
            <CardTitle>Add Client ID to Your Code</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-700 mb-3">
            Open <code className="bg-slate-100 px-2 py-1 rounded text-sm">components/pricing/PayPalCheckout.js</code>
          </p>

          <div className="bg-slate-900 text-slate-100 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Find this line (around line 15):</p>
            <code className="text-sm block mb-3 text-red-400">
              const PAYPAL_CLIENT_ID = 'YOUR_PAYPAL_CLIENT_ID';
            </code>
            
            <p className="text-xs text-slate-400 mb-2">Replace with your actual Client ID:</p>
            <code className="text-sm block text-green-400">
              const PAYPAL_CLIENT_ID = 'AZaGtHD5YgN...your_client_id';
            </code>
          </div>

          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => copyCode("const PAYPAL_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';")}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code Template
          </Button>

          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-900 text-sm">
              ✅ Do the same in <code className="bg-white px-1.5 py-0.5 rounded">PayPalSubscription.js</code> if you want subscriptions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 6 */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
              6
            </div>
            <CardTitle>Test Your Payment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-700">
            Now let's test if everything works!
          </p>

          <div className="bg-slate-50 rounded-lg p-4 border">
            <p className="font-semibold mb-2">🧪 Testing Steps:</p>
            <ol className="space-y-2 text-sm text-slate-700 ml-4 list-decimal">
              <li>Go to the <strong>TestPayPal</strong> page in your app</li>
              <li>Enter an amount (like $29.99)</li>
              <li>Click <strong>"Pay with PayPal"</strong></li>
              <li>You'll see PayPal's checkout page</li>
              <li>Use sandbox test account to pay</li>
            </ol>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
            <p className="font-semibold text-blue-900 mb-2">🔐 Get Test Account Credentials:</p>
            <ol className="space-y-1 text-sm text-blue-800 ml-4 list-decimal">
              <li>In Developer Dashboard, click <strong>"Sandbox → Accounts"</strong></li>
              <li>You'll see test accounts (Personal and Business)</li>
              <li>Click on a <strong>Personal</strong> account</li>
              <li>Click <strong>"View/Edit"</strong> to see email and password</li>
              <li>Use these to log in during test checkout</li>
            </ol>
          </div>

          <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" asChild>
            <a href="/TestPayPal">
              Test PayPal Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Step 7 */}
      <Card className="mb-6 shadow-lg border-2 border-yellow-300">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold text-lg">
              7
            </div>
            <CardTitle>Go Live (When Ready)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-900">
              ⚠️ <strong>Only do this when you're ready for real payments!</strong>
            </AlertDescription>
          </Alert>

          <div className="bg-slate-50 rounded-lg p-4 border">
            <p className="font-semibold mb-2">🚀 Going Live:</p>
            <ol className="space-y-2 text-sm text-slate-700 ml-4 list-decimal">
              <li>In Developer Dashboard, switch to <strong>"Live"</strong> tab (not Sandbox)</li>
              <li>Create a new app (same process as Step 3)</li>
              <li>Copy the <strong>Live Client ID</strong></li>
              <li>Replace sandbox Client ID in your code with Live Client ID</li>
              <li>Make sure your PayPal Business account is fully verified</li>
              <li>Test with a real (small) payment to yourself</li>
            </ol>
          </div>

          <p className="text-sm text-slate-600">
            💡 <strong>Tip:</strong> Keep your sandbox Client ID somewhere safe so you can test new features later.
          </p>
        </CardContent>
      </Card>

      {/* Success Card */}
      <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">You're All Set! 🎉</h3>
          <p className="text-green-800 mb-4">
            You can now accept PayPal payments in your app
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild>
              <a href="/TestPayPal">Test Integration</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/PaymentSetupGuide">View Full Guide</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="mt-6 bg-slate-50">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">❓ Need Help?</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <p><strong>Problem:</strong> Can't find "Create App" button</p>
            <p className="ml-4">→ Make sure you're logged in with a Business account, not Personal</p>
            
            <p className="mt-3"><strong>Problem:</strong> Payment not working</p>
            <p className="ml-4">→ Double-check your Client ID is copied correctly (no extra spaces)</p>
            
            <p className="mt-3"><strong>Problem:</strong> "Account not verified" error</p>
            <p className="ml-4">→ Complete identity verification in your PayPal Business account</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}