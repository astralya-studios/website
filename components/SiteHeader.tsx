"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-cream-50/10 bg-night-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.35em] text-cream-50"
          aria-label="Astralya home"
        >
          ASTRALYA
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main">
          <Link
            href="/signs"
            className="rounded-full px-4 py-2 text-sm font-medium tracking-wide text-cream-100 transition hover:bg-cream-50/10 hover:text-cream-50"
          >
            Find Your Sign
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full px-4 py-2 text-sm font-medium tracking-wide text-cream-100 transition hover:bg-cream-50/10 hover:text-cream-50"
            aria-label={`Cart, ${count} items`}
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cream-50 px-1 text-[11px] font-bold text-night-900">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
