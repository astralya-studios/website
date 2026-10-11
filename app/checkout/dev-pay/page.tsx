import { Suspense } from "react";
import { getPaymentsMode } from "@/lib/payments";
import DevPayForm from "@/components/DevPayForm";

/**
 * Dev-mode payment page. Only exists when no real payment provider is
 * configured — Stripe Checkout replaces this entirely when keys are set.
 */
export default function DevPayPage() {
  const mode = getPaymentsMode();

  if (mode !== "dev") {
    return (
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-cream-50">
          Test payments are disabled
        </h1>
        <p className="mt-4 text-cream-100/70">
          A real payment provider is configured — this test page isn&apos;t
          available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <p className="text-cream-100/60">Loading…</p>
          </div>
        }
      >
        <DevPayForm />
      </Suspense>
    </div>
  );
}
