import { NextResponse } from "next/server";
import { joinWaitlist } from "@/lib/waitlist";

/** POST /api/waitlist — { signId, email } */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const { signId, email } = body as { signId?: string; email?: string };
  const result = await joinWaitlist(String(signId ?? ""), String(email ?? ""));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, duplicate: result.duplicate ?? false });
}
