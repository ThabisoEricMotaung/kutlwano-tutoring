export const FESTIVE_OFFER = {
  slug: "december-learning-boost",
  name: "December Learning Boost",
  publicLabel: "Festive Special",
  lessonCount: 4,
  lessonMinutes: 60,
  startsOn: "2026-12-01",
  endsOn: "2026-12-31",
  campaign: {
    enabled: true,
    label: "Festive Special",
    url: "/festive-special",
    publicationStartsOn: "2026-08-25",
    publicationEndsOn: "2026-12-31",
    timezone: "Africa/Johannesburg",
  },
  delivery: "Live online through Microsoft Teams",
  contents: [
    "Four live one-on-one lessons",
    "60 minutes per lesson",
    "Personal learning plan",
    "Short progress summary after the final lesson",
  ],
  subjects: [
    "English",
    "Afrikaans",
    "Mathematics",
    "Technical Mathematics",
    "Technical Science",
    "Natural Science",
    "Physical Sciences",
  ],
  packages: {
    international: {
      id: "international",
      label: "International learner",
      currency: "USD",
      regularMinor: 10000,
      specialMinor: 9000,
      comparisonSupported: true,
    },
    south_africa: {
      id: "south_africa",
      label: "South African learner",
      currency: "ZAR",
      regularMinor: 50000,
      specialMinor: 45000,
      comparisonSupported: false,
    },
  },
  terms: [
    "No automatic renewal.",
    "Limited availability and subject to the tutor’s available booking times.",
    "Lessons must be used between 1 and 31 December 2026.",
    "Unused lessons expire after 31 December 2026 unless the tutor cancels a lesson.",
    "Rescheduling is subject to the tutor’s availability.",
  ],
} as const;
export type PackageId = keyof typeof FESTIVE_OFFER.packages;
export function dateInCampaignTimezone(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FESTIVE_OFFER.campaign.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function isCampaignPublished(now = new Date()) {
  const today = dateInCampaignTimezone(now),
    campaign = FESTIVE_OFFER.campaign;
  return (
    campaign.enabled &&
    today >= campaign.publicationStartsOn &&
    today <= campaign.publicationEndsOn
  );
}
export function isOfferPurchasable(now = new Date()) {
  return (
    FESTIVE_OFFER.campaign.enabled &&
    dateInCampaignTimezone(now) <= FESTIVE_OFFER.endsOn
  );
}
export function money(minor: number, currency: string) {
  return new Intl.NumberFormat(currency === "ZAR" ? "en-ZA" : "en-US", {
    style: "currency",
    currency,
  }).format(minor / 100);
}
