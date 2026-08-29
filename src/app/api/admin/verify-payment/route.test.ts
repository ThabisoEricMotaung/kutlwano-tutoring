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
  eft_received_amount_minor: 45000,
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
        body: JSON.stringify({ reference: "WDLB-abc", receivedAmount: "450.00" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockVerifyEftPayment).not.toHaveBeenCalled();
  });

  it("verifies an exact-match payment and returns the server-set verified_at and received amount", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "verified",
      purchase: paidPurchase,
    });

    const response = await POST(
      authenticatedRequest({ reference: "WDLB-abc", receivedAmount: "450.00" }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.alreadyVerified).toBe(false);
    expect(json.purchase.status).toBe("paid");
    expect(json.purchase.verified_at).toBe("2026-08-29T10:00:00.000Z");
    expect(json.purchase.eft_received_amount_minor).toBe(45000);
    // the string the admin typed is parsed into integer minor units server-side
    expect(mockVerifyEftPayment).toHaveBeenCalledWith("WDLB-abc", 45000);
  });

  it("R450 expected / R10 received: reports the mismatch and leaves the booking awaiting_payment", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "amount_mismatch",
      expectedMinor: 45000,
      receivedMinor: 1000,
      purchase: { reference: "WDLB-abc", status: "awaiting_payment" },
    });

    const response = await POST(
      authenticatedRequest({ reference: "WDLB-abc", receivedAmount: "10.00" }),
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.expectedMinor).toBe(45000);
    expect(json.receivedMinor).toBe(1000);
    expect(json.outstandingMinor).toBe(44000);
    expect(json.overpaymentMinor).toBe(0);
  });

  it("overpayment: reports the mismatch as an overpayment, does not auto-verify", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "amount_mismatch",
      expectedMinor: 45000,
      receivedMinor: 50000,
      purchase: { reference: "WDLB-abc", status: "awaiting_payment" },
    });

    const response = await POST(
      authenticatedRequest({ reference: "WDLB-abc", receivedAmount: "500.00" }),
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.outstandingMinor).toBe(0);
    expect(json.overpaymentMinor).toBe(5000);
  });

  it("ignores a client-supplied status, verified_at and charged amount - only reference and the parsed received amount are ever passed on", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "verified",
      purchase: paidPurchase,
    });

    await POST(
      authenticatedRequest({
        reference: "WDLB-abc",
        receivedAmount: "450.00",
        status: "paid",
        verified_at: "2000-01-01T00:00:00.000Z",
        charged_zar_minor: 1,
        chargedAmount: 1,
        currency: "USD",
      }),
    );

    expect(mockVerifyEftPayment).toHaveBeenCalledWith("WDLB-abc", 45000);
    expect(mockVerifyEftPayment).toHaveBeenCalledTimes(1);
    expect(mockVerifyEftPayment.mock.calls[0]).toHaveLength(2);
  });

  it("rejects an unparsable received amount before ever calling the database", async () => {
    const response = await POST(
      authenticatedRequest({ reference: "WDLB-abc", receivedAmount: "not-a-number" }),
    );

    expect(response.status).toBe(400);
    expect(mockVerifyEftPayment).not.toHaveBeenCalled();
  });

  it("does not verify a PayFast booking through this EFT-only endpoint", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "rejected",
      purchase: { reference: "WDLB-abc", payment_method: "payfast", status: "completed" },
    });

    const response = await POST(
      authenticatedRequest({ reference: "WDLB-abc", receivedAmount: "450.00" }),
    );

    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toMatch(/not an EFT booking/i);
  });

  it("does not verify a cancelled booking", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "rejected",
      purchase: { reference: "WDLB-abc", payment_method: "eft", status: "cancelled" },
    });

    const response = await POST(
      authenticatedRequest({ reference: "WDLB-abc", receivedAmount: "450.00" }),
    );
    expect(response.status).toBe(409);
  });

  it("is idempotent: verifying twice reports already_verified without an error and without changing verified_at or the received amount", async () => {
    mockVerifyEftPayment.mockResolvedValue({
      outcome: "already_verified",
      purchase: paidPurchase,
    });

    const response = await POST(
      authenticatedRequest({ reference: "WDLB-abc", receivedAmount: "1.00" }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.alreadyVerified).toBe(true);
    expect(json.purchase.verified_at).toBe("2026-08-29T10:00:00.000Z");
    expect(json.purchase.eft_received_amount_minor).toBe(45000);
  });

  it("returns 404 for an unknown reference", async () => {
    mockVerifyEftPayment.mockResolvedValue({ outcome: "not_found" });

    const response = await POST(
      authenticatedRequest({ reference: "WDLB-nope", receivedAmount: "450.00" }),
    );
    expect(response.status).toBe(404);
  });

  it("rejects a request with no reference or no received amount", async () => {
    const noReference = await POST(
      authenticatedRequest({ receivedAmount: "450.00" }),
    );
    expect(noReference.status).toBe(400);

    const noAmount = await POST(authenticatedRequest({ reference: "WDLB-abc" }));
    expect(noAmount.status).toBe(400);

    expect(mockVerifyEftPayment).not.toHaveBeenCalled();
  });
});
