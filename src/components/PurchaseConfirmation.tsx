"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { money } from "@/lib/festive-offer";
type Purchase = {
  reference: string;
  status: string;
  packageId: string;
  subject: string;
  currency: string;
  amountMinor: number;
};
export default function PurchaseConfirmation({
  reference,
}: {
  reference: string;
}) {
  const [p, setP] = useState<Purchase | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let tries = 0;
    async function check() {
      try {
        const r = await fetch(
          `/api/festive-special/status?reference=${encodeURIComponent(reference)}`,
          { cache: "no-store" },
        );
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (active) setP(d);
        if (d.status === "pending" && tries++ < 10) setTimeout(check, 2000);
        if (d.status === "completed")
          window.dispatchEvent(
            new CustomEvent("wanotuts:analytics", {
              detail: {
                event: "festive_payment_completed",
                package: d.packageId,
              },
            }),
          );
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Status unavailable");
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [reference]);
  if (error)
    return (
      <State
        title="We can’t confirm this payment yet"
        body="No purchase has been marked successful. Please contact WanoTuts with your reference if payment left your account."
      />
    );
  if (!p || p.status === "pending")
    return (
      <State
        title="Payment verification in progress"
        body="PayFast confirmation can take a moment. This page will update automatically; your purchase is not confirmed yet."
      />
    );
  if (p.status !== "completed")
    return (
      <State
        title="Payment was not completed"
        body="No package has been confirmed. You can return to the offer page and try again."
      />
    );
  const url = process.env.NEXT_PUBLIC_CALENDLY_FESTIVE_SPECIAL_URL;
  return (
    <div className="space-y-7">
      <div className="bg-white border border-line rounded-xl p-7">
        <p className="text-accent font-semibold uppercase tracking-wider text-xs mb-2">
          Payment verified
        </p>
        <h1 className="font-display text-4xl font-bold mb-4">
          Your four-lesson package is confirmed.
        </h1>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-text-muted">Order reference</dt>
            <dd className="font-semibold break-all">{p.reference}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Amount paid</dt>
            <dd className="font-semibold">
              {money(p.amountMinor, p.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Subject</dt>
            <dd className="font-semibold">{p.subject}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Validity</dt>
            <dd className="font-semibold">1–31 December 2026</dd>
          </div>
        </dl>
        <p className="text-xs text-text-muted mt-5">
          Your booking remains subject to the{" "}
          <Link href="/terms" className="text-primary underline">
            Booking Terms
          </Link>
          ,{" "}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/child-safeguarding" className="text-primary underline">
            Child Safeguarding Policy
          </Link>
          .
        </p>
      </div>
      {url ? (
        <>
          <h2 className="font-display text-3xl font-bold">
            Schedule your first lesson
          </h2>
          <p className="text-text-muted">
            Choose the first of your four 60-minute Microsoft Teams lessons.
            Kutlwano will arrange the remaining three with you.
          </p>
          <iframe
            title="Schedule the first December Learning Boost lesson"
            src={`${url}?utm_source=wanotuts&utm_medium=website&utm_campaign=december_learning_boost`}
            className="w-full h-[720px] bg-white border border-line rounded-xl"
            onLoad={() =>
              window.dispatchEvent(
                new CustomEvent("wanotuts:analytics", {
                  detail: { event: "festive_scheduler_opened" },
                }),
              )
            }
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-primary"
          >
            Open the scheduler in a new tab
          </a>
        </>
      ) : (
        <State
          title="Scheduling link is being configured"
          body="Your purchase is confirmed. WanoTuts will contact you to schedule your first lesson once the dedicated 60-minute Calendly event is connected."
        />
      )}
    </div>
  );
}
function State({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-line rounded-xl p-8">
      <h1 className="font-display text-3xl font-bold mb-3">{title}</h1>
      <p className="text-text-muted">{body}</p>
    </div>
  );
}
