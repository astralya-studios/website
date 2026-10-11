import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrder, markOrderPaid } from "@/lib/orders";

/**
 * POST /api/webhooks/stripe — payment confirmation from Stripe.
 *
 * With STRIPE_WEBHOOK_SECRET set, the signature is verified (required in
 * production). Without it, the raw JSON is trusted — dev/test only.
 *
 * To use: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 * locally, or add the endpoint URL in the Stripe dashboard.
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 400 }
    );
  }

  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  if (webhookSecret && sig) {
    try {
      const stripe = new Stripe(secretKey);
      event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature failed:", err);
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }
  } else {
    // Dev/test only — never rely on this in production.
    event = JSON.parse(raw) as Stripe.Event;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.["orderId"];
    if (orderId) {
      const order = await getOrder(orderId);
      if (order && order.status === "pending") {
        await markOrderPaid(order.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
