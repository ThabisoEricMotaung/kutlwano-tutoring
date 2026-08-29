export const SITE_DETAILS = {
  brand: "WanoTuts",
  operator: "Kutlwano Sehume",
  businessName: "Kopanong Ya Kutlwano Enterprise",
  legalDescription:
    "WanoTuts is operated by Kopanong Ya Kutlwano Enterprise. For inquiries, contact Kutlwano Sehume.",
  email: "sehumek@gmail.com",
  phoneDisplay: "+27 66 162 9578",
  phoneHref: "tel:+27661629578",
  privacyEmail: "sehumek@gmail.com",
} as const;

// Interim working policies: obtain professional South African legal review when resources permit.
export const POLICY_VERSION = "2026-08-25";
export const GUARDIAN_CONSENT_VERSION =
  "guardian-service-consent-2026-08-25-v1";
export const TERMS_VERSION = "booking-terms-2026-08-25-v1";

// EFT banking configuration (loaded from environment, never hard-coded)
export function getBankingDetails() {
  if (typeof window !== "undefined") {
    throw new Error("Banking details must not be accessed from the browser");
  }
  return {
    businessName: process.env.WANOTUTS_BUSINESS_NAME || SITE_DETAILS.businessName,
    bankName: process.env.WANOTUTS_BANK_NAME || "",
    bankAccountHolder: process.env.WANOTUTS_BANK_ACCOUNT_HOLDER || "",
    bankAccountNumber: process.env.WANOTUTS_BANK_ACCOUNT_NUMBER || "",
    bankAccountType: process.env.WANOTUTS_BANK_ACCOUNT_TYPE || "",
    bankBranchCode: process.env.WANOTUTS_BANK_BRANCH_CODE || "",
  };
}
