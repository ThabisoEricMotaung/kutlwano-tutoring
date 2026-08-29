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
    "select reference,package_id,subject,customer_name,email,currency,display_amount_minor,charged_zar_minor,status,payment_method,eft_payment_reference,eft_received_amount_minor,pf_payment_id,created_at from festive_purchases where reference=$1",
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

const ADMIN_PURCHASE_COLUMNS =
  "reference,eft_payment_reference,customer_name,email,telephone,package_id,subject,currency,display_amount_minor,charged_zar_minor,eft_received_amount_minor,status,payment_method,created_at,verified_at";

export type AdminPurchaseRow = {
  reference: string;
  eft_payment_reference: string | null;
  customer_name: string;
  email: string;
  telephone: string;
  package_id: string;
  subject: string;
  currency: string;
  display_amount_minor: number;
  charged_zar_minor: number;
  eft_received_amount_minor: number | null;
  status: string;
  payment_method: string;
  created_at: string;
  verified_at: string | null;
};

export type AdminPurchaseView = "awaiting" | "verified" | "all";

// Deliberately excludes learner_first_name, guardian consent, marketing
// consent, learning_goal and preferred_times: the admin payment-verification
// view has no need for that data.
export async function listEftPurchases(
  params: { search?: string; view?: AdminPurchaseView } = {},
): Promise<AdminPurchaseRow[]> {
  const { view = "awaiting" } = params;
  const trimmed = params.search?.trim();
  const conditions = ["payment_method='eft'"];
  const values: string[] = [];

  if (view === "awaiting") conditions.push("status='awaiting_payment'");
  else if (view === "verified") conditions.push("status='paid'");
  else conditions.push("status in ('awaiting_payment','paid')");

  if (trimmed) {
    values.push(`%${trimmed}%`);
    conditions.push(
      `(eft_payment_reference ilike $${values.length} or reference ilike $${values.length} or email ilike $${values.length} or customer_name ilike $${values.length})`,
    );
  }

  const orderBy =
    view === "awaiting"
      ? "created_at asc"
      : view === "verified"
        ? "verified_at desc"
        : "created_at desc";

  const r = await db().query(
    `select ${ADMIN_PURCHASE_COLUMNS} from festive_purchases where ${conditions.join(" and ")} order by ${orderBy} limit 100`,
    values,
  );
  return r.rows;
}

export type VerifyEftPaymentResult =
  | { outcome: "verified" | "already_verified"; purchase: AdminPurchaseRow }
  | { outcome: "not_found" }
  | { outcome: "rejected"; purchase: AdminPurchaseRow }
  | {
      outcome: "amount_mismatch";
      expectedMinor: number;
      receivedMinor: number;
      purchase: AdminPurchaseRow;
    };

// Single atomic UPDATE gated on payment_method='eft', status='awaiting_payment'
// AND charged_zar_minor=receivedMinor is the only thing that can ever move a
// booking to paid here. A wrong amount, a second/duplicate click, or a
// non-EFT/non-awaiting booking all affect zero rows and fall through to the
// read-only lookup below to classify exactly why, instead of ever writing a
// false "paid" state.
export async function verifyEftPayment(
  reference: string,
  receivedMinor: number,
): Promise<VerifyEftPaymentResult> {
  const updated = await db().query(
    `update festive_purchases set status='paid',verified_at=now(),updated_at=now(),eft_received_amount_minor=$2 where reference=$1 and payment_method='eft' and status='awaiting_payment' and charged_zar_minor=$2 returning ${ADMIN_PURCHASE_COLUMNS}`,
    [reference, receivedMinor],
  );
  if (updated.rowCount === 1)
    return { outcome: "verified", purchase: updated.rows[0] };

  const existing = await db().query(
    `select ${ADMIN_PURCHASE_COLUMNS} from festive_purchases where reference=$1`,
    [reference],
  );
  const purchase = existing.rows[0];
  if (!purchase) return { outcome: "not_found" };
  if (purchase.payment_method === "eft" && purchase.status === "paid")
    return { outcome: "already_verified", purchase };
  if (purchase.payment_method === "eft" && purchase.status === "awaiting_payment")
    return {
      outcome: "amount_mismatch",
      expectedMinor: purchase.charged_zar_minor,
      receivedMinor,
      purchase,
    };
  return { outcome: "rejected", purchase };
}

export type AdminEftSummary = {
  awaitingCount: number;
  awaitingTotalMinor: number;
  verifiedThisMonthCount: number;
  verifiedThisMonthTotalMinor: number;
};

// Read-only aggregate over the same rows listEftPurchases already exposes -
// purely for dashboard display, no bearing on verification itself.
export async function getEftAdminSummary(): Promise<AdminEftSummary> {
  const r = await db().query(
    `select
       count(*) filter (where status='awaiting_payment') as awaiting_count,
       coalesce(sum(charged_zar_minor) filter (where status='awaiting_payment'), 0) as awaiting_total_minor,
       count(*) filter (where status='paid' and verified_at >= date_trunc('month', now())) as verified_this_month_count,
       coalesce(sum(eft_received_amount_minor) filter (where status='paid' and verified_at >= date_trunc('month', now())), 0) as verified_this_month_total_minor
     from festive_purchases where payment_method='eft'`,
  );
  const row = r.rows[0];
  return {
    awaitingCount: Number(row.awaiting_count),
    awaitingTotalMinor: Number(row.awaiting_total_minor),
    verifiedThisMonthCount: Number(row.verified_this_month_count),
    verifiedThisMonthTotalMinor: Number(row.verified_this_month_total_minor),
  };
}
