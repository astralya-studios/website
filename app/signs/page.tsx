import type { Metadata } from "next";
import { getAllSigns } from "@/lib/catalog";
import SignCard from "@/components/SignCard";

export const metadata: Metadata = {
  title: "Find Your Sign",
  description:
    "Browse all twelve Astralya zodiac characters — Aries through Pisces — and find the one that's unmistakably you.",
};

export default function SignsPage() {
  const signs = getAllSigns();

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-starlight-300">
          The 12 Sun Signs
        </p>
        <h1 className="mt-4 font-display text-5xl text-cream-50 sm:text-6xl">
          Find Your Sign
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-cream-100/70">
          Twelve characters, one for every sign. Tap the one that&apos;s been
          waiting for you.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {signs.map((sign) => (
          <SignCard key={sign.id} sign={sign} />
        ))}
      </div>
    </div>
  );
}
