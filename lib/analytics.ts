/**
 * Analytics-ready event hooks.
 *
 * Currently pushes to `window.dataLayer` (works with GTM and friends).
 * To connect a provider, add its snippet to `app/layout.tsx` and keep
 * calling `track()` — no call sites need to change.
 */

export const AnalyticsEvents = {
  VIEW_SIGN: "view_sign",
  ADD_TO_CART: "add_to_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE: "purchase",
  JOIN_WAITLIST: "join_waitlist",
} as const;

export type AnalyticsEvent =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: AnalyticsEvent, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return; // server: no-op
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data });
}
