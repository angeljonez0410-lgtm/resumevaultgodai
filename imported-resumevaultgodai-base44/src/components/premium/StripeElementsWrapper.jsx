import { useEffect, useState } from 'react';

export default function StripeElementsWrapper({ user }) {
  const [publishableKey, setPublishableKey] = useState(null);

  useEffect(() => {
    // Fetch publishable key from environment or backend
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      setPublishableKey(key);
    }
  }, []);

  if (!publishableKey) {
    return <div className="text-sm text-gray-500">Loading pricing table...</div>;
  }

  return (
    <>
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      <stripe-pricing-table
        pricing-table-id="prctbl_1TA7YEBaHsdSuPWcmxLLbSJQ"
        publishable-key={publishableKey}
        customer-email={user?.email}
      />
    </>
  );
}