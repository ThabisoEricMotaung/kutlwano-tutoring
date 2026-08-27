export type SpecialStatus = "active" | "upcoming" | "expired";

export type Special = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  subjects: readonly string[];
  price: string;
  priceDescription: string;
  formats: readonly string[];
  location: readonly string[];
  startDate: string | null;
  endDate: string | null;
  ctaLabel: string;
  ctaDestination: string;
  status: SpecialStatus;
  featured: boolean;
};

export const SPECIALS: readonly Special[] = [
  {
    id: "september-school-holiday-classes",
    slug: "september-school-holiday-classes",
    title: "September School Holiday Classes",
    shortTitle: "September School Holiday Classes",
    eyebrow: "Current Special",
    description:
      "Focused holiday lessons for learners who want to catch up, strengthen difficult areas or get ahead before returning to school.",
    subjects: [
      "English",
      "Afrikaans",
      "Mathematics",
      "Physical Sciences",
      "Technical Sciences",
    ],
    price: "R500",
    priceDescription: "for the duration of the September school holidays",
    formats: ["Face-to-face", "Online"],
    location: [
      "Unit 114",
      "568 Fred Messenger Avenue",
      "Country View Estate",
      "Andeon",
    ],
    // Exact programme dates have not been published yet.
    startDate: null,
    endDate: null,
    ctaLabel: "Book Holiday Classes",
    ctaDestination: "/contact",
    status: "active",
    featured: true,
  },
];

export const ACTIVE_SPECIALS = SPECIALS.filter(
  (special) => special.status === "active",
);

export const FEATURED_SPECIAL =
  ACTIVE_SPECIALS.find((special) => special.featured) ?? ACTIVE_SPECIALS[0];
