import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetPurchase } = vi.hoisted(() => ({ mockGetPurchase: vi.fn() }));
vi.mock("@/lib/db", () => ({
  getPurchase: mockGetPurchase,
}));

import { GET } from "./route";

function makeRequest(reference: string) {
  return new Request(
    `http://localhost/api/festive-special/eft-instructions?reference=${encodeURIComponent(reference)}`,
  );
}

describe("GET /api/festive-special/eft-instructions", () => {
  beforeEach(() => {
    vi.stubEnv("WANOTUTS_BANK_NAME", "Test Bank");
    vi.stubEnv("WANOTUTS_BANK_ACCOUNT_HOLDER", "Kopanong Ya Kutlwano Enterprise");
    vi.stubEnv("WANOTUTS_BANK_ACCOUNT_NUMBER", "1234567890");
    mockGetPurchase.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exposes the short WT-XXXXXX reference for the customer to use as the payment reference", async () => {
    mockGetPurchase.mockResolvedValue({
      reference: "WDLB-6856b40a-2d18-4c8f-b2bd-11c26cb2888f",
      status: "awaiting_payment",
      payment_method: "eft",
      display_amount_minor: 45000,
      currency: "ZAR",
      eft_payment_reference: "WT-482731",
    });

    const response = await GET(
      makeRequest("WDLB-6856b40a-2d18-4c8f-b2bd-11c26cb2888f"),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.paymentReference).toBe("WT-482731");
    expect(json.paymentReference).toMatch(/^WT-\d{6}$/);
    // internal reference remains available for admin/support purposes
    expect(json.reference).toBe("WDLB-6856b40a-2d18-4c8f-b2bd-11c26cb2888f");
  });

  it("falls back to the internal reference for legacy rows with no short reference yet", async () => {
    mockGetPurchase.mockResolvedValue({
      reference: "WDLB-legacy-0000-0000-0000-000000000000",
      status: "awaiting_payment",
      payment_method: "eft",
      display_amount_minor: 45000,
      currency: "ZAR",
      eft_payment_reference: null,
    });

    const response = await GET(
      makeRequest("WDLB-legacy-0000-0000-0000-000000000000"),
    );
    const json = await response.json();

    expect(json.paymentReference).toBe("WDLB-legacy-0000-0000-0000-000000000000");
  });
});
