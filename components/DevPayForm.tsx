"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

interface OrderView {
  id: string;
  items: Array<{ signId: string; name: string; qty: number; unitPrice: number }>;
  total: number;
  currency: string;
}

/**
 * Dev-mode payment screen. Simulates the hosted-checkout step:
 * review the order, then Pay (test) or Cancel. Never shown when a real
 * payment provider is configured.
 */
export default function DevPayForm() {
  const params = useSearchParams();
  const router = useRouter();
  const session = params.get("session");
  const orderId = params.get("order");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setOrder(d?.order ?? null))
      .catch(() => setOrder(null));
  }, [orderId]);

  async function act(action: "pay" | "cancel") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/dev-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, sessionId: session, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      if (action === "pay") {
        router.push(`/checkout/success?order=${encodeURIComponent(orderId!)}`);
      } else {
        router.push("/checkout?cancelled=1");
      }
    } catch {
      setError("Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div
        role="note"
        className="rounded-2xl border-2 border-dashed border-amber-200/60 bg-amber-200/10 p-4 text-center"
      >
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-200">
          Test mode
        </p>
        <p className="mt-1 text-sm text-amber-100/80">
          This is a simulated payment. No real money moves.
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-cream-50/15 bg-night-800/70 p-6">
        <h1 className="font-display text-2xl text-cream-50">Test payment</h1>
        {order ? (
          <>
            <p className="mt-1 font-mono text-sm text-cream-100/60">
              {order.id}
            </p>
            <div className="mt-4 space-y-2 border-t border-cream-50/10 pt-4 text-sm">
              {order.items.map((i) => (
                <div key={i.signId} className="flex justify-between">
                  <span className="text-cream-100/75">
                    {i.name} × {i.qty}
                  </span>
                  <span className="text-cream-50">
                    {formatPrice(i.unitPrice * i.qty, order.currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-cream-50/10 pt-4 font-bold text-cream-50">
              <span>Total</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-cream-100/60">Loading order…</p>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={busy || !order}
            onClick={() => act("pay")}
            className="h-12 w-full rounded-full bg-cream-50 text-sm font-bold uppercase tracking-[0.2em] text-night-900 disabled:opacity-60"
          >
            {busy ? "Processing…" : "Pay (test)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => act("cancel")}
            className="h-12 w-full rounded-full border border-cream-50/25 text-sm font-bold uppercase tracking-[0.2em] text-cream-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
