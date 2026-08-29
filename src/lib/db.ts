import { randomInt } from "node:crypto";
import { Pool } from "pg";
let pool: Pool | undefined;
function db() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  }));
}

const EFT_PAYMENT_REFERENCE_CONSTRAINT =
  "festive_purchases_eft_payment_reference_idx";
const MAX_EFT_PAYMENT_REFERENCE_ATTEMPTS = 5;

function generateEftPaymentReference() {
  return `WT-${randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
}

function isEftPaymentReferenceCollision(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "23505" &&
    (error as { constraint?: string }).constraint ===
      EFT_PAYMENT_REFERENCE_CONSTRAINT
  );
}

export async function createPurchase(p: {
  reference: string;
  packageId: string;
  subject: string;
  grade: string;
  learnerType: string;
  learnerFirstName: string;
  contactName: string;
  email: string;
  telephone: string;
  country: string;
  timezone: string;
  learningGoal: string;
  preferredTimes: string;
  currency: string;
  displayMinor: number;
  chargedZarMinor: number;
  guardianConsentVersion: string | null;
  guardianConsentAt: Date | null;
  termsVersion: string;
  termsAcceptedAt: Date;
  marketingConsent: boolean;
  marketingConsentAt: Date | null;
  paymentMethod: "eft" | "payfast";
  status: "awaiting_payment" | "pending";
}) {
  const isEft = p.paymentMethod === "eft";
  for (let attempt = 0; ; attempt++) {
    const eftPaymentReference = isEft ? generateEftPaymentReference() : null;
    try {
      await db().query(
        `insert into festive_purchases(reference,package_id,subject,grade,customer_name,email,telephone,country,timezone,learning_goal,preferred_times,currency,display_amount_minor,charged_zar_minor,learner_type,learner_first_name,guardian_consent_version,guardian_consent_at,terms_version,terms_accepted_at,marketing_consent,marketing_consent_at,status,payment_method,eft_payment_reference) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
        [
          p.reference,
          p.packageId,
          p.subject,
          p.grade,
          p.contactName,
          p.email,
          p.telephone,
          p.country,
          p.timezone,
          p.learningGoal,
          p.preferredTimes,
          p.currency,
          p.displayMinor,
          p.chargedZarMinor,
          p.learnerType,
          p.learnerFirstName,
          p.guardianConsentVersion,
          p.guardianConsentAt,
          p.termsVersion,
          p.termsAcceptedAt,
          p.marketingConsent,
          p.marketingConsentAt,
          p.status,
          p.paymentMethod,
          eftPaymentReference,
        ],
      );
      return eftPaymentReference;
    } catch (error) {
      if (
        isEft &&
        isEftPaymentReferenceCollision(error) &&
        attempt < MAX_EFT_PAYMENT_REFERENCE_ATTEMPTS - 1
      )
        continue;
      throw error;
    }
  }
}
export async function getPurchase(reference: string) {
  const r = await db().query(
    "select reference,package_id,subject,customer_name,email,currency,display_amount_minor,charged_zar_minor,status,payment_method,eft_payment_reference,pf_payment_id,created_at from festive_purchases where reference=$1",
    [reference],
  );
  return r.rows[0] as undefined | Record<string, unknown>;
}
export async function completePurchase(
  reference: string,
  pfId: string,
  status: string,
) {
  const r = await db().query(
    `update festive_purchases set status=$2,pf_payment_id=coalesce(pf_payment_id,$3),verified_at=case when $2='completed' then coalesce(verified_at,now()) else verified_at end,updated_at=now() where reference=$1 and (pf_payment_id is null or pf_payment_id=$3) returning reference`,
    [reference, status, pfId],
  );
  return r.rowCount === 1;
}
