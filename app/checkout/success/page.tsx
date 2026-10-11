"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { track, AnalyticsEvents } from "@/lib/analytics";

interface OrderView {
  id: string;
  status: string;
  items: Array<{ signId: string; name: string; qty: number; unitPrice: number }>;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  customer: { name: string; email: string };
  payment: { mode: string };
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const { clear } = useCart();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">(
    orderId ? "loading" : "missing"
  );

  useEffect(() => {
    if (!orderId) return; // state already "missing"
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.order) {
          setState("missing");
          return;
        }
        setOrder(data.order);
        setState("ready");
        if (data.order.status === "paid") {
          clear();
          track(AnalyticsEvents.PURCHASE, {
            orderId: data.order.id,
            total: data.order.total,
          });
        }
      })
      .catch(() => setState("missing"));
  }, [orderId, clear]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-cream-100/60">Confirming your order…</p>
      </div>
    );
  }

  if (state === "missing" || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-cream-50">
          Order not found
        </h1>
        <p className="mt-4 text-cream-100/70">
          We couldn&apos;t find that order. Check your email for a confirmation
          link.
        </p>
        <Link
          href="/signs"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-cream-50 px-8 text-sm font-bold uppercase tracking-[0.2em] text-night-900"
        >
          Back to the signs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="font-display text-6xl text-emerald-200">✦</p>
      <h1 className="mt-6 font-display text-4xl text-cream-50 sm:text-5xl">
        {order.status === "paid" ? "It's yours." : "Order received"}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-cream-100/70">
        {order.status === "paid"
          ? `Thank you, ${order.customer.name.split(" ")[0] || "friend"}. Your character is on its way to you.`
          : "Your order was created and is awaiting payment."}
      </p>

      <div className="mt-8 rounded-3xl border border-cream-50/15 bg-night-800/70 p-6 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-cream-100/50">Order</span>
          <span className="font-mono font-semibold text-cream-50">
            {order.id}
          </span>
        </div>
        <div className="mt-4 space-y-2 border-t border-cream-50/10 pt-4 text-sm">
          {order.items.map((item) => (
            <div key={item.signId} className="flex justify-between">
              <span className="text-cream-100/75">
                {item.name} × {item.qty}
              </span>
              <span className="text-cream-50">
                {formatPrice(item.unitPrice * item.qty, order.currency)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-cream-50/10 pt-4 text-sm">
          <div className="flex justify-between text-cream-100/60">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-cream-100/60">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping, order.currency)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-cream-50">
            <span>Total</span>
            <span>{formatPrice(order.total, order.currency)}</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-cream-100/50">
          Confirmation sent to {order.customer.email}
        </p>
        {order.payment.mode !== "live" && (
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">
            {order.payment.mode} mode — no real charge
          </p>
        )}
      </div>

      <Link
        href="/signs"
        className="mt-8 inline-flex h-12 items-center rounded-full border border-cream-50/30 px-8 text-sm font-bold uppercase tracking-[0.2em] text-cream-50 transition hover:bg-cream-50/10"
      >
        Collect another sign
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="relative z-10">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <p className="text-cream-100/60">Loading…</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
