import { describe, expect, it } from "vitest";
import {
  resolveDisplayedAmountPaidMinor,
  unlocksCalendly,
} from "./purchase-status";

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

describe("resolveDisplayedAmountPaidMinor", () => {
  it("shows the admin-verified received amount for a paid EFT booking (R450 example)", () => {
    expect(
      resolveDisplayedAmountPaidMinor({
        paymentMethod: "eft",
        amountMinor: 45000,
        eftReceivedAmountMinor: 45000,
      }),
    ).toBe(45000);
  });

  it("never displays the amount due as the amount paid for EFT when only a partial payment was recorded", () => {
    // this is exactly the WT-415033 bug: R450 due, R10 actually received -
    // the confirmation page must never show R450 as "paid".
    expect(
      resolveDisplayedAmountPaidMinor({
        paymentMethod: "eft",
        amountMinor: 45000,
        eftReceivedAmountMinor: 1000,
      }),
    ).toBe(1000);
  });

  it("keeps using amountMinor for PayFast (unchanged)", () => {
    expect(
      resolveDisplayedAmountPaidMinor({
        paymentMethod: "payfast",
        amountMinor: 45000,
        eftReceivedAmountMinor: null,
      }),
    ).toBe(45000);
  });

  it("returns null (never fabricates a figure) for a legacy paid EFT row with no recorded amount", () => {
    expect(
      resolveDisplayedAmountPaidMinor({
        paymentMethod: "eft",
        amountMinor: 45000,
        eftReceivedAmountMinor: null,
      }),
    ).toBeNull();
  });
});
