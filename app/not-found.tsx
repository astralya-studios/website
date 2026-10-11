import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-7xl text-cream-50/30">✦</p>
      <h1 className="mt-6 font-display text-4xl text-cream-50">
        Lost among the stars
      </h1>
      <p className="mt-4 text-cream-100/70">
        That page drifted off the map. Let&apos;s get you back to the zodiac.
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
