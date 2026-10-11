import Link from "next/link";
import { getAllSigns, getSign } from "@/lib/catalog";
import SignMedallion from "@/components/SignMedallion";

const FEATURED_IDS = ["aries", "taurus", "gemini", "cancer"];

export default function Home() {
  const signs = getAllSigns();
  const featured = FEATURED_IDS.map((id) => getSign(id)!).filter(Boolean);
  const heroSign = getSign("aries")!;

  return (
    <div className="relative z-10">
      {/* ---------- HERO ---------- */}
      <section className="warm-glow relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-starlight-300">
            A collectible plush universe
          </p>
          <h1 className="mt-6 font-display text-6xl tracking-[0.12em] text-cream-50 sm:text-8xl">
            ASTRALYA
          </h1>
          <p className="mt-6 max-w-xl font-display text-xl italic leading-relaxed text-cream-100/85 sm:text-2xl">
            Every sign has a soul.
            <br />
            Come meet yours.
          </p>

          <div className="relative mt-10 flex items-center justify-center">
            <div className="hidden sm:block">
              <SignMedallion
                sign={getSign("taurus")!}
                className="h-40 w-40 opacity-80"
                glow={false}
              />
            </div>
            <SignMedallion
              sign={heroSign}
              className="-mx-6 h-56 w-56 sm:h-72 sm:w-72"
            />
            <div className="hidden sm:block">
              <SignMedallion
                sign={getSign("leo")!}
                className="h-40 w-40 opacity-80"
                glow={false}
              />
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signs"
              className="flex h-14 items-center rounded-full bg-cream-50 px-10 text-sm font-bold uppercase tracking-[0.2em] text-night-900 transition hover:bg-cream-100"
            >
              Find your sign
            </Link>
            <Link
              href="#characters"
              className="flex h-14 items-center rounded-full border border-cream-50/30 px-10 text-sm font-bold uppercase tracking-[0.2em] text-cream-50 transition hover:bg-cream-50/10"
            >
              Meet the characters
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- DISCOVER THE ZODIAC ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h2 className="font-display text-4xl text-cream-50 sm:text-5xl">
            Discover the Zodiac
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cream-100/70">
            Twelve signs. Twelve characters. One of them is unmistakably you.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-6 lg:grid-cols-6">
          {signs.map((sign) => (
            <Link
              key={sign.id}
              href={`/${sign.id}`}
              className="group flex flex-col items-center rounded-2xl border border-transparent p-3 transition hover:border-cream-50/15 hover:bg-night-800/60"
              aria-label={`${sign.name} — ${sign.dates}`}
            >
              <SignMedallion
                sign={sign}
                glow={false}
                className="h-20 w-20 transition group-hover:scale-110 sm:h-24 sm:w-24"
              />
              <span className="mt-2 text-sm font-medium text-cream-100/80 group-hover:text-cream-50">
                {sign.name}
              </span>
              <span className="text-[11px] text-cream-100/40">{sign.dates}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- MEET THE CHARACTERS ---------- */}
      <section
        id="characters"
        className="border-y border-cream-50/10 bg-night-800/40"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <h2 className="font-display text-4xl text-cream-50 sm:text-5xl">
              Meet the Characters
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-cream-100/70">
              Soft, strange, and a little magical — each one made for its sign.
            </p>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((sign) => (
              <Link
                key={sign.id}
                href={`/${sign.id}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="warm-glow rounded-full">
                  <SignMedallion
                    sign={sign}
                    className="h-52 w-52 transition duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-5 font-display text-2xl text-cream-50">
                  {sign.name}
                </h3>
                <p className="mt-2 text-sm italic text-cream-100/70">
                  &ldquo;{sign.tagline}&rdquo;
                </p>
                <span className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-starlight-300 opacity-0 transition group-hover:opacity-100">
                  Meet {sign.name} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- YOUR SIGN IS WAITING ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h2 className="font-display text-4xl text-cream-50 sm:text-5xl">
          Your Sign Is Waiting
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-cream-100/70">
          Astralya begins with the 12 Sun Signs — one plush character per sign,
          released gradually. Find yours, claim it, and start the collection.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 text-left sm:grid-cols-3">
          {[
            {
              title: "One character per sign",
              body: "Twelve signs, twelve souls. No variants, no confusion.",
            },
            {
              title: "Made to collect",
              body: "Each character is designed as part of a complete set.",
            },
            {
              title: "Released over time",
              body: "Signs launch gradually — the waitlist hears first.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-cream-50/10 bg-night-800/60 p-6"
            >
              <h3 className="font-display text-lg text-cream-50">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/65">
                {c.body}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/signs"
          className="mt-10 inline-flex h-14 items-center rounded-full bg-cream-50 px-10 text-sm font-bold uppercase tracking-[0.2em] text-night-900 transition hover:bg-cream-100"
        >
          Find my sign
        </Link>
      </section>
    </div>
  );
}
