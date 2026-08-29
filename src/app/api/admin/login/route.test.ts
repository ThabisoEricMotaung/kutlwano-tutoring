import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { POST } from "./route";

function loginRequest(password: string) {
  const form = new URLSearchParams({ password });
  return new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
}

function readSetCookie(response: Response) {
  const raw = response.headers.get("set-cookie") || "";
  const match = raw.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]*)`));
  return match?.[1];
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "correct-horse-battery-staple");
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets a valid, httpOnly session cookie and redirects to /admin on correct password", async () => {
    const response = await POST(loginRequest("correct-horse-battery-staple"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/admin");
    const cookieValue = readSetCookie(response);
    expect(cookieValue).toBeTruthy();
    expect(isValidAdminSessionToken(cookieValue)).toBe(true);
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);
  });

  it("rejects an incorrect password without setting a session cookie", async () => {
    const response = await POST(loginRequest("wrong-password"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("error=1");
    expect(readSetCookie(response)).toBeFalsy();
  });

  it("refuses to log in when ADMIN_PASSWORD is not configured, even with an empty password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    const response = await POST(loginRequest(""));

    expect(response.headers.get("location")).toContain("error=1");
    expect(readSetCookie(response)).toBeFalsy();
  });
});
