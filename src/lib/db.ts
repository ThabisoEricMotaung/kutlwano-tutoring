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
}) {
  await db().query(
    `insert into festive_purchases(reference,package_id,subject,grade,customer_name,email,telephone,country,timezone,learning_goal,preferred_times,currency,display_amount_minor,charged_zar_minor,learner_type,learner_first_name,guardian_consent_version,guardian_consent_at,terms_version,terms_accepted_at,marketing_consent,marketing_consent_at,status) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,'pending')`,
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
    ],
  );
}
export async function getPurchase(reference: string) {
  const r = await db().query(
    "select reference,package_id,subject,customer_name,email,currency,display_amount_minor,charged_zar_minor,status,pf_payment_id,created_at from festive_purchases where reference=$1",
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
