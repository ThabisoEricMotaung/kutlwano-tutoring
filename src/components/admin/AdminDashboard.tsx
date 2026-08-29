"use client";
import { useEffect, useState } from "react";
import { money, packageLabel } from "@/lib/festive-offer";
import { formatShortDate, formatShortDateTime } from "@/lib/format";
import type {
  AdminEftSummary,
  AdminPurchaseRow,
  AdminPurchaseView,
} from "@/lib/db";
import StatusBadge from "./StatusBadge";
import SummaryCards from "./SummaryCards";
import RecentActivity from "./RecentActivity";
import VerificationTipsPanel from "./VerificationTipsPanel";
import VerifyPaymentModal from "./VerifyPaymentModal";
import EftReference from "./EftReference";

const TABS: { view: AdminPurchaseView; label: string }[] = [
  { view: "awaiting", label: "Awaiting" },
  { view: "verified", label: "Verified" },
  { view: "all", label: "All" },
];

function emptyStateMessage(view: AdminPurchaseView, hasQuery: boolean) {
  if (hasQuery) return "No payments match your search.";
  if (view === "awaiting") return "No payments awaiting verification.";
  if (view === "verified") return "No verified EFT payments yet.";
  return "No EFT payments found.";
}

export default function AdminDashboard({
  initialPurchases,
  initialSummary,
}: {
  initialPurchases: AdminPurchaseRow[];
  initialSummary: AdminEftSummary | null;
}) {
  const [view, setView] = useState<AdminPurchaseView>("awaiting");
  const [purchases, setPurchases] =
    useState<AdminPurchaseRow[]>(initialPurchases);
  const [recentActivity, setRecentActivity] = useState<AdminPurchaseRow[]>([]);
  const [summary, setSummary] = useState<AdminEftSummary | null>(
    initialSummary,
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    message: string;
    showViewVerifiedLink: boolean;
  } | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<AdminPurchaseRow | null>(
    null,
  );

  async function loadPurchases(nextView: AdminPurchaseView, q: string) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ view: nextView });
      if (q) params.set("q", q);
      const r = await fetch(`/api/admin/purchases?${params.toString()}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Search failed");
      setPurchases(data.purchases);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadRecentActivity() {
    try {
      const r = await fetch("/api/admin/purchases?view=verified");
      const data = await r.json();
      if (r.ok) setRecentActivity(data.purchases);
    } catch {
      // recent activity is a nice-to-have, not worth surfacing an error for
    }
  }

  async function loadSummary() {
    try {
      const r = await fetch("/api/admin/summary");
      const data = await r.json();
      if (r.ok) setSummary(data);
    } catch {
      // summary cards degrade to "—" if this fails; not worth an error banner
    }
  }

  useEffect(() => {
    loadRecentActivity();
    // initialSummary already covers the first paint - no need to refetch here
  }, []);

  function selectTab(nextView: AdminPurchaseView) {
    setView(nextView);
    setSuccess(null);
    loadPurchases(nextView, query);
  }

  function handleVerified(
    updatedPurchase: AdminPurchaseRow,
    alreadyVerified: boolean,
  ) {
    setVerifyTarget(null);
    setSuccess({
      message: alreadyVerified
        ? `Payment ${updatedPurchase.eft_payment_reference || updatedPurchase.reference} was already verified.`
        : `Payment ${updatedPurchase.eft_payment_reference || updatedPurchase.reference} verified successfully.`,
      showViewVerifiedLink: view === "awaiting",
    });
    loadPurchases(view, query);
    loadSummary();
    loadRecentActivity();
  }

  const columns = [
    "EFT reference",
    "Learner / contact",
    "Email",
    "Telephone",
    "Package / subject",
    "Amount due",
    "Amount received",
    "Booked",
    "Status",
    "Action",
  ];

  return (
    <div className="space-y-6">
      <SummaryCards summary={summary} />

      <div className="grid lg:grid-cols-[1fr_18rem] gap-6 items-start">
        <div className="space-y-4 min-w-0">
          <div className="flex gap-2" role="tablist" aria-label="Payment status">
            {TABS.map((t) => (
              <button
                key={t.view}
                role="tab"
                aria-selected={view === t.view}
                onClick={() => selectTab(t.view)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm focus-visible:outline-2 focus-visible:outline-offset-4 ${
                  view === t.view
                    ? "bg-primary text-white"
                    : "bg-white border border-line text-text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadPurchases(view, query);
            }}
            className="flex gap-2"
          >
            <label htmlFor="admin-search" className="sr-only">
              Search bookings
            </label>
            <input
              id="admin-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by EFT reference, booking reference, name or email"
              className="flex-1 border border-line rounded-lg px-3 py-2 bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
            >
              Search
            </button>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  loadPurchases(view, "");
                }}
                className="text-sm font-semibold text-primary underline underline-offset-4"
              >
                Clear
              </button>
            )}
          </form>

          {success && (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3">
              {success.message}
              {success.showViewVerifiedLink && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => selectTab("verified")}
                    className="underline underline-offset-4 font-semibold"
                  >
                    View in Verified
                  </button>
                </>
              )}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </p>
          )}

          {/* Desktop / tablet: table */}
          <div className="hidden md:block bg-white border border-line rounded-xl overflow-x-auto">
            <table className="w-full text-sm" aria-label="EFT payment bookings">
              <thead>
                <tr className="text-left border-b border-line">
                  {columns.map((c) => (
                    <th key={c} className="p-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="p-6 text-center text-text-muted"
                    >
                      {emptyStateMessage(view, query.trim() !== "")}
                    </td>
                  </tr>
                )}
                {purchases.map((p) => (
                  <tr key={p.reference} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <EftReference value={p.eft_payment_reference} />
                    </td>
                    <td className="p-3">{p.customer_name}</td>
                    <td className="p-3 break-words">{p.email}</td>
                    <td className="p-3">{p.telephone || "—"}</td>
                    <td className="p-3">
                      {packageLabel(p.package_id)} / {p.subject}
                    </td>
                    <td className="p-3 font-semibold">
                      {money(p.charged_zar_minor, "ZAR")}
                    </td>
                    <td className="p-3 font-semibold">
                      {p.eft_received_amount_minor != null
                        ? money(p.eft_received_amount_minor, "ZAR")
                        : "Not verified"}
                    </td>
                    <td className="p-3">{formatShortDate(p.created_at)}</td>
                    <td className="p-3">
                      <StatusBadge status={p.status} />
                      {p.status === "paid" && p.verified_at && (
                        <div className="text-xs text-text-muted mt-1">
                          {formatShortDateTime(p.verified_at)}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {p.payment_method === "eft" &&
                      p.status === "awaiting_payment" ? (
                        <button
                          onClick={() => setVerifyTarget(p)}
                          className="bg-accent text-white font-semibold rounded-lg px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                        >
                          Verify payment
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {purchases.length === 0 && (
              <li className="bg-white border border-line rounded-xl p-6 text-center text-text-muted">
                {emptyStateMessage(view, query.trim() !== "")}
              </li>
            )}
            {purchases.map((p) => (
              <li
                key={p.reference}
                className="bg-white border border-line rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <EftReference
                    value={p.eft_payment_reference}
                    className="text-lg break-all"
                  />
                  <StatusBadge status={p.status} />
                </div>
                <p className="font-semibold">{p.customer_name}</p>
                <p className="text-sm text-text-muted break-words">{p.email}</p>
                <p className="text-sm text-text-muted">
                  {packageLabel(p.package_id)} / {p.subject}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  <div>
                    <p className="text-text-muted">Amount due</p>
                    <p className="font-semibold text-base">
                      {money(p.charged_zar_minor, "ZAR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Amount received</p>
                    <p className="font-semibold text-base">
                      {p.eft_received_amount_minor != null
                        ? money(p.eft_received_amount_minor, "ZAR")
                        : "Not verified"}
                    </p>
                  </div>
                </div>
                {p.status === "paid" && p.verified_at && (
                  <p className="text-xs text-text-muted">
                    Verified {formatShortDateTime(p.verified_at)}
                  </p>
                )}
                {p.payment_method === "eft" &&
                  p.status === "awaiting_payment" && (
                    <button
                      onClick={() => setVerifyTarget(p)}
                      className="w-full mt-2 bg-accent text-white font-semibold rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      Verify payment
                    </button>
                  )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <VerificationTipsPanel />
          <RecentActivity items={recentActivity} />
        </div>
      </div>

      <VerifyPaymentModal
        purchase={verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onVerified={handleVerified}
      />
    </div>
  );
}
