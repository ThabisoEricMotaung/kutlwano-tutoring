// Accepts plain decimal Rand amounts only: optional cents, no sign, no
// thousands separators, no scientific notation - e.g. "450", "450.00", "10.5".
const ZAR_AMOUNT_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

/**
 * Parses an admin-entered ZAR amount string into integer minor units
 * (cents) without floating-point multiplication, e.g. "10.00" -> 1000.
 * Returns null for anything that isn't a plain non-negative decimal amount.
 */
export function parseZarAmountToMinor(input: string): number | null {
  const trimmed = input.trim();
  if (!ZAR_AMOUNT_PATTERN.test(trimmed)) return null;
  const [wholePart, fractionPart = ""] = trimmed.split(".");
  const cents = (fractionPart + "00").slice(0, 2);
  const minor = Number(wholePart) * 100 + Number(cents);
  return Number.isSafeInteger(minor) ? minor : null;
}
