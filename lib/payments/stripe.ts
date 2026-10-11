import Stripe from "stripe";
import type {
  CheckoutSession,
  CheckoutSessionRequest,
  PaymentDriver,
  PaymentMode,
} from "./types";

/**
 * Stripe driver — real payments via Stripe Checkout (hosted payment page).
 *
 * Activated automatically when STRIPE_SECRET_KEY is set. Test keys
 * (sk_test_…) run in test mode; live keys (sk_live_…) run live.
 *
 * Webhook: POST /api/webhooks/stripe confirms payment. Set
 * STRIPE_WEBHOOK_SECRET for signature verification in production.
 */

let stripeClient: Stripe | null = null;

function client(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local to enable Stripe payments."
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export class StripeDriver implements PaymentDriver {
  readonly name = "stripe";
  readonly mode: PaymentMode;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    this.mode = key.startsWith("sk_live") ? "live" : "test";
  }

  async createCheckoutSession(
    req: CheckoutSessionRequest
  ): Promise<CheckoutSession> {
    const session = await client().checkout.sessions.create({
      mode: "payment",
      customer_email: req.customerEmail,
      line_items: req.items.map((item) => ({
        price_data: {
          currency: item.currency.toLowerCase(),
          unit_amount: item.unitAmount,
          product_data: {
            name: item.name,
            description: item.description,
          },
        },
        quantity: item.quantity,
      })),
      success_url: req.successUrl,
      cancel_url: req.cancelUrl,
      metadata: { orderId: req.orderId, ...(req.metadata ?? {}) },
    });
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }
    return { id: session.id, url: session.url, mode: this.mode };
  }
}
