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
      const creditsToAdd = parseInt(session.metadata?.credits || "0", 10);

      if (userId && creditsToAdd > 0) {
        // Get current credits
        const { data: profile } = await sb
          .from("user_profiles")
          .select("credits")
          .eq("user_id", userId)
          .single();

        const currentCredits = profile?.credits || 0;

        await sb.from("user_profiles").upsert(
          {
            user_id: userId,
            credits: currentCredits + creditsToAdd,
            stripe_customer_id: session.customer as string,
          },
          { onConflict: "user_id" }
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
