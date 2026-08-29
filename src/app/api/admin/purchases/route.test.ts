import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin-auth";

const { mockListEftPurchases } = vi.hoisted(() => ({
  mockListEftPurchases: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ listEftPurchases: mockListEftPurchases }));

import { GET } from "./route";

function authenticatedRequest(query = "") {
  const token = createAdminSessionToken();
  return new Request(`http://localhost/api/admin/purchases${query}`, {
    headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
  });
}

describe("GET /api/admin/purchases", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
    mockListEftPurchases.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a request with no admin session", async () => {
    const response = await GET(new Request("http://localhost/api/admin/purchases"));
    expect(response.status).toBe(401);
    expect(mockListEftPurchases).not.toHaveBeenCalled();
  });

  it("rejects a request with an invalid/tampered session cookie", async () => {
    const response = await GET(
      new Request("http://localhost/api/admin/purchases", {
        headers: { cookie: `${ADMIN_SESSION_COOKIE}=garbage` },
      }),
    );
    expect(response.status).toBe(401);
    expect(mockListEftPurchases).not.toHaveBeenCalled();
  });

  it("returns EFT bookings awaiting payment for an authenticated request", async () => {
    const row = {
      reference: "WDLB-abc",
      eft_payment_reference: "WT-415033",
      customer_name: "Test Customer",
      email: "customer@example.com",
      telephone: "0712345678",
      package_id: "south_africa",
      subject: "Mathematics",
      currency: "ZAR",
      display_amount_minor: 45000,
      charged_zar_minor: 45000,
      status: "awaiting_payment",
      payment_method: "eft",
      created_at: "2026-08-29T09:00:00.000Z",
      verified_at: null,
    };
    mockListEftPurchases.mockResolvedValue([row]);

    const response = await GET(authenticatedRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.purchases).toEqual([row]);
    expect(mockListEftPurchases).toHaveBeenCalledWith(undefined);
  });

  it("passes the search query through to the search filter", async () => {
    mockListEftPurchases.mockResolvedValue([]);

    await GET(authenticatedRequest("?q=WT-415033"));

    expect(mockListEftPurchases).toHaveBeenCalledWith("WT-415033");
  });

  it("does not expose sensitive guardian/marketing/learning-goal fields", async () => {
    mockListEftPurchases.mockResolvedValue([
      {
        reference: "WDLB-abc",
        eft_payment_reference: "WT-415033",
        customer_name: "Test Customer",
        email: "customer@example.com",
        telephone: "0712345678",
        package_id: "south_africa",
        subject: "Mathematics",
        currency: "ZAR",
        display_amount_minor: 45000,
        charged_zar_minor: 45000,
        status: "awaiting_payment",
        payment_method: "eft",
        created_at: "2026-08-29T09:00:00.000Z",
        verified_at: null,
      },
    ]);

    const response = await GET(authenticatedRequest());
    const json = await response.json();

    const keys = Object.keys(json.purchases[0]);
    for (const sensitive of [
      "guardian_consent_version",
      "guardian_consent_at",
      "marketing_consent",
      "marketing_consent_at",
      "learning_goal",
      "preferred_times",
      "learner_first_name",
    ])
      expect(keys).not.toContain(sensitive);
  });
});
