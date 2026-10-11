import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-cream-50/10 bg-night-950/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 sm:px-6">
        <p className="font-display text-lg tracking-[0.35em] text-cream-100">
          ASTRALYA
        </p>
        <p className="max-w-md text-center text-sm leading-relaxed text-cream-100/60">
          A collectible plush character for every sign of the zodiac.
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-cream-100/70"
          aria-label="Footer"
        >
          <Link href="/signs" className="transition hover:text-cream-50">
            Find Your Sign
          </Link>
          <Link href="/cart" className="transition hover:text-cream-50">
            Cart
          </Link>
        </nav>
        <p className="text-xs text-cream-100/40">
          © {new Date().getFullYear()} Astralya. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
