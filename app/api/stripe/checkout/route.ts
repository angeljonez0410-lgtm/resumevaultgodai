import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
<<<<<<< HEAD
    apiVersion: "2026-03-25.dahlia",
=======
    apiVersion: "2023-10-16",
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  });
}

// Credit pack price IDs from your Stripe Dashboard — set these in .env.local
const PRICE_MAP: Record<string, { priceId: string | undefined; credits: number }> = {
  credits_50: { priceId: process.env.STRIPE_PRICE_CREDITS_50, credits: 50 },
  credits_150: { priceId: process.env.STRIPE_PRICE_CREDITS_150, credits: 150 },
  credits_400: { priceId: process.env.STRIPE_PRICE_CREDITS_400, credits: 400 },
  credits_1000: { priceId: process.env.STRIPE_PRICE_CREDITS_1000, credits: 1000 },
};

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  try {
    const { priceId } = await req.json();

    const pack = PRICE_MAP[priceId];
    if (!pack || !pack.priceId) {
      return NextResponse.json({ error: "Invalid credit pack selected" }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://resumevaultgodai.vercel.app";
<<<<<<< HEAD
=======
    const isPublicDemoUser = auth.user.email?.endsWith("@resumevault.local");
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
<<<<<<< HEAD
      customer_email: auth.user.email,
=======
      customer_email: isPublicDemoUser ? undefined : auth.user.email || undefined,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${appUrl}/app/pricing?success=true`,
      cancel_url: `${appUrl}/app/pricing?canceled=true`,
      metadata: {
        user_id: auth.user.id,
        credits: String(pack.credits),
        pack: priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
