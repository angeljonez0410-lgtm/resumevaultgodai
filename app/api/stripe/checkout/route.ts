import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

// Price IDs from your Stripe Dashboard — set these in .env.local
const PRICE_MAP: Record<string, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  elite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY,
  elite_yearly: process.env.STRIPE_PRICE_ELITE_YEARLY,
};

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  try {
    const { priceId } = await req.json();

    const stripePriceId = PRICE_MAP[priceId];
    if (!stripePriceId) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://resumevaultgodai.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: auth.user.email,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/app/pricing?success=true`,
      cancel_url: `${appUrl}/app/pricing?canceled=true`,
      metadata: {
        user_id: auth.user.id,
        plan: priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
