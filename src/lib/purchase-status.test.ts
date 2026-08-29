import { describe, expect, it } from "vitest";
import { unlocksCalendly } from "./purchase-status";

describe("unlocksCalendly", () => {
  it("does not unlock Calendly while an EFT booking awaits payment", () => {
    expect(unlocksCalendly("awaiting_payment")).toBe(false);
  });

  it("unlocks Calendly once an EFT booking is admin-verified as paid", () => {
    expect(unlocksCalendly("paid")).toBe(true);
  });

  it("still unlocks Calendly for a PayFast-completed booking (unchanged)", () => {
    expect(unlocksCalendly("completed")).toBe(true);
  });

  it("does not unlock Calendly for a still-pending PayFast booking", () => {
    expect(unlocksCalendly("pending")).toBe(false);
  });

  it("does not unlock Calendly for cancelled or failed bookings", () => {
    expect(unlocksCalendly("cancelled")).toBe(false);
    expect(unlocksCalendly("failed")).toBe(false);
  });
});
