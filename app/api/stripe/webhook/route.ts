import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        const tier = plan.startsWith("elite") ? "elite" : "pro";
        await sb.from("user_profiles").upsert(
          {
            user_id: userId,
            subscription_tier: tier,
            stripe_customer_id: session.customer as string,
            subscription_status: "active",
          },
          { onConflict: "user_id" }
        );
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const status = sub.status;

      await sb
        .from("user_profiles")
        .update({ subscription_status: status })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await sb
        .from("user_profiles")
        .update({
          subscription_tier: "free",
          subscription_status: "canceled",
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
