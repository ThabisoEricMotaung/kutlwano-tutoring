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

const awaitingRow = {
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
  eft_received_amount_minor: null,
  status: "awaiting_payment",
  payment_method: "eft",
  created_at: "2026-08-29T09:00:00.000Z",
  verified_at: null,
};

const verifiedRow = {
  ...awaitingRow,
  status: "paid",
  eft_received_amount_minor: 45000,
  verified_at: "2026-08-29T10:00:00.000Z",
};

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

  it("defaults to the awaiting view", async () => {
    mockListEftPurchases.mockResolvedValue([awaitingRow]);

    const response = await GET(authenticatedRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.purchases).toEqual([awaitingRow]);
    expect(mockListEftPurchases).toHaveBeenCalledWith({
      search: undefined,
      view: "awaiting",
    });
  });

  it("the verified view returns paid EFT bookings including the amount received", async () => {
    mockListEftPurchases.mockResolvedValue([verifiedRow]);

    const response = await GET(authenticatedRequest("?view=verified"));
    const json = await response.json();

    expect(mockListEftPurchases).toHaveBeenCalledWith({
      search: undefined,
      view: "verified",
    });
    expect(json.purchases[0].eft_received_amount_minor).toBe(45000);
    expect(json.purchases[0].verified_at).toBe("2026-08-29T10:00:00.000Z");
  });

  it("the all view is requested as-is", async () => {
    mockListEftPurchases.mockResolvedValue([awaitingRow, verifiedRow]);

    await GET(authenticatedRequest("?view=all"));

    expect(mockListEftPurchases).toHaveBeenCalledWith({
      search: undefined,
      view: "all",
    });
  });

  it("falls back to the awaiting view for an unrecognised view value", async () => {
    mockListEftPurchases.mockResolvedValue([]);

    await GET(authenticatedRequest("?view=bogus"));

    expect(mockListEftPurchases).toHaveBeenCalledWith({
      search: undefined,
      view: "awaiting",
    });
  });

  it("passes the search query through alongside the selected view", async () => {
    mockListEftPurchases.mockResolvedValue([]);

    await GET(authenticatedRequest("?q=WT-415033&view=all"));

    expect(mockListEftPurchases).toHaveBeenCalledWith({
      search: "WT-415033",
      view: "all",
    });
  });

  it("does not expose sensitive guardian/marketing/learning-goal fields", async () => {
    mockListEftPurchases.mockResolvedValue([awaitingRow]);

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
