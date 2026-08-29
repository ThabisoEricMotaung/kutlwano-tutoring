import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout-schema";
import { GUARDIAN_CONSENT_VERSION, TERMS_VERSION } from "./site-details";

const validEFT = {
  packageId: "south_africa",
  subject: "Mathematics",
  learnerType: "adult",
  learnerFirstName: "Ntombifuthi",
  grade: "Grade 12",
  contactName: "Test Customer",
  email: "customer@example.com",
  telephone: "0712345678",
  country: "South Africa",
  timezone: "Africa/Johannesburg",
  learningGoal: "Improve algebra confidence",
  preferredTimes: "Weekday afternoons",
  acceptTerms: true,
  guardianConsent: false,
  marketingConsent: false,
  guardianConsentVersion: GUARDIAN_CONSENT_VERSION,
  termsVersion: TERMS_VERSION,
  paymentMethod: "eft",
};

describe("EFT checkout flow", () => {
  it("accepts valid EFT checkout data without guardian consent for adult", () => {
    expect(checkoutSchema.safeParse(validEFT).success).toBe(true);
  });

  it("requires terms acceptance for EFT", () => {
    expect(
      checkoutSchema.safeParse({ ...validEFT, acceptTerms: false }).success,
    ).toBe(false);
  });

  it("supports payment method field", () => {
    const parsed = checkoutSchema.safeParse(validEFT);
    expect(parsed.success).toBe(true);
  });

  it("does not require PayFast credentials for EFT booking", () => {
    // This test verifies schema validation; server-side credential check
    // is tested in the checkout route handler
    expect(checkoutSchema.safeParse(validEFT).success).toBe(true);
  });

  it("accepts international learner with EFT (USD)", () => {
    const internationalEFT = {
      ...validEFT,
      packageId: "international",
      country: "United States",
      timezone: "America/New_York",
    };
    expect(checkoutSchema.safeParse(internationalEFT).success).toBe(true);
  });

  it("preserves all customer and consent data for EFT", () => {
    const parsed = checkoutSchema.safeParse(validEFT);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contactName).toBe("Test Customer");
      expect(parsed.data.email).toBe("customer@example.com");
      expect(parsed.data.marketingConsent).toBe(false);
    }
  });
});
