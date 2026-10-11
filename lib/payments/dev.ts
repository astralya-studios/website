import type {
  CheckoutSession,
  CheckoutSessionRequest,
  PaymentDriver,
} from "./types";

/**
 * Dev driver — safe payment simulation for local development and demos.
 *
 * No real money moves. The "payment page" is a clearly-labeled test screen
 * inside this app where you click Pay or Cancel. Used automatically whenever
 * no real payment provider is configured.
 */
export class DevDriver implements PaymentDriver {
  readonly name = "dev";
  readonly mode = "dev" as const;

  async createCheckoutSession(
    req: CheckoutSessionRequest
  ): Promise<CheckoutSession> {
    const id = `dev_cs_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    // Simulate a beat of network latency so the UX matches a real provider.
    await new Promise((r) => setTimeout(r, 300));
    return {
      id,
      url: `/checkout/dev-pay?session=${encodeURIComponent(
        id
      )}&order=${encodeURIComponent(req.orderId)}`,
      mode: this.mode,
    };
  }
}
