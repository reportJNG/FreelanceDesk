-- ============================================================
-- FreelanceDesk — Full Supabase SQL Setup
-- Purpose: private one-admin freelance client/project/payment dashboard
-- Safe target: fresh Supabase project
-- Can also be re-run mostly safely: policies/triggers/views/functions are replaced
-- ============================================================

begin;

-- ============================================================
-- 001. Extensions
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 002. Tables
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  currency text not null default 'DZD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade default auth.uid(),
  theme text not null default 'system',
  currency text not null default 'DZD',
  reminder_days_before integer not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_settings_theme_check check (theme in ('system','light','dark')),
  constraint app_settings_reminder_days_check check (reminder_days_before between 1 and 365)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  company_name text,
  email text,
  phone text,
  whatsapp text,
  instagram text,
  facebook text,
  tiktok text,
  website text,
  country text,
  city text,
  address text,
  source text,
  status text not null default 'active',
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint clients_status_check check (status in ('lead','active','inactive','archived'))
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  description text,
  project_type text,
  status text not null default 'lead',
  domain text,
  domain_provider text,
  domain_renewal_date date,
  hosting_provider text,
  hosting_renewal_date date,
  repository_url text,
  production_url text,
  admin_url text,
  admin_username text,
  admin_password_note text,
  languages text[] not null default '{}',
  frameworks text[] not null default '{}',
  started_at date,
  delivered_at date,
  test_start_date date,
  test_end_date date,
  maintenance_end_date date,
  total_price numeric(12,2) not null default 0,
  expenses numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint projects_status_check check (status in ('lead','active','testing','delivered','maintenance','cancelled','archived')),
  constraint projects_total_price_check check (total_price >= 0),
  constraint projects_expenses_check check (expenses >= 0),
  constraint projects_test_dates_check check (test_end_date is null or test_start_date is null or test_end_date >= test_start_date),
  constraint projects_delivery_dates_check check (delivered_at is null or started_at is null or delivered_at >= started_at)
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  request_type text not null default 'other',
  priority text not null default 'medium',
  status text not null default 'new',
  price numeric(12,2) not null default 0,
  requested_at date not null default current_date,
  due_date date,
  completed_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_request_type_check check (request_type in ('bug','change','feature','maintenance','consulting','other')),
  constraint support_priority_check check (priority in ('low','medium','high','urgent')),
  constraint support_status_check check (status in ('new','planned','in_progress','waiting_client','done','cancelled')),
  constraint support_price_check check (price >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  support_request_id uuid references public.support_requests(id) on delete set null,
  amount numeric(12,2) not null,
  method text default 'cash',
  status text not null default 'paid',
  paid_at date,
  notes text,
  created_at timestamptz not null default now(),
  constraint payments_amount_check check (amount >= 0),
  constraint payments_status_check check (status in ('pending','paid','failed','refunded')),
  constraint payments_method_check check (method is null or method in ('cash','baridimob','ccp','bank_transfer','paypal','wise','crypto','other'))
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Normalize defaults if the first Codex migrations were already run.
alter table public.app_settings alter column owner_id set default auth.uid();
alter table public.clients alter column owner_id set default auth.uid();
alter table public.projects alter column owner_id set default auth.uid();
alter table public.support_requests alter column owner_id set default auth.uid();
alter table public.payments alter column owner_id set default auth.uid();
alter table public.activity_logs alter column owner_id set default auth.uid();
alter table public.payments alter column method drop not null;

-- ============================================================
-- 003. Indexes
-- ============================================================

create index if not exists clients_owner_id_idx on public.clients(owner_id);
create index if not exists clients_name_idx on public.clients(name);
create index if not exists clients_company_name_idx on public.clients(company_name);
create index if not exists clients_created_at_idx on public.clients(created_at);
create index if not exists clients_status_idx on public.clients(status);
create index if not exists clients_archived_at_idx on public.clients(archived_at);
create index if not exists clients_tags_gin_idx on public.clients using gin(tags);

create index if not exists projects_owner_id_idx on public.projects(owner_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_test_end_date_idx on public.projects(test_end_date);
create index if not exists projects_domain_renewal_date_idx on public.projects(domain_renewal_date);
create index if not exists projects_hosting_renewal_date_idx on public.projects(hosting_renewal_date);
create index if not exists projects_archived_at_idx on public.projects(archived_at);
create index if not exists projects_languages_gin_idx on public.projects using gin(languages);
create index if not exists projects_frameworks_gin_idx on public.projects using gin(frameworks);

create index if not exists payments_owner_id_idx on public.payments(owner_id);
create index if not exists payments_client_id_idx on public.payments(client_id);
create index if not exists payments_project_id_idx on public.payments(project_id);
create index if not exists payments_support_request_id_idx on public.payments(support_request_id);
create index if not exists payments_paid_at_idx on public.payments(paid_at);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_method_idx on public.payments(method);

create index if not exists support_requests_owner_id_idx on public.support_requests(owner_id);
create index if not exists support_requests_client_id_idx on public.support_requests(client_id);
create index if not exists support_requests_project_id_idx on public.support_requests(project_id);
create index if not exists support_requests_status_idx on public.support_requests(status);
create index if not exists support_requests_priority_idx on public.support_requests(priority);
create index if not exists support_requests_due_date_idx on public.support_requests(due_date);
create index if not exists support_requests_request_type_idx on public.support_requests(request_type);

create index if not exists activity_logs_owner_id_idx on public.activity_logs(owner_id);
create index if not exists activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at);

-- ============================================================
-- 004. Updated-at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists support_requests_set_updated_at on public.support_requests;
create trigger support_requests_set_updated_at
before update on public.support_requests
for each row execute function public.set_updated_at();

-- ============================================================
-- 005. Auto-create profile/settings for new auth users
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();

  insert into public.app_settings (owner_id, currency, theme, reminder_days_before)
  values (new.id, 'DZD', 'system', 7)
  on conflict (owner_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_freelancedesk on auth.users;
create trigger on_auth_user_created_freelancedesk
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- 006. Owner-consistency guard triggers
-- These prevent linking a project/payment/support row to another user's rows.
-- Useful even for one-admin apps and especially useful if backend uses service role.
-- ============================================================

create or replace function public.validate_project_owner_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_owner uuid;
begin
  select owner_id into v_client_owner
  from public.clients
  where id = new.client_id;

  if v_client_owner is null then
    raise exception 'Client not found for project.';
  end if;

  if v_client_owner <> new.owner_id then
    raise exception 'Project owner_id must match client owner_id.';
  end if;

  return new;
end;
$$;

drop trigger if exists projects_validate_owner_links on public.projects;
create trigger projects_validate_owner_links
before insert or update of owner_id, client_id on public.projects
for each row execute function public.validate_project_owner_links();

create or replace function public.validate_support_request_owner_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_owner uuid;
  v_project_owner uuid;
  v_project_client uuid;
begin
  select owner_id into v_client_owner
  from public.clients
  where id = new.client_id;

  if v_client_owner is null then
    raise exception 'Client not found for support request.';
  end if;

  if v_client_owner <> new.owner_id then
    raise exception 'Support request owner_id must match client owner_id.';
  end if;

  if new.project_id is not null then
    select owner_id, client_id into v_project_owner, v_project_client
    from public.projects
    where id = new.project_id;

    if v_project_owner is null then
      raise exception 'Project not found for support request.';
    end if;

    if v_project_owner <> new.owner_id then
      raise exception 'Support request owner_id must match project owner_id.';
    end if;

    if v_project_client <> new.client_id then
      raise exception 'Support request project must belong to the selected client.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists support_requests_validate_owner_links on public.support_requests;
create trigger support_requests_validate_owner_links
before insert or update of owner_id, client_id, project_id on public.support_requests
for each row execute function public.validate_support_request_owner_links();

create or replace function public.validate_payment_owner_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_owner uuid;
  v_project_owner uuid;
  v_project_client uuid;
  v_support_owner uuid;
  v_support_client uuid;
  v_support_project uuid;
begin
  select owner_id into v_client_owner
  from public.clients
  where id = new.client_id;

  if v_client_owner is null then
    raise exception 'Client not found for payment.';
  end if;

  if v_client_owner <> new.owner_id then
    raise exception 'Payment owner_id must match client owner_id.';
  end if;

  if new.project_id is not null then
    select owner_id, client_id into v_project_owner, v_project_client
    from public.projects
    where id = new.project_id;

    if v_project_owner is null then
      raise exception 'Project not found for payment.';
    end if;

    if v_project_owner <> new.owner_id then
      raise exception 'Payment owner_id must match project owner_id.';
    end if;

    if v_project_client <> new.client_id then
      raise exception 'Payment project must belong to the selected client.';
    end if;
  end if;

  if new.support_request_id is not null then
    select owner_id, client_id, project_id into v_support_owner, v_support_client, v_support_project
    from public.support_requests
    where id = new.support_request_id;

    if v_support_owner is null then
      raise exception 'Support request not found for payment.';
    end if;

    if v_support_owner <> new.owner_id then
      raise exception 'Payment owner_id must match support request owner_id.';
    end if;

    if v_support_client <> new.client_id then
      raise exception 'Payment support request must belong to the selected client.';
    end if;

    if new.project_id is not null and v_support_project is not null and v_support_project <> new.project_id then
      raise exception 'Payment project must match support request project.';
    end if;
  end if;

  if new.status = 'paid' and new.paid_at is null then
    new.paid_at = current_date;
  end if;

  return new;
end;
$$;

drop trigger if exists payments_validate_owner_links on public.payments;
create trigger payments_validate_owner_links
before insert or update of owner_id, client_id, project_id, support_request_id, status, paid_at on public.payments
for each row execute function public.validate_payment_owner_links();

-- ============================================================
-- 007. Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.support_requests enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

-- Drop and recreate policies so this file can be re-run.
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;

create policy profiles_select_own on public.profiles
for select to authenticated
using (id = auth.uid());

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (id = auth.uid());

create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- No profile delete policy by default. Deleting auth.users cascades if needed.

-- App settings policies
drop policy if exists app_settings_select_own on public.app_settings;
drop policy if exists app_settings_insert_own on public.app_settings;
drop policy if exists app_settings_update_own on public.app_settings;
drop policy if exists app_settings_delete_own on public.app_settings;

create policy app_settings_select_own on public.app_settings
for select to authenticated
using (owner_id = auth.uid());

create policy app_settings_insert_own on public.app_settings
for insert to authenticated
with check (owner_id = auth.uid());

create policy app_settings_update_own on public.app_settings
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy app_settings_delete_own on public.app_settings
for delete to authenticated
using (owner_id = auth.uid());

-- Clients policies
drop policy if exists clients_select_own on public.clients;
drop policy if exists clients_insert_own on public.clients;
drop policy if exists clients_update_own on public.clients;
drop policy if exists clients_delete_own on public.clients;

create policy clients_select_own on public.clients
for select to authenticated
using (owner_id = auth.uid());

create policy clients_insert_own on public.clients
for insert to authenticated
with check (owner_id = auth.uid());

create policy clients_update_own on public.clients
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy clients_delete_own on public.clients
for delete to authenticated
using (owner_id = auth.uid());

-- Projects policies
drop policy if exists projects_select_own on public.projects;
drop policy if exists projects_insert_own on public.projects;
drop policy if exists projects_update_own on public.projects;
drop policy if exists projects_delete_own on public.projects;

create policy projects_select_own on public.projects
for select to authenticated
using (owner_id = auth.uid());

create policy projects_insert_own on public.projects
for insert to authenticated
with check (owner_id = auth.uid());

create policy projects_update_own on public.projects
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy projects_delete_own on public.projects
for delete to authenticated
using (owner_id = auth.uid());

-- Support request policies
drop policy if exists support_requests_select_own on public.support_requests;
drop policy if exists support_requests_insert_own on public.support_requests;
drop policy if exists support_requests_update_own on public.support_requests;
drop policy if exists support_requests_delete_own on public.support_requests;

create policy support_requests_select_own on public.support_requests
for select to authenticated
using (owner_id = auth.uid());

create policy support_requests_insert_own on public.support_requests
for insert to authenticated
with check (owner_id = auth.uid());

create policy support_requests_update_own on public.support_requests
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy support_requests_delete_own on public.support_requests
for delete to authenticated
using (owner_id = auth.uid());

-- Payment policies
drop policy if exists payments_select_own on public.payments;
drop policy if exists payments_insert_own on public.payments;
drop policy if exists payments_update_own on public.payments;
drop policy if exists payments_delete_own on public.payments;

create policy payments_select_own on public.payments
for select to authenticated
using (owner_id = auth.uid());

create policy payments_insert_own on public.payments
for insert to authenticated
with check (owner_id = auth.uid());

create policy payments_update_own on public.payments
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy payments_delete_own on public.payments
for delete to authenticated
using (owner_id = auth.uid());

-- Activity log policies
drop policy if exists activity_logs_select_own on public.activity_logs;
drop policy if exists activity_logs_insert_own on public.activity_logs;
drop policy if exists activity_logs_update_own on public.activity_logs;
drop policy if exists activity_logs_delete_own on public.activity_logs;

create policy activity_logs_select_own on public.activity_logs
for select to authenticated
using (owner_id = auth.uid());

create policy activity_logs_insert_own on public.activity_logs
for insert to authenticated
with check (owner_id = auth.uid());

create policy activity_logs_update_own on public.activity_logs
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy activity_logs_delete_own on public.activity_logs
for delete to authenticated
using (owner_id = auth.uid());

-- ============================================================
-- 008. Reporting views
-- These views include owner_id and use security_invoker so RLS is respected.
-- ============================================================

create or replace view public.project_payment_totals
with (security_invoker = true)
as
select
  p.owner_id,
  p.id as project_id,
  coalesce(sum(pay.amount) filter (where pay.status = 'paid'), 0)::numeric(12,2) as paid_amount,
  coalesce(sum(pay.amount) filter (where pay.status = 'pending'), 0)::numeric(12,2) as pending_amount,
  coalesce(sum(pay.amount) filter (where pay.status = 'refunded'), 0)::numeric(12,2) as refunded_amount
from public.projects p
left join public.payments pay
  on pay.project_id = p.id
 and pay.owner_id = p.owner_id
group by p.owner_id, p.id;

create or replace view public.support_payment_totals
with (security_invoker = true)
as
select
  s.owner_id,
  s.id as support_request_id,
  coalesce(sum(pay.amount) filter (where pay.status = 'paid'), 0)::numeric(12,2) as paid_amount,
  coalesce(sum(pay.amount) filter (where pay.status = 'pending'), 0)::numeric(12,2) as pending_amount,
  coalesce(sum(pay.amount) filter (where pay.status = 'refunded'), 0)::numeric(12,2) as refunded_amount
from public.support_requests s
left join public.payments pay
  on pay.support_request_id = s.id
 and pay.owner_id = s.owner_id
group by s.owner_id, s.id;

create or replace view public.project_financials
with (security_invoker = true)
as
select
  p.owner_id,
  p.id as project_id,
  p.client_id,
  p.name,
  p.status,
  p.total_price::numeric(12,2) as expected_amount,
  coalesce(t.paid_amount, 0)::numeric(12,2) as paid_amount,
  greatest(p.total_price - coalesce(t.paid_amount, 0), 0)::numeric(12,2) as remaining_amount,
  p.expenses::numeric(12,2) as expenses,
  (coalesce(t.paid_amount, 0) - p.expenses)::numeric(12,2) as net_profit,
  p.created_at,
  p.archived_at
from public.projects p
left join public.project_payment_totals t
  on t.project_id = p.id
 and t.owner_id = p.owner_id;

create or replace view public.support_request_financials
with (security_invoker = true)
as
select
  s.owner_id,
  s.id as support_request_id,
  s.client_id,
  s.project_id,
  s.title,
  s.status,
  s.priority,
  s.price::numeric(12,2) as expected_amount,
  coalesce(t.paid_amount, 0)::numeric(12,2) as paid_amount,
  greatest(s.price - coalesce(t.paid_amount, 0), 0)::numeric(12,2) as remaining_amount,
  s.created_at
from public.support_requests s
left join public.support_payment_totals t
  on t.support_request_id = s.id
 and t.owner_id = s.owner_id;

create or replace view public.client_financials
with (security_invoker = true)
as
select
  c.owner_id,
  c.id as client_id,
  c.name,
  c.company_name,
  coalesce((
    select sum(p.total_price)
    from public.projects p
    where p.client_id = c.id
      and p.owner_id = c.owner_id
      and p.archived_at is null
  ), 0)::numeric(12,2) as project_expected_amount,
  coalesce((
    select sum(s.price)
    from public.support_requests s
    where s.client_id = c.id
      and s.owner_id = c.owner_id
      and s.status <> 'cancelled'
  ), 0)::numeric(12,2) as support_expected_amount,
  coalesce((
    select sum(pay.amount)
    from public.payments pay
    where pay.client_id = c.id
      and pay.owner_id = c.owner_id
      and pay.status = 'paid'
  ), 0)::numeric(12,2) as paid_amount,
  greatest(
    coalesce((
      select sum(p.total_price)
      from public.projects p
      where p.client_id = c.id
        and p.owner_id = c.owner_id
        and p.archived_at is null
    ), 0)
    + coalesce((
      select sum(s.price)
      from public.support_requests s
      where s.client_id = c.id
        and s.owner_id = c.owner_id
        and s.status <> 'cancelled'
    ), 0)
    - coalesce((
      select sum(pay.amount)
      from public.payments pay
      where pay.client_id = c.id
        and pay.owner_id = c.owner_id
        and pay.status = 'paid'
    ), 0),
    0
  )::numeric(12,2) as remaining_amount,
  coalesce((
    select sum(p.expenses)
    from public.projects p
    where p.client_id = c.id
      and p.owner_id = c.owner_id
      and p.archived_at is null
  ), 0)::numeric(12,2) as expenses,
  c.created_at,
  c.archived_at
from public.clients c;

create or replace view public.monthly_revenue
with (security_invoker = true)
as
select
  owner_id,
  date_trunc('month', coalesce(paid_at, created_at::date)::timestamptz)::date as month,
  coalesce(sum(amount) filter (where status = 'paid'), 0)::numeric(12,2) as paid_amount,
  coalesce(sum(amount) filter (where status = 'pending'), 0)::numeric(12,2) as pending_amount,
  count(*) filter (where status = 'paid') as paid_count
from public.payments
group by owner_id, date_trunc('month', coalesce(paid_at, created_at::date)::timestamptz)::date;

-- ============================================================
-- 009. Grants
-- Supabase usually manages common grants, but these make the intent explicit.
-- RLS still controls row access for authenticated users.
-- ============================================================

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.app_settings to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.support_requests to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.activity_logs to authenticated;

grant select on public.project_payment_totals to authenticated;
grant select on public.support_payment_totals to authenticated;
grant select on public.project_financials to authenticated;
grant select on public.support_request_financials to authenticated;
grant select on public.client_financials to authenticated;
grant select on public.monthly_revenue to authenticated;

-- Internal trigger functions are not intended to be called directly from the API.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.validate_project_owner_links() from public, anon, authenticated;
revoke all on function public.validate_support_request_owner_links() from public, anon, authenticated;
revoke all on function public.validate_payment_owner_links() from public, anon, authenticated;

commit;
