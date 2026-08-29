import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();

vi.mock("pg", () => ({
  Pool: vi.fn().mockImplementation(function PoolMock() {
    return { query: queryMock };
  }),
}));

import { createPurchase, listEftPurchases, verifyEftPayment } from "./db";

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

describe("verifyEftPayment", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    queryMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("moves an awaiting EFT booking to paid and sets verified_at server-side in a single atomic update", async () => {
    const verifiedAt = "2026-08-29T10:00:00.000Z";
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [
        {
          reference: "WDLB-abc",
          eft_payment_reference: "WT-415033",
          status: "paid",
          payment_method: "eft",
          verified_at: verifiedAt,
        },
      ],
    });

    const result = await verifyEftPayment("WDLB-abc");

    expect(result.outcome).toBe("verified");
    expect(queryMock).toHaveBeenCalledTimes(1); // no fallback lookup needed
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("status='paid'");
    expect(sql).toContain("payment_method='eft'");
    expect(sql).toContain("status='awaiting_payment'");
    expect(params).toEqual(["WDLB-abc"]);
    if (result.outcome === "verified") {
      expect(result.purchase.verified_at).toBe(verifiedAt);
    }
  });

  it("is idempotent: verifying an already-paid booking again does not overwrite verified_at", async () => {
    const originalVerifiedAt = "2026-08-29T09:00:00.000Z";
    // the UPDATE's WHERE status='awaiting_payment' no longer matches, so it
    // affects zero rows - this is what makes the transition impossible to
    // repeat, even under a concurrent duplicate click.
    queryMock
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            reference: "WDLB-abc",
            eft_payment_reference: "WT-415033",
            status: "paid",
            payment_method: "eft",
            verified_at: originalVerifiedAt,
          },
        ],
      });

    const result = await verifyEftPayment("WDLB-abc");

    expect(result.outcome).toBe("already_verified");
    expect(queryMock).toHaveBeenCalledTimes(2);
    if (result.outcome === "already_verified") {
      expect(result.purchase.verified_at).toBe(originalVerifiedAt);
    }
  });

  it("refuses to verify a PayFast booking through the EFT admin action", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            reference: "WDLB-abc",
            payment_method: "payfast",
            status: "completed",
            verified_at: "2026-08-29T09:00:00.000Z",
          },
        ],
      });

    const result = await verifyEftPayment("WDLB-abc");

    expect(result.outcome).toBe("rejected");
  });

  it("refuses to verify a cancelled EFT booking", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            reference: "WDLB-abc",
            payment_method: "eft",
            status: "cancelled",
            verified_at: null,
          },
        ],
      });

    const result = await verifyEftPayment("WDLB-abc");

    expect(result.outcome).toBe("rejected");
  });

  it("reports not_found for an unknown reference", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const result = await verifyEftPayment("WDLB-does-not-exist");

    expect(result.outcome).toBe("not_found");
  });
});

describe("listEftPurchases", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    queryMock.mockReset();
    queryMock.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to EFT bookings awaiting payment only", async () => {
    await listEftPurchases();

    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("payment_method='eft'");
    expect(sql).toContain("status='awaiting_payment'");
    expect(params).toBeUndefined();
  });

  it("searches by eft reference, internal reference, email or name when a query is given", async () => {
    await listEftPurchases("WT-415033");

    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("payment_method='eft'");
    expect(sql).toContain("eft_payment_reference ilike $1");
    expect(sql).toContain("reference ilike $1");
    expect(sql).toContain("email ilike $1");
    expect(sql).toContain("customer_name ilike $1");
    expect(params).toEqual(["%WT-415033%"]);
  });

  it("only ever selects the lean admin column set (no guardian/marketing/free-text fields)", async () => {
    await listEftPurchases();

    const [sql] = queryMock.mock.calls[0];
    for (const sensitive of [
      "guardian_consent",
      "marketing_consent",
      "learning_goal",
      "preferred_times",
      "learner_first_name",
    ])
      expect(sql).not.toContain(sensitive);
  });
});
