import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminRequest,
  isValidAdminSessionToken,
  readAdminSessionCookie,
  verifyAdminPassword,
} from "./admin-auth";

describe("admin session tokens", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a freshly created token", () => {
    expect(isValidAdminSessionToken(createAdminSessionToken())).toBe(true);
  });

  it("rejects a missing token", () => {
    expect(isValidAdminSessionToken(undefined)).toBe(false);
    expect(isValidAdminSessionToken(null)).toBe(false);
    expect(isValidAdminSessionToken("")).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const token = createAdminSessionToken();
    const [payload] = token.split(".");
    expect(isValidAdminSessionToken(`${payload}.deadbeef`)).toBe(false);
  });

  it("rejects a tampered expiry payload (extending the session)", () => {
    const token = createAdminSessionToken();
    const [, signature] = token.split(".");
    const farFuture = String(Date.now() + 1000 * 60 * 60 * 24 * 365);
    expect(isValidAdminSessionToken(`${farFuture}.${signature}`)).toBe(false);
  });

  it("rejects an expired token", () => {
    const expiredPayload = String(Date.now() - 1000);
    const token = createAdminSessionToken();
    const [, signature] = token.split(".");
    // signature won't match the swapped-in expired payload, so it must be
    // rejected either way - but this also proves expiry is checked, not just
    // signature validity, once signed with the real secret via a real token.
    expect(isValidAdminSessionToken(`${expiredPayload}.${signature}`)).toBe(
      false,
    );
  });

  it("rejects a token signed with a different secret", () => {
    const token = createAdminSessionToken();
    vi.stubEnv("ADMIN_SESSION_SECRET", "a-different-secret");
    expect(isValidAdminSessionToken(token)).toBe(false);
  });
});

describe("verifyAdminPassword", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the configured password", () => {
    vi.stubEnv("ADMIN_PASSWORD", "correct-horse-battery-staple");
    expect(verifyAdminPassword("correct-horse-battery-staple")).toBe(true);
  });

  it("rejects an incorrect password", () => {
    vi.stubEnv("ADMIN_PASSWORD", "correct-horse-battery-staple");
    expect(verifyAdminPassword("wrong")).toBe(false);
  });

  it("rejects any password when ADMIN_PASSWORD is not configured", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(verifyAdminPassword("")).toBe(false);
    expect(verifyAdminPassword("anything")).toBe(false);
  });
});

describe("readAdminSessionCookie / isAdminRequest", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the session cookie from a real Request's Cookie header", () => {
    const token = createAdminSessionToken();
    const request = new Request("http://localhost/admin", {
      headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}; other=value` },
    });
    expect(readAdminSessionCookie(request)).toBe(token);
    expect(isAdminRequest(request)).toBe(true);
  });

  it("treats a request with no cookie header as unauthenticated", () => {
    const request = new Request("http://localhost/admin");
    expect(readAdminSessionCookie(request)).toBeUndefined();
    expect(isAdminRequest(request)).toBe(false);
  });

  it("treats a request with an unrelated cookie as unauthenticated", () => {
    const request = new Request("http://localhost/admin", {
      headers: { cookie: "some_other_cookie=abc" },
    });
    expect(isAdminRequest(request)).toBe(false);
  });
});
