import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin-auth";

const { mockVerifyEftPayment } = vi.hoisted(() => ({
  mockVerifyEftPayment: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ verifyEftPayment: mockVerifyEftPayment }));

import { POST } from "./route";

function authenticatedRequest(body: unknown) {
  const token = createAdminSessionToken();
  return new Request("http://localhost/api/admin/verify-payment", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `${ADMIN_SESSION_COOKIE}=${token}`,
    },
    body: JSON.stringify(body),
  });
}

const paidPurchase = {
  reference: "WDLB-abc",
  eft_payment_reference: "WT-415033",
  status: "paid",
  payment_method: "eft",
  charged_zar_minor: 45000,
  verified_at: "2026-08-29T10:00:00.000Z",
};

describe("POST /api/admin/verify-payment", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
    mockVerifyEftPayment.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects an unauthenticated request and never touches the database", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/verify-payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference: "WDLB-abc" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockVerifyEftPayment).not.toHaveBeenCalled();
  });

  it("transitions an awaiting EFT booking to paid and returns the server-set verified_at", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "verified",
      purchase: paidPurchase,
    });

    const response = await POST(authenticatedRequest({ reference: "WDLB-abc" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.alreadyVerified).toBe(false);
    expect(json.purchase.status).toBe("paid");
    expect(json.purchase.verified_at).toBe("2026-08-29T10:00:00.000Z");
    expect(mockVerifyEftPayment).toHaveBeenCalledWith("WDLB-abc");
  });

  it("ignores a client-supplied status, verified_at and amount - only reference is ever read", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "verified",
      purchase: paidPurchase,
    });

    await POST(
      authenticatedRequest({
        reference: "WDLB-abc",
        status: "paid",
        verified_at: "2000-01-01T00:00:00.000Z",
        charged_zar_minor: 1,
        charged_amount: 1,
      }),
    );

    // the db layer only ever receives the reference string - nothing else
    // the client sent can reach the update
    expect(mockVerifyEftPayment).toHaveBeenCalledWith("WDLB-abc");
    expect(mockVerifyEftPayment).toHaveBeenCalledTimes(1);
    expect(mockVerifyEftPayment.mock.calls[0]).toHaveLength(1);
  });

  it("does not verify a PayFast booking through this EFT-only endpoint", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "rejected",
      purchase: { reference: "WDLB-abc", payment_method: "payfast", status: "completed" },
    });

    const response = await POST(authenticatedRequest({ reference: "WDLB-abc" }));

    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toMatch(/not an EFT booking/i);
  });

  it("does not verify a cancelled EFT booking", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "rejected",
      purchase: { reference: "WDLB-abc", payment_method: "eft", status: "cancelled" },
    });

    const response = await POST(authenticatedRequest({ reference: "WDLB-abc" }));
    expect(response.status).toBe(409);
  });

  it("is idempotent: verifying twice reports already_verified without an error and without changing verified_at", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "already_verified",
      purchase: paidPurchase,
    });

    const response = await POST(authenticatedRequest({ reference: "WDLB-abc" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.alreadyVerified).toBe(true);
    expect(json.purchase.verified_at).toBe("2026-08-29T10:00:00.000Z");
  });

  it("returns 404 for an unknown reference", async () => {
    mockVerifyEftPayment.mockResolvedValue({ outcome: "not_found" });

    const response = await POST(authenticatedRequest({ reference: "WDLB-nope" }));
    expect(response.status).toBe(404);
  });

  it("rejects a request with no reference", async () => {
    const response = await POST(authenticatedRequest({}));
    expect(response.status).toBe(400);
    expect(mockVerifyEftPayment).not.toHaveBeenCalled();
  });
});
