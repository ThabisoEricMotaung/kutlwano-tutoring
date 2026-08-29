import { money } from "@/lib/festive-offer";
import type { AdminPurchaseRow } from "@/lib/db";

function formatVerifiedAt(verifiedAt: string | null) {
  if (!verifiedAt) return "";
  return new Date(verifiedAt).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentActivity({
  items,
}: {
  items: AdminPurchaseRow[];
}) {
  return (
    <div className="bg-white border border-line rounded-xl p-5">
      <h2 className="font-display text-lg font-bold mb-3">
        Recent verification activity
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-text-muted">
          No payments verified yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 5).map((p) => (
            <li key={p.reference} className="text-sm">
              <p className="font-mono font-semibold text-primary">
                {p.eft_payment_reference || "No reference"}
              </p>
              <p className="text-text-muted">
                {p.eft_received_amount_minor != null
                  ? money(p.eft_received_amount_minor, "ZAR")
                  : "—"}
                {p.verified_at ? ` · Verified ${formatVerifiedAt(p.verified_at)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
