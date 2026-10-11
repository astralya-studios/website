import { DevDriver } from "./dev";
import { StripeDriver } from "./stripe";
import type { PaymentDriver, PaymentMode } from "./types";

export type { PaymentDriver, PaymentMode };
export type { CheckoutSession, CheckoutSessionRequest } from "./types";

/**
 * Driver selection: Stripe when configured, otherwise the safe dev driver.
 * To add a provider (Shopify, Adyen, …), write a driver implementing
 * PaymentDriver and select it here.
 */
export function getPaymentDriver(): PaymentDriver {
  if (process.env.STRIPE_SECRET_KEY) {
    return new StripeDriver();
  }
  return new DevDriver();
}

/** Current payments mode — used for "test mode" banners in the UI. */
export function getPaymentsMode(): PaymentMode {
  return getPaymentDriver().mode;
}
