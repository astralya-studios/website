import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSigns,
  getSign,
  getSignIds,
  effectiveStatus,
} from "@/lib/catalog";
import { getRemaining } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import SignMedallion from "@/components/SignMedallion";
import StatusPill from "@/components/StatusPill";
import PurchasePanel from "@/components/PurchasePanel";

export async function generateStaticParams() {
  return getSignIds().map((sign) => ({ sign }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign: id } = await params;
  const sign = getSign(id);
  if (!sign) return { title: "Not found" };
  return {
    title: sign.seo.title || `${sign.name} Plush — Astralya`,
    description: sign.seo.description,
    openGraph: {
      title: `${sign.name} — Astralya`,
      description: sign.tagline,
      type: "website",
    },
  };
}

function ProductJsonLd({ signId }: { signId: string }) {
  const sign = getSign(signId)!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sign.characterName ?? `${sign.name} Plush`,
    description: sign.description,
    brand: { "@type": "Brand", name: "Astralya" },
    offers: {
      "@type": "Offer",
      priceCurrency: sign.currency,
      price: sign.price.toFixed(2),
      availability:
        sign.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      url: `${siteUrl}/${sign.id}`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function SignPage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign: id } = await params;
  const sign = getSign(id);
  if (!sign) notFound();

  const remaining = await getRemaining(sign.id);
  const status = effectiveStatus(sign, remaining);

  const all = getAllSigns();
  const idx = all.findIndex((s) => s.id === sign.id);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  const title = sign.characterName ?? sign.name;

  return (
    <div className="relative z-10">
      <ProductJsonLd signId={sign.id} />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-6xl px-4 pt-6 text-sm text-cream-100/50 sm:px-6"
      >
        <Link href="/signs" className="transition hover:text-cream-50">
          Signs
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span aria-current="page" className="text-cream-100/80">
          {sign.name}
        </span>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12">
        {/* ---------- Art ---------- */}
        <div className="flex flex-col items-center">
          <div className="warm-glow w-full max-w-md">
            {sign.images.hero ? (
              <Image
                src={sign.images.hero}
                alt={`${title} plush character`}
                width={800}
                height={800}
                priority
                className="h-auto w-full rounded-3xl object-cover"
              />
            ) : (
              <SignMedallion sign={sign} className="h-auto w-full" />
            )}
          </div>
          {sign.images.gallery.length > 0 && (
            <div className="mt-4 grid w-full max-w-md grid-cols-4 gap-3">
              {sign.images.gallery.map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt={`${title} additional view`}
                  width={200}
                  height={200}
                  className="h-auto w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
          {!sign.images.hero && (
            <p className="mt-3 text-xs text-cream-100/35">
              Concept art placeholder — final character art coming soon.
            </p>
          )}
        </div>

        {/* ---------- Info ---------- */}
        <div>
          <StatusPill status={status} />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-starlight-300">
            {sign.name} · {sign.dates}
          </p>
          <h1 className="mt-2 font-display text-5xl text-cream-50 sm:text-6xl">
            {title}
          </h1>
          {sign.characterName === null && (
            <p className="mt-2 text-sm italic text-cream-100/45">
              Character name to be revealed.
            </p>
          )}
          <p className="mt-4 font-display text-xl italic text-cream-100/85">
            &ldquo;{sign.tagline}&rdquo;
          </p>
          <p className="mt-4 leading-relaxed text-cream-100/75">
            {sign.personality}
          </p>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Key traits">
            {sign.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-full border border-cream-50/20 px-4 py-1.5 text-sm text-cream-100/80"
              >
                {trait}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <PurchasePanel sign={sign} remaining={remaining} />
          </div>

          {/* Details */}
          <dl className="mt-8 space-y-3 border-t border-cream-50/10 pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-cream-100/50">Collection</dt>
              <dd className="text-right text-cream-50">The 12 Sun Signs</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream-100/50">Size</dt>
              <dd className="text-right text-cream-50">{sign.size}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream-100/50">Materials</dt>
              <dd className="text-right text-cream-50">{sign.materials}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream-100/50">Price</dt>
              <dd className="text-right text-cream-50">
                {formatPrice(sign.price, sign.currency)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-2xl border border-cream-50/10 bg-night-800/50 p-5 text-sm leading-relaxed text-cream-100/65">
            <h2 className="font-semibold text-cream-50">Shipping</h2>
            <p className="mt-1">
              Free shipping on orders over $75. Orders ship within 3–5 business
              days.
              <span className="text-cream-100/40">
                {" "}
                (Placeholder policy — final rates & timelines TBD.)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ---------- About the character ---------- */}
      <section className="border-t border-cream-50/10 bg-night-800/40">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-3xl text-cream-50">
            That&apos;s so {sign.name}
          </h2>
          <p className="mt-4 leading-relaxed text-cream-100/75">
            {sign.description}
          </p>
        </div>
      </section>

      {/* ---------- What is Astralya? (standalone landing block) ---------- */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-starlight-300">
          What is Astralya?
        </p>
        <h2 className="mt-4 font-display text-3xl text-cream-50">
          A plush character for every sign
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-cream-100/70">
          Astralya is a collectible plush brand built around the zodiac. It
          starts with the 12 Sun Signs — one character per sign, released
          gradually. Find your sign, fall in love, take them home.
        </p>
        <Link
          href="/signs"
          className="mt-6 inline-flex h-12 items-center rounded-full border border-cream-50/30 px-8 text-sm font-bold uppercase tracking-[0.2em] text-cream-50 transition hover:bg-cream-50/10"
        >
          See all 12 signs
        </Link>
      </section>

      {/* ---------- Prev / Next ---------- */}
      <nav
        aria-label="More signs"
        className="border-t border-cream-50/10"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6">
          <Link
            href={`/${prev.id}`}
            className="group flex items-center gap-4 py-8 pr-4"
          >
            <SignMedallion
              sign={prev}
              glow={false}
              className="h-14 w-14 transition group-hover:scale-110"
            />
            <span>
              <span className="block text-xs uppercase tracking-[0.2em] text-cream-100/40">
                ← Previous
              </span>
              <span className="font-display text-xl text-cream-50">
                {prev.name}
              </span>
            </span>
          </Link>
          <Link
            href={`/${next.id}`}
            className="group flex items-center justify-end gap-4 py-8 pl-4 text-right"
          >
            <span>
              <span className="block text-xs uppercase tracking-[0.2em] text-cream-100/40">
                Next →
              </span>
              <span className="font-display text-xl text-cream-50">
                {next.name}
              </span>
            </span>
            <SignMedallion
              sign={next}
              glow={false}
              className="h-14 w-14 transition group-hover:scale-110"
            />
          </Link>
        </div>
      </nav>
    </div>
  );
}
