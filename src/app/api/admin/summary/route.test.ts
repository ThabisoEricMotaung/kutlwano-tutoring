import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin-auth";

const { mockGetEftAdminSummary } = vi.hoisted(() => ({
  mockGetEftAdminSummary: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ getEftAdminSummary: mockGetEftAdminSummary }));

import { GET } from "./route";

describe("GET /api/admin/summary", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
    mockGetEftAdminSummary.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await GET(new Request("http://localhost/api/admin/summary"));
    expect(response.status).toBe(401);
    expect(mockGetEftAdminSummary).not.toHaveBeenCalled();
  });

  it("returns the summary for an authenticated request", async () => {
    mockGetEftAdminSummary.mockResolvedValue({
      awaitingCount: 2,
      awaitingTotalMinor: 90000,
      verifiedThisMonthCount: 1,
      verifiedThisMonthTotalMinor: 45000,
    });
    const token = createAdminSessionToken();

    const response = await GET(
      new Request("http://localhost/api/admin/summary", {
        headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.awaitingCount).toBe(2);
    expect(json.verifiedThisMonthTotalMinor).toBe(45000);
  });
});
