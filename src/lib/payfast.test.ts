import { describe, expect, it } from "vitest";
import { signature, validSignature } from "./payfast";
describe("PayFast signatures", () => {
  it("creates deterministic MD5 signatures without trusting a submitted signature", () => {
    const data = {
      merchant_id: "10000100",
      amount: "450.00",
      item_name: "December Learning Boost",
    };
    expect(signature(data, "secret")).toMatch(/^[a-f0-9]{32}$/);
    expect(signature(data, "secret")).toBe(signature(data, "secret"));
  });
  it("rejects tampering", () => {
    const base = { merchant_id: "10000100", amount: "450.00" };
    const signed = { ...base, signature: signature(base, "secret") };
    expect(validSignature(signed, "secret")).toBe(true);
    expect(validSignature({ ...signed, amount: "1.00" }, "secret")).toBe(false);
  });
});
