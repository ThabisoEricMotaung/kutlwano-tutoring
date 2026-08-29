alter table festive_purchases add column if not exists learner_type varchar(10) not null default 'adult';
alter table festive_purchases add column if not exists learner_first_name varchar(60) not null default '';
alter table festive_purchases add column if not exists guardian_consent_version varchar(80);
alter table festive_purchases add column if not exists guardian_consent_at timestamptz;
alter table festive_purchases add column if not exists terms_version varchar(80) not null default 'booking-terms-2026-08-25-v1';
alter table festive_purchases add column if not exists terms_accepted_at timestamptz not null default now();
alter table festive_purchases add column if not exists marketing_consent boolean not null default false;
alter table festive_purchases add column if not exists marketing_consent_at timestamptz;
