// A booking unlocks Calendly once PayFast marks it "completed" (automatic
// ITN verification) or WanoTuts admin marks an EFT booking "paid" (manual
// verification). No other status - awaiting_payment, pending, cancelled,
// failed - unlocks it.
export function unlocksCalendly(status: string) {
  return status === "completed" || status === "paid";
}

// PayFast's amountMinor is always the verified charge (the ITN handler
// rejects any amount mismatch before marking a booking "completed"), so it's
// safe to keep using it unchanged. EFT has no such automatic guarantee - only
// the admin-recorded eft_received_amount_minor is ever displayed as "paid",
// and a legacy paid EFT row with none on file returns null rather than
// silently reusing the amount due (which may not be what was received).
export function resolveDisplayedAmountPaidMinor(purchase: {
  paymentMethod: string;
  amountMinor: number;
  eftReceivedAmountMinor: number | null;
}): number | null {
  if (purchase.paymentMethod !== "eft") return purchase.amountMinor;
  return purchase.eftReceivedAmountMinor;
}
