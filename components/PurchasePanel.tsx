"use client";

/**
 * Purchase panel — adapts to the sign's status:
 *   available → quantity + Add to cart / Buy now
 *   preorder  → quantity + Preorder (ships on release)
 *   waitlist  → email capture
 *
 * Change `status` in the sign's JSON and this panel reconfigures itself.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Sign } from "@/lib/catalog";
import { effectiveStatus } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { track, AnalyticsEvents } from "@/lib/analytics";
import WaitlistForm from "./WaitlistForm";

export default function PurchasePanel({
  sign,
  remaining,
}: {
  sign: Sign;
  /** Units left (runtime inventory). null = untracked. */
  remaining: number | null;
}) {
  const status = effectiveStatus(sign, remaining);
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const maxQty =
    status === "available" && remaining !== null ? Math.max(remaining, 1) : 99;

  function handleAdd(buyNow: boolean) {
    add(sign.id, qty);
    track(AnalyticsEvents.ADD_TO_CART, {
      signId: sign.id,
      qty,
      status,
    });
    if (buyNow) {
      track(AnalyticsEvents.BEGIN_CHECKOUT, { signId: sign.id });
      router.push("/checkout");
    } else {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2000);
    }
  }

  if (status === "waitlist") {
    return (
      <div className="rounded-3xl border border-cream-50/15 bg-night-800/70 p-6">
        <WaitlistForm signId={sign.id} signName={sign.name} />
        <p className="mt-3 text-center text-xs text-cream-100/50">
          {sign.name} hasn&apos;t launched yet. Waitlist members hear first.
        </p>
      </div>
    );
  }

  const isPreorder = status === "preorder";

  return (
    <div className="rounded-3xl border border-cream-50/15 bg-night-800/70 p-6">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-3xl text-cream-50">
          {formatPrice(sign.price, sign.currency)}
        </p>
        {status === "available" && remaining !== null && remaining <= 10 && (
          <p className="text-sm font-medium text-amber-200">
            Only {remaining} left
          </p>
        )}
      </div>

      {isPreorder && (
        <p className="mt-2 rounded-xl bg-starlight-400/10 px-4 py-3 text-sm leading-relaxed text-starlight-200">
          Preorder — ships when {sign.name} is released. Release date to be
          announced.
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <label htmlFor="qty" className="sr-only">
          Quantity
        </label>
        <div className="flex h-12 items-center rounded-full border border-cream-50/20">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 text-xl text-cream-100 transition hover:text-cream-50"
          >
            −
          </button>
          <span id="qty" aria-live="polite" className="w-8 text-center font-semibold">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="px-4 text-xl text-cream-100 transition hover:text-cream-50"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => handleAdd(false)}
          className="h-12 flex-1 rounded-full bg-cream-50 px-6 text-sm font-bold uppercase tracking-[0.15em] text-night-900 transition hover:bg-cream-100"
        >
          {added ? "Added ✓" : isPreorder ? "Preorder now" : "Add to cart"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleAdd(true)}
        className="mt-3 h-12 w-full rounded-full border border-cream-50/30 text-sm font-bold uppercase tracking-[0.15em] text-cream-50 transition hover:bg-cream-50/10"
      >
        {isPreorder ? "Preorder — buy now" : "Buy now"}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-cream-100/50">
        Secure checkout · Free shipping over $75 · 30-day returns
        <br />
        <span className="text-cream-100/35">
          (Shipping & returns policy placeholder — decision needed.)
        </span>
      </p>

      {/* Sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-50/10 bg-night-900/95 p-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p className="flex-1 font-display text-xl text-cream-50">
            {formatPrice(sign.price * qty, sign.currency)}
          </p>
          <button
            type="button"
            onClick={() => handleAdd(true)}
            className="h-12 flex-1 rounded-full bg-cream-50 px-6 text-sm font-bold uppercase tracking-[0.15em] text-night-900"
          >
            {isPreorder ? "Preorder now" : "Buy now"}
          </button>
        </div>
      </div>
    </div>
  );
}
