import { money } from "@/lib/festive-offer";
import type { AdminEftSummary } from "@/lib/db";

export default function SummaryCards({
  summary,
}: {
  summary: AdminEftSummary | null;
}) {
  const cards = [
    {
      label: "Awaiting payment",
      value: summary ? String(summary.awaitingCount) : "—",
    },
    {
      label: "Verified this month",
      value: summary ? String(summary.verifiedThisMonthCount) : "—",
    },
    {
      label: "Total verified this month",
      value: summary ? money(summary.verifiedThisMonthTotalMinor, "ZAR") : "—",
    },
    {
      label: "Total awaiting value",
      value: summary ? money(summary.awaitingTotalMinor, "ZAR") : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-line rounded-xl p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {c.label}
          </p>
          <p className="font-display text-2xl font-bold text-primary mt-1">
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
