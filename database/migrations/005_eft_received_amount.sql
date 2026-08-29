-- Canonical, server-recorded amount actually confirmed as received for an EFT
-- payment (minor ZAR units, e.g. R10.00 = 1000). Nullable: unset until an
-- admin verifies the payment, and never used for PayFast bookings.
alter table festive_purchases add column if not exists eft_received_amount_minor integer;
