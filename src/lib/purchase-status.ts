// A booking unlocks Calendly once PayFast marks it "completed" (automatic
// ITN verification) or WanoTuts admin marks an EFT booking "paid" (manual
// verification). No other status - awaiting_payment, pending, cancelled,
// failed - unlocks it.
export function unlocksCalendly(status: string) {
  return status === "completed" || status === "paid";
}
