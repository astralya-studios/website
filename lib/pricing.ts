/**
 * Pricing rules — pure functions, safe to import anywhere
 * (server components, client components, API routes).
 */

/**
 * Flat shipping for v1 — placeholder. Free over $75.
 * Decision needed: real regions/rates (see content/DECISIONS-NEEDED.md).
 */
export function shippingFor(subtotal: number): number {
  if (subtotal >= 75) return 0;
  return 6.95;
}
