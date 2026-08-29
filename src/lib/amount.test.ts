import { describe, expect, it } from "vitest";
import { parseZarAmountToMinor } from "./amount";

describe("parseZarAmountToMinor", () => {
  it("parses whole-rand amounts", () => {
    expect(parseZarAmountToMinor("450")).toBe(45000);
    expect(parseZarAmountToMinor("10")).toBe(1000);
  });

  it("parses amounts with cents without floating-point drift", () => {
    expect(parseZarAmountToMinor("450.00")).toBe(45000);
    expect(parseZarAmountToMinor("10.50")).toBe(1050);
    expect(parseZarAmountToMinor("0.01")).toBe(1);
    // a classic float trap: 0.1 + 0.2 !== 0.3 in IEEE-754 - this must not
    // leak into the parsed result
    expect(parseZarAmountToMinor("19.99")).toBe(1999);
  });

  it("pads a single decimal digit", () => {
    expect(parseZarAmountToMinor("10.5")).toBe(1050);
  });

  it("trims surrounding whitespace", () => {
    expect(parseZarAmountToMinor("  450.00  ")).toBe(45000);
  });

  it("rejects more than two decimal places", () => {
    expect(parseZarAmountToMinor("10.999")).toBeNull();
  });

  it("rejects negative amounts", () => {
    expect(parseZarAmountToMinor("-10")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(parseZarAmountToMinor("abc")).toBeNull();
    expect(parseZarAmountToMinor("")).toBeNull();
    expect(parseZarAmountToMinor("R450")).toBeNull();
  });

  it("rejects thousands separators and other formatting", () => {
    expect(parseZarAmountToMinor("1,000.00")).toBeNull();
  });
});
