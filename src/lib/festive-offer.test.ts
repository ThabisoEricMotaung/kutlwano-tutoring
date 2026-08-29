import { describe, expect, it } from "vitest";
import {
  dateInCampaignTimezone,
  isCampaignPublished,
  isOfferPurchasable,
} from "./festive-offer";
describe("Festive campaign dates", () => {
  it("uses the South African calendar date", () =>
    expect(dateInCampaignTimezone(new Date("2026-12-31T22:30:00Z"))).toBe(
      "2027-01-01",
    ));
  it("publishes through the end of 31 December in South Africa", () =>
    expect(isCampaignPublished(new Date("2026-12-31T20:00:00Z"))).toBe(true));
  it("hides navigation and closes purchases after local expiry", () => {
    const after = new Date("2026-12-31T22:30:00Z");
    expect(isCampaignPublished(after)).toBe(false);
    expect(isOfferPurchasable(after)).toBe(false);
  });
});
