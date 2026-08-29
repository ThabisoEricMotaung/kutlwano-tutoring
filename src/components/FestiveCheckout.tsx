"use client";
import { useState } from "react";
import Link from "next/link";
import { FESTIVE_OFFER, money, type PackageId } from "@/lib/festive-offer";
import { GUARDIAN_CONSENT_VERSION, TERMS_VERSION } from "@/lib/site-details";
function track(event: string, detail: Record<string, string> = {}) {
  window.dispatchEvent(
    new CustomEvent("wanotuts:analytics", { detail: { event, ...detail } }),
  );
  const w = window as typeof window & { dataLayer?: Record<string, string>[] };
  w.dataLayer?.push({ event, ...detail });
}
export default function FestiveCheckout() {
  const [packageId, setPackageId] = useState<PackageId>("south_africa"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [learnerType, setLearnerType] = useState<"adult" | "minor">("adult"),
    [paymentMethod, setPaymentMethod] = useState<"eft" | "payfast">("eft");
  const pkg = FESTIVE_OFFER.packages[packageId];
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    track("festive_checkout_started", {
      package: packageId,
      paymentMethod,
    });
    const form = new FormData(e.currentTarget);
    const body: Record<string, FormDataEntryValue | boolean> =
      Object.fromEntries(form);
    body.acceptTerms = form.get("acceptTerms") === "on";
    body.guardianConsent = form.get("guardianConsent") === "on";
    body.marketingConsent = form.get("marketingConsent") === "on";
    body.paymentMethod = paymentMethod;
    try {
      const r = await fetch("/api/festive-special/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      // EFT payment: redirect to success page with reference
      if (data.method === "eft") {
        window.location.href = `/festive-special/success?reference=${encodeURIComponent(data.reference)}`;
        return;
      }

      // PayFast payment: create hidden form and submit
      const f = document.createElement("form");
      f.method = "post";
      f.action = data.action;
      Object.entries(data.fields as Record<string, string>).forEach(
        ([name, value]) => {
          const i = document.createElement("input");
          i.type = "hidden";
          i.name = name;
          i.value = value;
          f.appendChild(i);
        },
      );
      document.body.appendChild(f);
      f.submit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Checkout could not be started.",
      );
      track("festive_payment_failed", {
        stage: "checkout",
        paymentMethod,
      });
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="bg-white border border-line rounded-xl p-6 md:p-8 shadow-sm space-y-6"
      noValidate={false}
    >
      <div>
        <h2 className="font-display font-bold text-3xl mb-2">
          Choose and pay securely
        </h2>
        <p className="text-sm text-text-muted">
          Your package price is recalculated securely on the server.
        </p>
      </div>
      <fieldset>
        <legend className="font-semibold mb-3">Learner package</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.values(FESTIVE_OFFER.packages).map((p) => (
            <label
              key={p.id}
              className={`border rounded-lg p-4 cursor-pointer ${packageId === p.id ? "border-primary bg-soft" : "border-line"}`}
            >
              <input
                type="radio"
                name="packageId"
                value={p.id}
                checked={packageId === p.id}
                onChange={() => {
                  setPackageId(p.id);
                  track("festive_package_selected", { package: p.id });
                }}
                className="mr-2"
              />
              <span className="font-semibold">{p.label}</span>
              <span className="block text-sm text-text-muted mt-1">
                {p.comparisonSupported && (
                  <s>{money(p.regularMinor, p.currency)}</s>
                )}{" "}
                <strong className="text-primary">
                  {money(p.specialMinor, p.currency)}
                </strong>{" "}
                {p.comparisonSupported && (
                  <>
                    · save {money(p.regularMinor - p.specialMinor, p.currency)}
                  </>
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold mb-3">Payment method</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <label
            className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === "eft" ? "border-primary bg-soft" : "border-line"}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="eft"
              checked={paymentMethod === "eft"}
              onChange={() => {
                setPaymentMethod("eft");
                track("festive_payment_method_selected", { method: "eft" });
              }}
              className="mr-2"
            />
            <span className="font-semibold">Pay by EFT</span>
            <span className="block text-sm text-text-muted mt-1">
              Direct bank transfer to our business account
            </span>
          </label>
          <label
            className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === "payfast" ? "border-primary bg-soft" : "border-line"}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="payfast"
              checked={paymentMethod === "payfast"}
              onChange={() => {
                setPaymentMethod("payfast");
                track("festive_payment_method_selected", { method: "payfast" });
              }}
              className="mr-2"
            />
            <span className="font-semibold">PayFast (Coming soon)</span>
            <span className="block text-sm text-text-muted mt-1">
              Secure online payment (currently being activated)
            </span>
          </label>
        </div>
      </fieldset>
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="font-medium text-sm">
          Learner age group
          <select
            name="learnerType"
            required
            className="field"
            value={learnerType}
            onChange={(e) =>
              setLearnerType(e.target.value as "adult" | "minor")
            }
          >
            <option value="adult">18 or older</option>
            <option value="minor">Under 18</option>
          </select>
        </label>
        <label className="font-medium text-sm">
          Learner&apos;s first name
          <input
            name="learnerFirstName"
            required
            maxLength={60}
            className="field"
            autoComplete="off"
          />
        </label>
        <label className="font-medium text-sm">
          Subject
          <select name="subject" required className="field">
            {FESTIVE_OFFER.subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="font-medium text-sm">
          Grade{" "}
          {packageId === "south_africa" && <span aria-hidden="true">*</span>}
          <input
            name="grade"
            required={packageId === "south_africa"}
            className="field"
            placeholder="e.g. Grade 10"
          />
        </label>
        <label className="font-medium text-sm">
          {learnerType === "minor" ? "Parent or guardian name" : "Your name"}
          <input
            name="contactName"
            required
            minLength={2}
            className="field"
            autoComplete="name"
          />
        </label>
        <label className="font-medium text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="field"
            autoComplete="email"
          />
        </label>
        <label className="font-medium text-sm">
          Telephone
          <input
            name="telephone"
            type="tel"
            required
            minLength={7}
            className="field"
            autoComplete="tel"
          />
        </label>
        <label className="font-medium text-sm">
          Country
          <input
            name="country"
            required
            className="field"
            autoComplete="country-name"
          />
        </label>
        <label className="font-medium text-sm">
          Time zone
          <input
            name="timezone"
            required
            className="field"
            placeholder="e.g. Africa/Johannesburg"
          />
        </label>
        <label className="font-medium text-sm">
          Preferred lesson times
          <input
            name="preferredTimes"
            required
            className="field"
            placeholder="e.g. Weekday afternoons"
          />
        </label>
      </div>
      <label className="font-medium text-sm block">
        Learning goal
        <textarea
          name="learningGoal"
          required
          minLength={10}
          className="field min-h-28"
        />
      </label>
      <input
        type="hidden"
        name="guardianConsentVersion"
        value={GUARDIAN_CONSENT_VERSION}
      />
      <input type="hidden" name="termsVersion" value={TERMS_VERSION} />
      {learnerType === "minor" && (
        <label className="flex gap-3 text-sm text-text-muted">
          <input
            type="checkbox"
            name="guardianConsent"
            required
            className="mt-1"
          />
          <span>
            I confirm that I am the learner&apos;s parent or legally authorised
            guardian, and I consent to WanoTuts processing the information
            supplied for lesson administration, payment, scheduling and
            communication. Read the{" "}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      )}
      <label className="flex gap-3 text-sm text-text-muted">
        <input type="checkbox" name="acceptTerms" required className="mt-1" />
        <span>
          I accept the{" "}
          <Link
            href="/terms"
            className="text-primary underline underline-offset-2"
          >
            Booking and Tutoring Terms
          </Link>
          , including cancellation, rescheduling and expiry terms.
        </span>
      </label>
      <label className="flex gap-3 text-sm text-text-muted">
        <input type="checkbox" name="marketingConsent" className="mt-1" />
        <span>
          I would like to receive optional WanoTuts news, learning resources and
          future offers. This is optional and can be withdrawn by emailing
          WanoTuts.
        </span>
      </label>
      <p className="text-xs text-text-muted">
        Microsoft Teams lessons are not recorded by default. Recording would
        require separate, specific consent and is not enabled by this form. See
        the{" "}
        <Link href="/child-safeguarding" className="text-primary underline">
          Child Safeguarding Policy
        </Link>
        .
      </p>
      {error && (
        <p
          role="alert"
          className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg"
        >
          {error}
        </p>
      )}
      <button
        disabled={busy || paymentMethod === "payfast"}
        className="w-full sm:w-auto font-semibold px-7 py-3.5 rounded-sm bg-primary text-white hover:bg-accent disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {paymentMethod === "payfast"
          ? "PayFast payment (not yet available)"
          : busy
            ? "Preparing your booking…"
            : `Complete EFT booking`}
      </button>
    </form>
  );
}
