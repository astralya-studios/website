"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { track, AnalyticsEvents } from "@/lib/analytics";

export default function WaitlistForm({
  signId,
  signName,
}: {
  signId: string;
  signName: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setState("done");
      track(AnalyticsEvents.JOIN_WAITLIST, { signId });
    } catch {
      setState("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-200/30 bg-emerald-200/10 p-5 text-center"
      >
        <p className="font-display text-xl text-cream-50">You&apos;re in.</p>
        <p className="mt-1 text-sm text-cream-100/70">
          We&apos;ll email you the moment {signName} is ready.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <label
        htmlFor={`waitlist-email-${signId}`}
        className="mb-2 block text-sm font-medium text-cream-100/80"
      >
        Get notified when {signName} drops
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`waitlist-email-${signId}`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "sending"}
          className="h-12 flex-1 rounded-full border border-cream-50/20 bg-night-950/60 px-5 text-cream-50 placeholder:text-cream-100/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-12 rounded-full bg-cream-50 px-7 text-sm font-bold uppercase tracking-[0.15em] text-night-900 transition hover:bg-cream-100 disabled:opacity-60"
        >
          {state === "sending" ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {message}
        </p>
      )}
    </form>
  );
}
