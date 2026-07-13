-- ─────────────────────────────────────────────────────────────
-- 0012_rls_performance.sql — RLS performance fixes
--
-- Supabase's performance advisor flags every owner-style policy below:
-- `auth.uid()` inside a policy is re-evaluated by Postgres for EVERY row a
-- query touches. Wrapping it as `(select auth.uid())` lets the planner treat
-- it as a stable, one-time InitPlan value instead, which materially speeds
-- up scans on tables with many rows per user (holdings, transactions,
-- notifications, etc). Behaviour is identical — this is a pure perf fix, no
-- policy logic changes. See
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
--
-- Also adds the two missing covering indexes flagged by the advisor for
-- unindexed foreign keys.
-- ─────────────────────────────────────────────────────────────

-- profiles
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using ((select auth.uid()) = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- portfolios
drop policy if exists "portfolios_owner" on public.portfolios;
create policy "portfolios_owner" on public.portfolios
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- holdings (owned via parent portfolio)
drop policy if exists "holdings_owner" on public.holdings;
create policy "holdings_owner" on public.holdings
  for all using (
    exists (select 1 from public.portfolios p
            where p.id = holdings.portfolio_id and p.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.portfolios p
            where p.id = holdings.portfolio_id and p.user_id = (select auth.uid()))
  );

-- transactions (owned via parent portfolio)
drop policy if exists "transactions_owner_select" on public.transactions;
create policy "transactions_owner_select" on public.transactions
  for select using (
    exists (select 1 from public.portfolios p
            where p.id = transactions.portfolio_id and p.user_id = (select auth.uid()))
  );

drop policy if exists "transactions_owner_insert" on public.transactions;
create policy "transactions_owner_insert" on public.transactions
  for insert with check (
    exists (select 1 from public.portfolios p
            where p.id = transactions.portfolio_id and p.user_id = (select auth.uid()))
  );

-- daily_pl (owned via parent portfolio, read-only from the client)
drop policy if exists "daily_pl_owner_select" on public.daily_pl;
create policy "daily_pl_owner_select" on public.daily_pl
  for select using (
    exists (select 1 from public.portfolios p
            where p.id = daily_pl.portfolio_id and p.user_id = (select auth.uid()))
  );

-- watchlists
drop policy if exists "watchlists_owner" on public.watchlists;
create policy "watchlists_owner" on public.watchlists
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- watchlist_items (owned via parent watchlist)
drop policy if exists "watchlist_items_owner" on public.watchlist_items;
create policy "watchlist_items_owner" on public.watchlist_items
  for all using (
    exists (select 1 from public.watchlists w
            where w.id = watchlist_items.watchlist_id and w.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.watchlists w
            where w.id = watchlist_items.watchlist_id and w.user_id = (select auth.uid()))
  );

-- alerts
drop policy if exists "alerts_owner" on public.alerts;
create policy "alerts_owner" on public.alerts
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- notifications (read-only from the client)
drop policy if exists "notifications_read" on public.notifications;
create policy "notifications_read" on public.notifications
  for select using (user_id = (select auth.uid()) or user_id is null);

-- push_subscriptions
drop policy if exists "push_subscriptions_self_select" on public.push_subscriptions;
create policy "push_subscriptions_self_select" on public.push_subscriptions
  for select using ((select auth.uid()) = user_id);

drop policy if exists "push_subscriptions_self_insert" on public.push_subscriptions;
create policy "push_subscriptions_self_insert" on public.push_subscriptions
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "push_subscriptions_self_update" on public.push_subscriptions;
create policy "push_subscriptions_self_update" on public.push_subscriptions
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "push_subscriptions_self_delete" on public.push_subscriptions;
create policy "push_subscriptions_self_delete" on public.push_subscriptions
  for delete using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- Missing covering indexes for unindexed foreign keys
-- ─────────────────────────────────────────────────────────────

create index if not exists holdings_symbol_idx
  on public.holdings (symbol);

create index if not exists mutual_fund_holdings_created_by_idx
  on public.mutual_fund_holdings (created_by);
