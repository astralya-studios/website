/**
 * Payment driver interface.
 *
 * All payment providers plug in here. The checkout flow only knows this
 * interface — swapping providers means writing a new driver, not touching
 * the checkout pages or API routes.
 *
 * The flow is hosted-checkout based:
 *   1. POST /api/checkout creates an order (status: pending) and asks the
 *      driver for a checkout session.
 *   2. The customer is redirected to the driver's hosted payment page.
 *   3. The driver confirms payment (webhook, or dev-mode confirmation),
 *      and the order is marked paid.
 *
 * No secret keys ever reach the browser.
 */

export type PaymentMode = "dev" | "test" | "live";

export interface CheckoutLineItem {
  name: string;
  description?: string;
  /** Minor units (cents). Server-computed — never trust client prices. */
  unitAmount: number;
  currency: string;
  quantity: number;
}

export interface CheckoutSessionRequest {
  orderId: string;
  customerEmail: string;
  items: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  /** Where to send the customer to pay. */
  url: string;
  mode: PaymentMode;
}

export interface PaymentDriver {
  readonly name: string;
  readonly mode: PaymentMode;
  createCheckoutSession(req: CheckoutSessionRequest): Promise<CheckoutSession>;
}
