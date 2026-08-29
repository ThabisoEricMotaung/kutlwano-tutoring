import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GUARDIAN_CONSENT_VERSION, TERMS_VERSION } from "@/lib/site-details";

vi.mock("@/lib/db", () => ({
  createPurchase: vi.fn().mockResolvedValue("WT-482731"),
}));

import { createPurchase } from "@/lib/db";
import { POST } from "./route";

const validEFTBody = {
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

function makeRequest(body: unknown) {
  // A real Request/undici body stream, matching production: it can only be
  // read once. If the handler calls request.json() twice, the second call
  // throws "Body is unusable: Body has already been read", reproducing the
  // production 500.
  return new Request("http://localhost/api/festive-special/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/festive-special/checkout (EFT)", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    vi.mocked(createPurchase).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the request body once and completes the EFT checkout without throwing", async () => {
    const request = makeRequest(validEFTBody);

    const response = await POST(request);
    const json = await response.json();

    expect(json.error).toBeUndefined();
    expect(json).not.toMatchObject({
      error: expect.stringContaining("could not be started"),
    });
    expect(response.status).toBe(200);
  });

  it("reaches purchase creation with awaiting_payment status for EFT, not paid", async () => {
    const request = makeRequest(validEFTBody);

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.method).toBe("eft");
    expect(typeof json.reference).toBe("string");

    expect(createPurchase).toHaveBeenCalledTimes(1);
    const call = vi.mocked(createPurchase).mock.calls[0][0];
    expect(call.paymentMethod).toBe("eft");
    expect(call.status).toBe("awaiting_payment");
    expect(call.status).not.toBe("paid");
    expect(call.status).not.toBe("completed");
  });

  it("exposes a short WT-XXXXXX payment reference alongside the unchanged internal reference", async () => {
    const request = makeRequest(validEFTBody);

    const response = await POST(request);
    const json = await response.json();

    expect(json.paymentReference).toBe("WT-482731");
    expect(json.paymentReference).toMatch(/^WT-\d{6}$/);

    // internal booking reference keeps its existing WDLB-<uuid> format
    expect(json.reference).toMatch(
      /^WDLB-[0-9a-f-]{36}$/,
    );
    expect(json.reference).not.toBe(json.paymentReference);
  });

  it("ignores a client-supplied payment reference and always uses the server-generated one", async () => {
    const request = makeRequest({
      ...validEFTBody,
      // an attacker/customer trying to force their own short reference
      paymentReference: "WT-000001",
      eftPaymentReference: "WT-000001",
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.paymentReference).toBe("WT-482731");
    expect(json.paymentReference).not.toBe("WT-000001");

    // the client-supplied fields never reach createPurchase either
    const call = vi.mocked(createPurchase).mock.calls[0][0];
    expect(call).not.toHaveProperty("paymentReference");
    expect(call).not.toHaveProperty("eftPaymentReference");
  });
});

describe("POST /api/festive-special/checkout (PayFast, unchanged)", () => {
  const validPayFastBody = {
    ...validEFTBody,
    paymentMethod: "payfast",
  };

  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    vi.stubEnv("PAYFAST_MERCHANT_ID", "10000100");
    vi.stubEnv("PAYFAST_MERCHANT_KEY", "46f0cd694581a");
    vi.stubEnv("PAYFAST_PASSPHRASE", "test-passphrase");
    vi.mocked(createPurchase).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("still returns signed PayFast form fields and does not generate a short EFT reference", async () => {
    const request = makeRequest(validPayFastBody);

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.method).toBe("payfast");
    expect(typeof json.action).toBe("string");
    expect(json.fields.merchant_id).toBe("10000100");
    expect(typeof json.fields.signature).toBe("string");
    expect(json.paymentReference).toBeUndefined();

    expect(createPurchase).toHaveBeenCalledTimes(1);
    const call = vi.mocked(createPurchase).mock.calls[0][0];
    expect(call.paymentMethod).toBe("payfast");
    expect(call.status).toBe("pending");
  });
});
