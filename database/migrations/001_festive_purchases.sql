create table if not exists festive_purchases (
  id bigserial primary key, reference varchar(100) unique not null, package_id varchar(30) not null,
  subject varchar(80) not null, grade varchar(30) not null default '', customer_name varchar(100) not null,
  email varchar(100) not null, telephone varchar(30) not null, country varchar(80) not null, timezone varchar(80) not null,
  learning_goal text not null, preferred_times text not null, currency char(3) not null,
  display_amount_minor integer not null, charged_zar_minor integer not null, status varchar(20) not null,
  pf_payment_id varchar(100) unique, verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists festive_purchases_status_idx on festive_purchases(status);
