import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  });
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  return typeof customer === "string" ? customer : null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let stripe: Stripe;
  let event: Stripe.Event;
  try {
    stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    const status = message.startsWith("Missing STRIPE_") ? 500 : 400;
    return NextResponse.json({ error: status === 500 ? message : "Invalid signature" }, { status });
  }

  const sb = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const creditsToAdd = parseInt(session.metadata?.credits || "0", 10);

      if (session.payment_status !== "paid") break;

      if (userId && creditsToAdd > 0) {
        const { error } = await sb.rpc("process_stripe_checkout_session", {
          checkout_session_id: session.id,
          target_user_id: userId,
          credits_to_add: creditsToAdd,
          stripe_customer: getCustomerId(session.customer),
          stripe_payment_status: session.payment_status,
        });

        if (error) throw error;
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
