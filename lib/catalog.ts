/**
 * Catalog — the single source of truth for sign/product content.
 *
 * Each sign lives in `content/signs/<id>.json`. This module statically
 * imports them so the catalog is available to server components, client
 * components, and API routes alike. To change any character — name, copy,
 * price, images, availability — edit the JSON file and rebuild.
 *
 * Nothing creative is hard-coded here: this module only validates shape.
 */

import ariesData from "@/content/signs/aries.json";
import taurusData from "@/content/signs/taurus.json";
import geminiData from "@/content/signs/gemini.json";
import cancerData from "@/content/signs/cancer.json";
import leoData from "@/content/signs/leo.json";
import virgoData from "@/content/signs/virgo.json";
import libraData from "@/content/signs/libra.json";
import scorpioData from "@/content/signs/scorpio.json";
import sagittariusData from "@/content/signs/sagittarius.json";
import capricornData from "@/content/signs/capricorn.json";
import aquariusData from "@/content/signs/aquarius.json";
import piscesData from "@/content/signs/pisces.json";

export type SignStatus = "waitlist" | "preorder" | "available";

export interface SignImages {
  hero: string | null;
  gallery: string[];
}

export interface SignSEO {
  title: string;
  description: string;
}

export interface Sign {
  id: string;
  name: string;
  symbol: string;
  dates: string;
  element: string;
  order: number;
  /** The plush character's name. null = not decided yet (see DECISIONS-NEEDED.md). */
  characterName: string | null;
  tagline: string;
  personality: string;
  traits: string[];
  description: string;
  price: number;
  currency: string;
  status: SignStatus;
  inventory: number | null;
  size: string;
  materials: string;
  images: SignImages;
  accent: string;
  copyStatus: string;
  seo: SignSEO;
}

const STATUSES: SignStatus[] = ["waitlist", "preorder", "available"];

function normalize(raw: unknown, file: string): Sign {
  const d = raw as Record<string, unknown>;
  const required = ["id", "name", "symbol", "dates", "order", "price", "status"];
  for (const key of required) {
    if (d[key] === undefined || d[key] === null || d[key] === "") {
      throw new Error(`content/signs/${file}: missing required field "${key}"`);
    }
  }
  if (!STATUSES.includes(d["status"] as SignStatus)) {
    throw new Error(
      `content/signs/${file}: status must be one of ${STATUSES.join(", ")}`
    );
  }
  return {
    id: String(d["id"]),
    name: String(d["name"]),
    symbol: String(d["symbol"]),
    dates: String(d["dates"]),
    element: String(d["element"] ?? ""),
    order: Number(d["order"]),
    characterName: (d["characterName"] as string | null) ?? null,
    tagline: String(d["tagline"] ?? ""),
    personality: String(d["personality"] ?? ""),
    traits: Array.isArray(d["traits"]) ? (d["traits"] as string[]) : [],
    description: String(d["description"] ?? ""),
    price: Number(d["price"]),
    currency: String(d["currency"] ?? "USD"),
    status: d["status"] as SignStatus,
    inventory:
      d["inventory"] === null || d["inventory"] === undefined
        ? null
        : Number(d["inventory"]),
    size: String(d["size"] ?? ""),
    materials: String(d["materials"] ?? ""),
    images: {
      hero: ((d["images"] as SignImages | undefined)?.hero ?? null) as
        | string
        | null,
      gallery: ((d["images"] as SignImages | undefined)?.gallery ?? []) as string[],
    },
    accent: String(d["accent"] ?? "#a79ae4"),
    copyStatus: String(d["copyStatus"] ?? "placeholder"),
    seo: {
      title: String((d["seo"] as SignSEO | undefined)?.title ?? ""),
      description: String((d["seo"] as SignSEO | undefined)?.description ?? ""),
    },
  };
}

const rawFiles: Array<[unknown, string]> = [
  [ariesData, "aries.json"],
  [taurusData, "taurus.json"],
  [geminiData, "gemini.json"],
  [cancerData, "cancer.json"],
  [leoData, "leo.json"],
  [virgoData, "virgo.json"],
  [libraData, "libra.json"],
  [scorpioData, "scorpio.json"],
  [sagittariusData, "sagittarius.json"],
  [capricornData, "capricorn.json"],
  [aquariusData, "aquarius.json"],
  [piscesData, "pisces.json"],
];

/** All 12 signs in zodiac order. */
export const SIGNS: Sign[] = rawFiles
  .map(([data, file]) => normalize(data, file))
  .sort((a, b) => a.order - b.order);

const byId = new Map(SIGNS.map((s) => [s.id, s]));

export function getSign(id: string): Sign | undefined {
  return byId.get(id.toLowerCase());
}

export function getAllSigns(): Sign[] {
  return SIGNS;
}

export function getSignIds(): string[] {
  return SIGNS.map((s) => s.id);
}

/**
 * The status a sign page should actually render. A sign marked `available`
 * with zero inventory remaining automatically falls back to `waitlist`.
 */
export function effectiveStatus(
  sign: Sign,
  inventoryOverride?: number | null
): SignStatus {
  const remaining = inventoryOverride ?? sign.inventory;
  if (sign.status === "available" && remaining !== null && remaining <= 0) {
    return "waitlist";
  }
  return sign.status;
}
