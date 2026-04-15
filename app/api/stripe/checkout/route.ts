import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREDIT_PACKS = {
  credits_50: { envKey: "STRIPE_PRICE_CREDITS_50", credits: 50 },
  credits_150: { envKey: "STRIPE_PRICE_CREDITS_150", credits: 150 },
  credits_400: { envKey: "STRIPE_PRICE_CREDITS_400", credits: 400 },
  credits_1000: { envKey: "STRIPE_PRICE_CREDITS_1000", credits: 1000 },
} as const;

type CreditPackKey = keyof typeof CREDIT_PACKS;

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  });
}

function getAppUrl(req: NextRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const origin = req.headers.get("origin");
  if (origin) return origin;

  const host = req.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  return host ? `${protocol}://${host}` : "https://resumevaultgodai.vercel.app";
}

function getPack(packKey: unknown) {
  if (typeof packKey !== "string" || !(packKey in CREDIT_PACKS)) return null;

  const key = packKey as CreditPackKey;
  const pack = CREDIT_PACKS[key];
  const priceId = process.env[pack.envKey];

  if (!priceId) {
    throw new Error(`Missing ${pack.envKey}`);
  }

  return { key, priceId, credits: pack.credits };
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  try {
    const { priceId } = await req.json();
    const pack = getPack(priceId);
    if (!pack) {
      return NextResponse.json({ error: "Invalid credit pack selected" }, { status: 400 });
    }

    const stripe = getStripeClient();
    const appUrl = getAppUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: auth.user.id,
      customer_creation: "always",
      customer_email: auth.user.email,
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${appUrl}/app/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app/pricing?canceled=true`,
      metadata: {
        user_id: auth.user.id,
        credits: String(pack.credits),
        pack: pack.key,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    const isConfigError = message.startsWith("Missing STRIPE_");

    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: isConfigError ? message : "Failed to create checkout session" },
      { status: isConfigError ? 500 : 502 }
    );
  }
}
