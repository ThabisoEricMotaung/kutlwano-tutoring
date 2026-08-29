"use client";
import { useState } from "react";
import { money } from "@/lib/festive-offer";
import type { AdminPurchaseRow } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  cancelled: "Cancelled",
  failed: "Failed",
};

export default function AdminDashboard({
  initialPurchases,
}: {
  initialPurchases: AdminPurchaseRow[];
}) {
  const [purchases, setPurchases] =
    useState<AdminPurchaseRow[]>(initialPurchases);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyReference, setBusyReference] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function search(q: string) {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(
        `/api/admin/purchases${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Search failed");
      setPurchases(data.purchases);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function verify(reference: string) {
    setBusyReference(reference);
    setError("");
    try {
      const r = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Verification failed");
      setPurchases((prev) =>
        prev.map((p) => (p.reference === reference ? data.purchase : p)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusyReference(null);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(query);
        }}
        className="flex gap-2"
      >
        <input
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
              search("");
            }}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="bg-white border border-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-line">
              <th className="p-3">EFT reference</th>
              <th className="p-3">Learner / contact</th>
              <th className="p-3">Email</th>
              <th className="p-3">Telephone</th>
              <th className="p-3">Package / subject</th>
              <th className="p-3">Amount due</th>
              <th className="p-3">Booked</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-text-muted">
                  No matching EFT bookings.
                </td>
              </tr>
            )}
            {purchases.map((p) => (
              <tr key={p.reference} className="border-b border-line last:border-0">
                <td className="p-3 font-mono font-semibold text-primary">
                  {p.eft_payment_reference || "—"}
                </td>
                <td className="p-3">{p.customer_name}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">{p.telephone || "—"}</td>
                <td className="p-3">
                  {p.package_id} / {p.subject}
                </td>
                <td className="p-3 font-semibold">
                  {money(p.charged_zar_minor, "ZAR")}
                </td>
                <td className="p-3">
                  {new Date(p.created_at).toLocaleDateString("en-ZA")}
                </td>
                <td className="p-3">
                  {STATUS_LABEL[p.status] || p.status}
                </td>
                <td className="p-3">
                  {p.payment_method === "eft" &&
                  p.status === "awaiting_payment" ? (
                    <button
                      onClick={() => verify(p.reference)}
                      disabled={busyReference === p.reference}
                      className="bg-accent text-white font-semibold rounded-lg px-3 py-1.5 disabled:opacity-60"
                    >
                      {busyReference === p.reference
                        ? "Verifying…"
                        : "Verify payment"}
                    </button>
                  ) : p.status === "paid" ? (
                    <span className="text-green-700 font-semibold">
                      ✓ Verified
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
