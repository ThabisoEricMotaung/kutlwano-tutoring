-- Short, human-friendly customer-facing EFT payment reference (e.g. WT-482731),
-- separate from the internal booking reference (e.g. WDLB-<uuid>) used by the
-- application/database. Nullable: PayFast purchases and pre-existing EFT rows
-- never receive one.
alter table festive_purchases add column if not exists eft_payment_reference varchar(20);

create unique index if not exists festive_purchases_eft_payment_reference_idx
  on festive_purchases(eft_payment_reference)
  where eft_payment_reference is not null;
