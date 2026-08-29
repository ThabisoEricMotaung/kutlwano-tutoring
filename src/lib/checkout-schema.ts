import { z } from "zod";
import { FESTIVE_OFFER } from "./festive-offer";
import { GUARDIAN_CONSENT_VERSION, TERMS_VERSION } from "./site-details";
export const checkoutSchema = z
  .object({
    packageId: z.enum(["international", "south_africa"]),
    subject: z.enum(FESTIVE_OFFER.subjects),
    learnerType: z.enum(["adult", "minor"]),
    learnerFirstName: z.string().trim().min(1).max(60),
    grade: z.string().trim().max(30).optional().default(""),
    contactName: z.string().trim().min(2).max(100),
    email: z.email().max(100),
    telephone: z.string().trim().min(7).max(30),
    country: z.string().trim().min(2).max(80),
    timezone: z.string().trim().min(2).max(80),
    learningGoal: z.string().trim().min(10).max(1000),
    preferredTimes: z.string().trim().min(3).max(500),
    acceptTerms: z.literal(true),
    guardianConsent: z.boolean().default(false),
    marketingConsent: z.boolean().default(false),
    guardianConsentVersion: z.literal(GUARDIAN_CONSENT_VERSION),
    termsVersion: z.literal(TERMS_VERSION),
  })
  .superRefine((v, ctx) => {
    if (v.packageId === "south_africa" && !v.grade)
      ctx.addIssue({
        code: "custom",
        path: ["grade"],
        message: "Grade is required for South African learners.",
      });
    if (v.learnerType === "minor" && !v.guardianConsent)
      ctx.addIssue({
        code: "custom",
        path: ["guardianConsent"],
        message:
          "Parent or guardian confirmation is required for a learner under 18.",
      });
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;
