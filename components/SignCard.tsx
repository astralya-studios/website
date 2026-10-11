import Link from "next/link";
import type { Sign } from "@/lib/catalog";
import { effectiveStatus } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import SignMedallion from "./SignMedallion";
import StatusPill from "./StatusPill";

export default function SignCard({ sign }: { sign: Sign }) {
  const status = effectiveStatus(sign);
  const purchasable = status !== "waitlist";

  return (
    <Link
      href={`/${sign.id}`}
      className="group relative flex flex-col items-center rounded-3xl border border-cream-50/10 bg-night-800/60 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-cream-50/25 hover:bg-night-800"
    >
      <div className="absolute right-4 top-4">
        <StatusPill status={status} />
      </div>
      <SignMedallion
        sign={sign}
        className="h-36 w-36 transition duration-300 group-hover:scale-105"
      />
      <h3 className="mt-4 font-display text-2xl text-cream-50">{sign.name}</h3>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cream-100/50">
        {sign.dates}
      </p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-cream-100/70">
        {sign.tagline}
      </p>
      <p className="mt-4 text-sm font-semibold text-cream-50">
        {purchasable ? (
          formatPrice(sign.price, sign.currency)
        ) : (
          <span className="font-normal text-cream-100/60">
            Join the waitlist
          </span>
        )}
      </p>
    </Link>
  );
}
