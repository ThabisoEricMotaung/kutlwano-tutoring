import { createHash, timingSafeEqual } from "node:crypto";
export function encode(v: string) {
  return encodeURIComponent(v.trim())
    .replace(/%20/g, "+")
    .replace(/%[0-9a-f]{2}/gi, (m) => m.toUpperCase());
}
export function signature(data: Record<string, string>, passphrase: string) {
  const body =
    Object.entries(data)
      .filter(([k, v]) => k !== "signature" && v !== "")
      .map(([k, v]) => `${k}=${encode(v)}`)
      .join("&") + `&passphrase=${encode(passphrase)}`;
  return createHash("md5").update(body).digest("hex");
}
export function validSignature(
  data: Record<string, string>,
  passphrase: string,
) {
  const supplied = data.signature || "";
  const expected = signature(data, passphrase);
  return (
    supplied.length === expected.length &&
    timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  );
}
export const payfastHost = () =>
  process.env.PAYFAST_MODE === "live"
    ? "https://www.payfast.co.za"
    : "https://sandbox.payfast.co.za";
