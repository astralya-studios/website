"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { getSign, effectiveStatus } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import SignMedallion from "@/components/SignMedallion";

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();

  const lines = items
    .map((item) => ({ item, sign: getSign(item.signId) }))
    .filter((l) => l.sign);

  if (lines.length === 0) {
    return (
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="font-display text-6xl text-cream-50/25">♡</p>
        <h1 className="mt-6 font-display text-4xl text-cream-50">
          Your cart is empty
        </h1>
        <p className="mt-4 text-cream-100/70">
          Every collection starts with a single sign.
        </p>
        <Link
          href="/signs"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-cream-50 px-8 text-sm font-bold uppercase tracking-[0.2em] text-night-900 transition hover:bg-cream-100"
        >
          Find your sign
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Cart</h1>

      <div className="mt-8 space-y-4">
        {lines.map(({ item, sign }) => {
          const status = effectiveStatus(sign!);
          return (
            <div
              key={item.signId}
              className="flex items-center gap-4 rounded-2xl border border-cream-50/10 bg-night-800/60 p-4"
            >
              <Link href={`/${sign!.id}`} aria-label={`View ${sign!.name}`}>
                <SignMedallion
                  sign={sign!}
                  glow={false}
                  className="h-20 w-20 shrink-0"
                />
              </Link>
              <div className="flex-1">
                <Link
                  href={`/${sign!.id}`}
                  className="font-display text-xl text-cream-50 hover:underline"
                >
                  {sign!.name}
                </Link>
                <p className="text-xs uppercase tracking-[0.2em] text-cream-100/45">
                  {status === "preorder" ? "Preorder" : sign!.dates}
                </p>
                <p className="mt-1 text-sm font-semibold text-cream-50">
                  {formatPrice(sign!.price, sign!.currency)}
                </p>
              </div>
              <div className="flex h-10 items-center rounded-full border border-cream-50/20">
                <button
                  type="button"
                  aria-label={`Decrease ${sign!.name} quantity`}
                  onClick={() => setQty(item.signId, item.qty - 1)}
                  className="px-3 text-lg text-cream-100 hover:text-cream-50"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">
                  {item.qty}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${sign!.name} quantity`}
                  onClick={() => setQty(item.signId, Math.min(99, item.qty + 1))}
                  className="px-3 text-lg text-cream-100 hover:text-cream-50"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(item.signId)}
                aria-label={`Remove ${sign!.name} from cart`}
                className="px-2 text-sm text-cream-100/50 transition hover:text-red-300"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-cream-50/10 bg-night-800/60 p-6">
        <div className="flex justify-between text-cream-100/70">
          <span>Subtotal</span>
          <span className="font-semibold text-cream-50">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="mt-2 text-sm text-cream-100/50">
          Shipping calculated at checkout · Free over $75
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex h-14 items-center justify-center rounded-full bg-cream-50 text-sm font-bold uppercase tracking-[0.2em] text-night-900 transition hover:bg-cream-100"
        >
          Checkout
        </Link>
        <Link
          href="/signs"
          className="mt-3 flex h-12 items-center justify-center rounded-full border border-cream-50/20 text-sm font-bold uppercase tracking-[0.2em] text-cream-50 transition hover:bg-cream-50/10"
        >
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
