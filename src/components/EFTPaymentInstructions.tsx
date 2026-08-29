"use client";
import { useEffect, useState } from "react";
import { money } from "@/lib/festive-offer";

type EFTInstructions = {
  reference: string;
  status: string;
  amountMinor: number;
  currency: string;
  businessName: string;
  bankName: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankAccountType?: string;
  bankBranchCode?: string;
  disclosureText: string;
};

export default function EFTPaymentInstructions({
  reference,
  amountMinor,
}: {
  reference: string;
  amountMinor: number;
  currency: string;
}) {
  const [instructions, setInstructions] = useState<EFTInstructions | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const r = await window.fetch(
          `/api/festive-special/eft-instructions?reference=${encodeURIComponent(reference)}`
        );
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setInstructions(d);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load instructions");
      }
    }
    fetch();
  }, [reference]);

  if (error) {
    return (
      <div className="bg-white border border-line rounded-xl p-7 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-semibold">Payment instructions unavailable</p>
          <p className="text-sm text-red-800 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!instructions) {
    return (
      <div className="bg-white border border-line rounded-xl p-7">
        <p className="text-text-muted">Loading payment instructions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-line rounded-xl p-7 space-y-6">
        <div>
          <p className="text-accent font-semibold uppercase tracking-wider text-xs mb-2">
            Pay by EFT
          </p>
          <h1 className="font-display text-3xl font-bold mb-4">
            Your booking is received
          </h1>
          <p className="text-text-muted mb-4">
            {instructions.disclosureText} While our PayFast online payment facility is being activated, you can confirm your place by making a direct EFT payment to our business account.
          </p>
        </div>

        <div className="border-t border-line pt-6">
          <h2 className="font-semibold text-lg mb-4">EFT Payment Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <dt className="text-text-muted">Account holder</dt>
                <dd className="font-semibold">{instructions.bankAccountHolder}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Bank</dt>
                <dd className="font-semibold">{instructions.bankName}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Account number</dt>
                <dd className="font-mono font-semibold text-lg break-all">
                  {instructions.bankAccountNumber}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Account type</dt>
                <dd className="font-semibold">
                  {instructions.bankAccountType || "—"}
                </dd>
              </div>
              {instructions.bankBranchCode && (
                <div>
                  <dt className="text-text-muted">Branch code</dt>
                  <dd className="font-semibold">{instructions.bankBranchCode}</dd>
                </div>
              )}
            </div>
          </dl>
        </div>

        <div className="border-t border-line pt-6">
          <h2 className="font-semibold text-lg mb-4">Amount Due</h2>
          <div className="bg-soft rounded-lg p-4">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-text-muted">Total amount in ZAR</dt>
                <dd className="font-semibold text-lg">
                  {money(amountMinor, "ZAR")}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="font-semibold">Payment reference</dt>
                <dd className="font-mono font-bold text-primary break-all">
                  {reference}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <p className="font-semibold text-blue-900">
            ⚠️ Important: Use your booking reference exactly as shown
          </p>
          <p className="text-sm text-blue-800">
            Please use your WanoTuts booking reference (<strong>{reference}</strong>) in the payment reference or memo field when making your EFT transfer. This helps us match your payment to your booking quickly.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <p className="font-semibold text-amber-900">
            ✓ Booking confirmed once payment is verified
          </p>
          <p className="text-sm text-amber-800">
            Your booking is confirmed once payment has been received and verified. WanoTuts will contact you to arrange your first lesson.
          </p>
        </div>

        <div className="text-sm text-text-muted border-t border-line pt-6">
          <p className="mb-2">
            <strong>Secure online payments via PayFast are currently being activated and will be available soon.</strong>
          </p>
          <p>
            Your booking remains subject to the Booking Terms, Privacy Policy and Child Safeguarding Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
