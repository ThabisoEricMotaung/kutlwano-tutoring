-- Add payment method to support both PayFast and EFT payment methods
alter table festive_purchases add column if not exists payment_method varchar(20) not null default 'payfast';

-- Note on status values:
-- PayFast: 'pending' -> 'completed' or 'failed'
-- EFT: 'awaiting_payment' -> 'paid' or 'cancelled'
-- The status column remains flexible and is not restricted to an enum,
-- allowing manual verification of EFT payments and future payment method support
