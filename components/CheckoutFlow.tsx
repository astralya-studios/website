"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { getSign, effectiveStatus } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { shippingFor } from "@/lib/pricing";
import type { PaymentMode } from "@/lib/payments";
import { track, AnalyticsEvents } from "@/lib/analytics";

const inputCls =
  "h-12 w-full rounded-xl border border-cream-50/20 bg-night-950/60 px-4 text-cream-50 placeholder:text-cream-100/35";

export default function CheckoutFlow({ mode }: { mode: PaymentMode }) {
  const { items } = useCart();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    address1: "",
    address2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US",
  });

  // Only purchasable items can be checked out (waitlist items use the
  // waitlist form instead). The API re-validates this server-side.
  const lines = useMemo(
    () =>
      items
        .map((item) => ({ item, sign: getSign(item.signId) }))
        .filter(
          (l) => l.sign && effectiveStatus(l.sign) !== "waitlist"
        ) as Array<{ item: { signId: string; qty: number }; sign: NonNullable<ReturnType<typeof getSign>> }>,
    [items]
  );

  const subtotal = lines.reduce(
    (sum, l) => sum + l.sign.price * l.item.qty,
    0
  );
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  function set(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    track(AnalyticsEvents.BEGIN_CHECKOUT, { total });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ signId: l.item.signId, qty: l.item.qty })),
          customer: { email: form.email, name: form.name },
          shippingAddress: {
            name: form.name,
            address1: form.address1,
            address2: form.address2 || undefined,
            city: form.city,
            region: form.region,
            postalCode: form.postalCode,
            country: form.country,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed. Please try again.");
        setSending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed. Please try again.");
      setSending(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-cream-50">
          Nothing to check out
        </h1>
        <p className="mt-4 text-cream-100/70">
          Your cart is empty — or holds only waitlist items.
        </p>
        <Link
          href="/signs"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-cream-50 px-8 text-sm font-bold uppercase tracking-[0.2em] text-night-900"
        >
          Find your sign
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-cream-50">Checkout</h1>

      {mode !== "live" && (
        <div
          role="note"
          className="mt-6 rounded-2xl border border-amber-200/40 bg-amber-200/10 p-4 text-sm text-amber-100"
        >
          <strong className="uppercase tracking-[0.2em]">
            {mode} mode
          </strong>
          <p className="mt-1 text-amber-100/80">
            No real payment provider is configured, so no real charge will be
            made. Connect Stripe to accept live payments.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <section>
          <h2 className="font-display text-2xl text-cream-50">Contact</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="co-email" className="mb-1 block text-sm text-cream-100/70">
                Email
              </label>
              <input
                id="co-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="co-name" className="mb-1 block text-sm text-cream-100/70">
                Full name
              </label>
              <input
                id="co-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Nova Starling"
                value={form.name}
                onChange={set("name")}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-cream-50">Shipping</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="co-a1" className="mb-1 block text-sm text-cream-100/70">
                Street address
              </label>
              <input
                id="co-a1"
                type="text"
                required
                autoComplete="street-address"
                value={form.address1}
                onChange={set("address1")}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="co-a2" className="mb-1 block text-sm text-cream-100/70">
                Apartment, suite, etc. <span className="text-cream-100/40">(optional)</span>
              </label>
              <input
                id="co-a2"
                type="text"
                autoComplete="address-line2"
                value={form.address2}
                onChange={set("address2")}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="co-city" className="mb-1 block text-sm text-cream-100/70">
                  City
                </label>
                <input
                  id="co-city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={set("city")}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="co-region" className="mb-1 block text-sm text-cream-100/70">
                  State / Region
                </label>
                <input
                  id="co-region"
                  type="text"
                  required
                  autoComplete="address-level1"
                  value={form.region}
                  onChange={set("region")}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="co-zip" className="mb-1 block text-sm text-cream-100/70">
                  ZIP / Postal code
                </label>
                <input
                  id="co-zip"
                  type="text"
                  required
                  autoComplete="postal-code"
                  inputMode="text"
                  value={form.postalCode}
                  onChange={set("postalCode")}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="co-country" className="mb-1 block text-sm text-cream-100/70">
                  Country
                </label>
                <select
                  id="co-country"
                  required
                  autoComplete="country-name"
                  value={form.country}
                  onChange={set("country")}
                  className={inputCls}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-cream-50/15 bg-night-800/60 p-6">
          <h2 className="font-display text-2xl text-cream-50">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {lines.map((l) => (
              <div key={l.item.signId} className="flex justify-between">
                <span className="text-cream-100/75">
                  {l.sign.name} × {l.item.qty}
                  {effectiveStatus(l.sign) === "preorder" && (
                    <span className="ml-2 text-xs uppercase tracking-widest text-starlight-300">
                      Preorder
                    </span>
                  )}
                </span>
                <span className="text-cream-50">
                  {formatPrice(l.sign.price * l.item.qty, l.sign.currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-cream-50/10 pt-4 text-sm">
            <div className="flex justify-between text-cream-100/60">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-cream-100/60">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-lg font-bold text-cream-50">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="h-14 w-full rounded-full bg-cream-50 text-sm font-bold uppercase tracking-[0.2em] text-night-900 transition hover:bg-cream-100 disabled:opacity-60"
        >
          {sending ? "Starting secure checkout…" : `Pay ${formatPrice(total)}`}
        </button>
        <p className="text-center text-xs text-cream-100/45">
          You&apos;ll complete payment on a secure checkout page.
        </p>
      </form>
    </div>
  );
}
