import type { SignStatus } from "@/lib/catalog";

const styles: Record<SignStatus, string> = {
  available:
    "border-emerald-200/40 bg-emerald-200/10 text-emerald-100",
  preorder: "border-starlight-300/40 bg-starlight-400/10 text-starlight-200",
  waitlist: "border-cream-50/25 bg-cream-50/5 text-cream-100/80",
};

const labels: Record<SignStatus, string> = {
  available: "Available now",
  preorder: "Preorder",
  waitlist: "Waitlist",
};

export default function StatusPill({ status }: { status: SignStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles[status]}`}
    >
      <span
        aria-hidden="true"
        className="mr-2 h-1.5 w-1.5 rounded-full bg-current"
      />
      {labels[status]}
    </span>
  );
}
