import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GUARDIAN_CONSENT_VERSION, TERMS_VERSION } from "@/lib/site-details";

vi.mock("@/lib/db", () => ({
  createPurchase: vi.fn().mockResolvedValue(undefined),
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
});
