create table cdc_dividends (
  id            uuid        primary key default gen_random_uuid(),
  portfolio_id  uuid        not null references portfolios(id) on delete cascade,
  symbol        text        not null,
  company_name  text        not null,
  warrant_no    text,
  issue_date    date,
  payment_date  date        not null,
  financial_year text,
  rate_per_security numeric not null default 0,
  no_of_securities  integer not null default 0,
  gross_amount      numeric not null default 0,
  zakat_deducted    numeric not null default 0,
  tax_deducted      numeric not null default 0,
  net_amount        numeric not null default 0,
  payment_status    text    not null default 'Paid',
  created_at    timestamptz not null default now(),

  unique (portfolio_id, warrant_no)
);

alter table cdc_dividends enable row level security;

create policy "select_own_cdc_dividends" on cdc_dividends
  for select using (
    portfolio_id in (select id from portfolios where user_id = auth.uid())
  );

create policy "insert_own_cdc_dividends" on cdc_dividends
  for insert with check (
    portfolio_id in (select id from portfolios where user_id = auth.uid())
  );

create policy "delete_own_cdc_dividends" on cdc_dividends
  for delete using (
    portfolio_id in (select id from portfolios where user_id = auth.uid())
  );

create index cdc_dividends_portfolio_idx on cdc_dividends (portfolio_id, payment_date desc);
