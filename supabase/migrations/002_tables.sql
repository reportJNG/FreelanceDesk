create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  currency text not null default 'DZD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system','light','dark')),
  currency text not null default 'DZD',
  reminder_days_before integer not null default 7 check (reminder_days_before between 1 and 365),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
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
  status text not null default 'active' check (status in ('active','lead','inactive','archived')),
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  description text,
  project_type text,
  status text not null default 'lead' check (status in ('lead','active','testing','delivered','maintenance','cancelled','archived')),
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
  total_price numeric(12,2) not null default 0 check (total_price >= 0),
  expenses numeric(12,2) not null default 0 check (expenses >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (test_end_date is null or test_start_date is null or test_end_date >= test_start_date),
  check (delivered_at is null or started_at is null or delivered_at >= started_at)
);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  request_type text not null default 'other' check (request_type in ('bug','change','feature','maintenance','consulting','other')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'new' check (status in ('new','planned','in_progress','waiting_client','done','cancelled')),
  price numeric(12,2) not null default 0 check (price >= 0),
  requested_at date not null default current_date,
  due_date date,
  completed_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  support_request_id uuid references public.support_requests(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  method text not null default 'cash' check (method in ('cash','baridimob','ccp','bank_transfer','paypal','wise','crypto','other')),
  status text not null default 'paid' check (status in ('pending','paid','failed','refunded')),
  paid_at date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

