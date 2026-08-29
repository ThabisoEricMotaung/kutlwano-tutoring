import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "wanotuts_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function constantTimeEqual(a: string, b: string) {
  const bufA = Buffer.from(a),
    bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Fixed-length digest comparison so the check takes the same time regardless of input length. */
function constantTimeEqualAnyLength(a: string, b: string) {
  const digest = (v: string) =>
    createHmac("sha256", "wanotuts-admin-password-compare").update(v).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function createAdminSessionToken() {
  const expiresAt = String(Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expiresAtRaw = token.slice(0, dot),
    signature = token.slice(dot + 1);
  if (!constantTimeEqual(signature, sign(expiresAtRaw))) return false;
  const expiresAt = Number(expiresAtRaw);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function verifyAdminPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return constantTimeEqualAnyLength(candidate, expected);
}

/** Reads the admin session cookie straight off the Request's Cookie header. */
export function readAdminSessionCookie(request: Request) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === ADMIN_SESSION_COOKIE)
      return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

export function isAdminRequest(request: Request) {
  return isValidAdminSessionToken(readAdminSessionCookie(request));
}
