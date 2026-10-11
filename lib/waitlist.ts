/**
 * Waitlist store — file-based for v1.
 *
 * Signups live in `data/waitlist.json`. Swap this module for an email
 * provider (Klaviyo, Mailchimp, …) when ready — call sites won't change.
 */

import { promises as fs } from "fs";
import path from "path";
import { getSign } from "./catalog";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "waitlist.json");

export interface WaitlistEntry {
  signId: string;
  email: string;
  createdAt: string;
}

async function readAll(): Promise<WaitlistEntry[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as WaitlistEntry[];
  } catch {
    return [];
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  signId: string,
  email: string
): Promise<{ ok: boolean; duplicate?: boolean; error?: string }> {
  const sign = getSign(signId);
  if (!sign) return { ok: false, error: "Unknown sign." };
  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) return { ok: false, error: "Enter a valid email." };

  const entries = await readAll();
  if (entries.some((e) => e.signId === signId && e.email === clean)) {
    return { ok: true, duplicate: true };
  }
  entries.push({ signId, email: clean, createdAt: new Date().toISOString() });
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(entries, null, 2));
  return { ok: true };
}

export async function waitlistCount(signId: string): Promise<number> {
  const entries = await readAll();
  return entries.filter((e) => e.signId === signId).length;
}
