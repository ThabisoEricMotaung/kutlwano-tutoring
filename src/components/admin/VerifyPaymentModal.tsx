"use client";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/festive-offer";
import type { AdminPurchaseRow } from "@/lib/db";
import EftReference from "./EftReference";

type Mismatch = {
  expectedMinor: number;
  receivedMinor: number;
  outstandingMinor: number;
  overpaymentMinor: number;
};

export default function VerifyPaymentModal({
  purchase,
  onClose,
  onVerified,
}: {
  purchase: AdminPurchaseRow | null;
  onClose: () => void;
  onVerified: (purchase: AdminPurchaseRow, alreadyVerified: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mismatch, setMismatch] = useState<Mismatch | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (purchase) {
      setReceivedAmount("");
      setError("");
      setMismatch(null);
      if (!dialog.open) dialog.showModal();
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
    if (dialog.open) dialog.close();
  }, [purchase]);

  // Fires on Escape and on dialog.close() - keeps the parent's `purchase`
  // state in sync however the dialog was dismissed.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  if (!purchase) {
    return <dialog ref={dialogRef} className="p-0 border-0 bg-transparent" />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!purchase) return;
    setBusy(true);
    setError("");
    setMismatch(null);
    try {
      const r = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference: purchase.reference, receivedAmount }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (typeof data.expectedMinor === "number") {
          setMismatch({
            expectedMinor: data.expectedMinor,
            receivedMinor: data.receivedMinor,
            outstandingMinor: data.outstandingMinor,
            overpaymentMinor: data.overpaymentMinor,
          });
          return;
        }
        throw new Error(data.error || "Verification failed");
      }
      onVerified(data.purchase, data.alreadyVerified);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="verify-payment-title"
      className="p-0 border-0 bg-transparent backdrop:bg-black/30"
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <form
        onSubmit={submit}
        className="w-[min(90vw,28rem)] max-h-[90vh] overflow-y-auto bg-white border border-line rounded-2xl shadow-lg p-6 space-y-4"
      >
        <h2
          id="verify-payment-title"
          className="font-display text-xl font-bold"
        >
          Verify EFT payment
        </h2>

        <dl className="text-sm space-y-1.5">
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Reference</dt>
            <dd>
              <EftReference value={purchase.eft_payment_reference} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Expected amount</dt>
            <dd className="font-semibold">
              {money(purchase.charged_zar_minor, "ZAR")}
            </dd>
          </div>
        </dl>

        <div>
          <label
            htmlFor="verify-received-amount"
            className="block text-sm font-semibold mb-1"
          >
            Amount actually received
          </label>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-text-muted">
              R
            </span>
            <input
              id="verify-received-amount"
              ref={inputRef}
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              inputMode="decimal"
              placeholder="450.00"
              required
              className="flex-1 border border-line rounded-lg px-3 py-2"
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            Confirm the reference and amount against the bank transaction
            before continuing.
          </p>
        </div>

        {mismatch && (
          <div
            role="alert"
            className="bg-[#f9f0dd] border border-[#d2ae61] rounded-lg p-3 text-sm space-y-1"
          >
            <p className="font-semibold text-[#8a651e]">
              Payment does not match
            </p>
            <p>Expected: {money(mismatch.expectedMinor, "ZAR")}</p>
            <p>Received: {money(mismatch.receivedMinor, "ZAR")}</p>
            {mismatch.outstandingMinor > 0 ? (
              <p>Outstanding: {money(mismatch.outstandingMinor, "ZAR")}</p>
            ) : (
              <p>Overpayment: {money(mismatch.overpaymentMinor, "ZAR")}</p>
            )}
            <p className="text-text-muted">
              This booking remains awaiting payment.
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="text-sm font-semibold text-text-muted px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-primary text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {busy ? "Verifying…" : mismatch ? "Try again" : "Verify payment"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
