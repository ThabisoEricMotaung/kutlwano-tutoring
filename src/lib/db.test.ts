import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();

vi.mock("pg", () => ({
  Pool: vi.fn().mockImplementation(function PoolMock() {
    return { query: queryMock };
  }),
}));

import { createPurchase } from "./db";

function uniqueViolation() {
  return Object.assign(new Error("duplicate key value"), {
    code: "23505",
    constraint: "festive_purchases_eft_payment_reference_idx",
  });
}

const basePurchase = {
  reference: "WDLB-00000000-0000-0000-0000-000000000000",
  packageId: "south_africa",
  subject: "Mathematics",
  grade: "Grade 12",
  learnerType: "adult",
  learnerFirstName: "Ntombifuthi",
  contactName: "Test Customer",
  email: "customer@example.com",
  telephone: "0712345678",
  country: "South Africa",
  timezone: "Africa/Johannesburg",
  learningGoal: "Improve algebra confidence",
  preferredTimes: "Weekday afternoons",
  currency: "ZAR",
  displayMinor: 45000,
  chargedZarMinor: 45000,
  guardianConsentVersion: null,
  guardianConsentAt: null,
  termsVersion: "booking-terms-2026-08-25-v1",
  termsAcceptedAt: new Date(),
  marketingConsent: false,
  marketingConsentAt: null,
} as const;

describe("createPurchase EFT payment reference generation", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    queryMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("generates a WT-XXXXXX reference and stores it for EFT purchases", async () => {
    queryMock.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const ref = await createPurchase({
      ...basePurchase,
      paymentMethod: "eft",
      status: "awaiting_payment",
    });

    expect(ref).toMatch(/^WT-\d{6}$/);
    expect(queryMock).toHaveBeenCalledTimes(1);
    const [, params] = queryMock.mock.calls[0];
    expect(params.at(-1)).toBe(ref); // eft_payment_reference is stored
    expect(params[0]).toBe(basePurchase.reference); // internal reference unchanged
  });

  it("does not generate a short reference for PayFast purchases", async () => {
    queryMock.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const ref = await createPurchase({
      ...basePurchase,
      paymentMethod: "payfast",
      status: "pending",
    });

    expect(ref).toBeNull();
    const [, params] = queryMock.mock.calls[0];
    expect(params.at(-1)).toBeNull();
  });

  it("regenerates the reference and retries on a unique-constraint collision", async () => {
    queryMock
      .mockRejectedValueOnce(uniqueViolation())
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const ref = await createPurchase({
      ...basePurchase,
      paymentMethod: "eft",
      status: "awaiting_payment",
    });

    expect(ref).toMatch(/^WT-\d{6}$/);
    expect(queryMock).toHaveBeenCalledTimes(2);
    const firstAttemptRef = queryMock.mock.calls[0][1].at(-1);
    const secondAttemptRef = queryMock.mock.calls[1][1].at(-1);
    expect(secondAttemptRef).toBe(ref);
    expect(secondAttemptRef).not.toBe(firstAttemptRef);
  });

  it("gives up after repeated collisions instead of retrying forever", async () => {
    queryMock.mockRejectedValue(uniqueViolation());

    await expect(
      createPurchase({
        ...basePurchase,
        paymentMethod: "eft",
        status: "awaiting_payment",
      }),
    ).rejects.toThrow();

    expect(queryMock).toHaveBeenCalledTimes(5);
  });

  it("does not swallow unrelated database errors", async () => {
    queryMock.mockRejectedValueOnce(
      Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" }),
    );

    await expect(
      createPurchase({
        ...basePurchase,
        paymentMethod: "eft",
        status: "awaiting_payment",
      }),
    ).rejects.toThrow("connection refused");
    expect(queryMock).toHaveBeenCalledTimes(1);
  });
});
