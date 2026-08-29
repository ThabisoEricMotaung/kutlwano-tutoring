import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetPurchase } = vi.hoisted(() => ({ mockGetPurchase: vi.fn() }));
vi.mock("@/lib/db", () => ({ getPurchase: mockGetPurchase }));

import { GET } from "./route";

function makeRequest(reference: string) {
  return new Request(
    `http://localhost/api/festive-special/status?reference=${encodeURIComponent(reference)}`,
  );
}

describe("GET /api/festive-special/status", () => {
  beforeEach(() => {
    mockGetPurchase.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exposes eftReceivedAmountMinor for a verified EFT booking so the confirmation page can show the real amount paid", async () => {
    mockGetPurchase.mockResolvedValue({
      reference: "WDLB-abc",
      status: "paid",
      payment_method: "eft",
      package_id: "south_africa",
      subject: "Mathematics",
      currency: "ZAR",
      display_amount_minor: 45000,
      eft_received_amount_minor: 45000,
    });

    const response = await GET(makeRequest("WDLB-abc"));
    const json = await response.json();

    expect(json.status).toBe("paid");
    expect(json.eftReceivedAmountMinor).toBe(45000);
  });

  it("returns null (not undefined/crash) when eft_received_amount_minor is not yet set", async () => {
    mockGetPurchase.mockResolvedValue({
      reference: "WDLB-abc",
      status: "awaiting_payment",
      payment_method: "eft",
      package_id: "south_africa",
      subject: "Mathematics",
      currency: "ZAR",
      display_amount_minor: 45000,
      eft_received_amount_minor: null,
    });

    const response = await GET(makeRequest("WDLB-abc"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe("awaiting_payment");
    expect(json.eftReceivedAmountMinor).toBeNull();
  });

  it("PayFast bookings are unaffected: status/amountMinor behave as before", async () => {
    mockGetPurchase.mockResolvedValue({
      reference: "WDLB-abc",
      status: "completed",
      payment_method: "payfast",
      package_id: "south_africa",
      subject: "Mathematics",
      currency: "ZAR",
      display_amount_minor: 45000,
      eft_received_amount_minor: null,
    });

    const response = await GET(makeRequest("WDLB-abc"));
    const json = await response.json();

    expect(json.status).toBe("completed");
    expect(json.paymentMethod).toBe("payfast");
    expect(json.amountMinor).toBe(45000);
  });
});
