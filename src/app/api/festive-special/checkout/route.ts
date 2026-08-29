import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout-schema";
import { createPurchase } from "@/lib/db";
import { FESTIVE_OFFER, isOfferPurchasable } from "@/lib/festive-offer";
import { payfastHost, signature } from "@/lib/payfast";
export async function POST(request: Request) {
  try {
    if (!isOfferPurchasable())
      return NextResponse.json(
        { error: "This offer has ended and is no longer accepting purchases." },
        { status: 410 },
      );
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Please correct the highlighted fields.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    const merchantId = process.env.PAYFAST_MERCHANT_ID,
      merchantKey = process.env.PAYFAST_MERCHANT_KEY,
      passphrase = process.env.PAYFAST_PASSPHRASE;
    if (!merchantId || !merchantKey || !passphrase || !process.env.DATABASE_URL)
      return NextResponse.json(
        {
          error:
            "Secure checkout is awaiting merchant configuration. Please contact WanoTuts.",
        },
        { status: 503 },
      );
    const pkg = FESTIVE_OFFER.packages[parsed.data.packageId];
    const rate = Number(process.env.PAYFAST_USD_TO_ZAR_RATE);
    if (pkg.currency === "USD" && (!Number.isFinite(rate) || rate <= 0))
      return NextResponse.json(
        {
          error:
            "International checkout is awaiting the configured USD/ZAR conversion rate.",
        },
        { status: 503 },
      );
    const chargedZarMinor =
      pkg.currency === "ZAR"
        ? pkg.specialMinor
        : Math.round(pkg.specialMinor * rate);
    const reference = `WDLB-${randomUUID()}`;
    await createPurchase({
      reference,
      packageId: pkg.id,
      subject: parsed.data.subject,
      grade: parsed.data.grade,
      learnerType: parsed.data.learnerType,
      learnerFirstName: parsed.data.learnerFirstName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      telephone: parsed.data.telephone,
      country: parsed.data.country,
      timezone: parsed.data.timezone,
      learningGoal: parsed.data.learningGoal,
      preferredTimes: parsed.data.preferredTimes,
      currency: pkg.currency,
      displayMinor: pkg.specialMinor,
      chargedZarMinor,
      guardianConsentVersion:
        parsed.data.learnerType === "minor"
          ? parsed.data.guardianConsentVersion
          : null,
      guardianConsentAt:
        parsed.data.learnerType === "minor" ? new Date() : null,
      termsVersion: parsed.data.termsVersion,
      termsAcceptedAt: new Date(),
      marketingConsent: parsed.data.marketingConsent,
      marketingConsentAt: parsed.data.marketingConsent ? new Date() : null,
    });
    const base =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${base}/festive-special/success?reference=${encodeURIComponent(reference)}`,
      cancel_url: `${base}/festive-special/cancelled?reference=${encodeURIComponent(reference)}`,
      notify_url: `${base}/api/payfast/itn`,
      name_first: parsed.data.contactName.split(" ")[0],
      email_address: parsed.data.email,
      cell_number: parsed.data.telephone,
      m_payment_id: reference,
      amount: (chargedZarMinor / 100).toFixed(2),
      item_name: `WanoTuts - ${FESTIVE_OFFER.name}`,
      item_description: `${FESTIVE_OFFER.lessonCount} x ${FESTIVE_OFFER.lessonMinutes}-minute lessons`,
    };
    fields.signature = signature(fields, passphrase);
    return NextResponse.json({
      action: `${payfastHost()}/eng/process`,
      fields,
    });
  } catch (error) {
    console.error(
      "Checkout initialization failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Checkout could not be started. Please try again." },
      { status: 500 },
    );
  }
}
