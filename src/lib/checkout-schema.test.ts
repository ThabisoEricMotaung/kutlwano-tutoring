import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout-schema";
import { GUARDIAN_CONSENT_VERSION, TERMS_VERSION } from "./site-details";
const valid = {
  packageId: "south_africa",
  subject: "Mathematics",
  learnerType: "minor",
  learnerFirstName: "Lebo",
  grade: "Grade 10",
  contactName: "Test Guardian",
  email: "guardian@example.com",
  telephone: "0712345678",
  country: "South Africa",
  timezone: "Africa/Johannesburg",
  learningGoal: "Improve algebra confidence",
  preferredTimes: "Weekday afternoons",
  acceptTerms: true,
  guardianConsent: true,
  marketingConsent: false,
  guardianConsentVersion: GUARDIAN_CONSENT_VERSION,
  termsVersion: TERMS_VERSION,
};
describe("festive checkout validation", () => {
  it("accepts complete guardian-authorised details", () =>
    expect(checkoutSchema.safeParse(valid).success).toBe(true));
  it("requires guardian consent for a minor", () =>
    expect(
      checkoutSchema.safeParse({ ...valid, guardianConsent: false }).success,
    ).toBe(false));
  it("keeps marketing consent optional", () =>
    expect(
      checkoutSchema.safeParse({ ...valid, marketingConsent: false }).success,
    ).toBe(true));
  it("requires terms acceptance", () =>
    expect(
      checkoutSchema.safeParse({ ...valid, acceptTerms: false }).success,
    ).toBe(false));
  it("rejects browser-submitted prices by stripping them", () =>
    expect("price" in checkoutSchema.parse({ ...valid, price: "1.00" })).toBe(
      false,
    ));
});
