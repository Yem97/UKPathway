-- ============================================================
-- UK Pathway Services — Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  country text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. SERVICES
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  short_description text,
  full_description text,
  timeline text,
  required_documents text[],
  price numeric,
  is_active boolean not null default true,
  display_order integer
);

-- 3. CASE NUMBER SEQUENCE (resets each year)
create sequence if not exists case_number_seq;

create or replace function public.generate_case_number()
returns text
language plpgsql
as $$
declare
  year_prefix text;
  seq_val bigint;
begin
  year_prefix := 'UKP-' || to_char(now(), 'YYYY') || '-';
  seq_val := nextval('case_number_seq');
  return year_prefix || lpad(seq_val::text, 4, '0');
end;
$$;

-- 4. CASES
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique not null default generate_case_number(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id),
  status text not null default 'submitted' check (status in (
    'submitted', 'under_review', 'documents_requested',
    'awaiting_payment', 'processing', 'completed', 'rejected'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

-- 5. CASE DOCUMENTS
create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  file_url text not null,
  file_name text,
  label text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 6. CASE MESSAGES
create table if not exists public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

-- 7. CASE TIMELINE
create table if not exists public.case_timeline (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  event_type text,
  event_description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 8. PAYMENTS (placeholder — Stripe plugs in here later)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  amount numeric,
  currency text not null default 'GBP',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  reference text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.cases enable row level security;
alter table public.case_documents enable row level security;
alter table public.case_messages enable row level security;
alter table public.case_timeline enable row level security;
alter table public.payments enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for all
  using (public.is_admin());

-- SERVICES policies (public read, admin write)
create policy "Anyone can view active services"
  on public.services for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage services"
  on public.services for all
  using (public.is_admin());

-- CASES policies
create policy "Clients see own cases"
  on public.cases for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Clients can create cases"
  on public.cases for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all cases"
  on public.cases for all
  using (public.is_admin());

-- CASE DOCUMENTS policies
create policy "Clients see own case documents"
  on public.case_documents for select
  using (
    public.is_admin() or
    exists (select 1 from public.cases where id = case_id and user_id = auth.uid())
  );

create policy "Clients can upload to own cases"
  on public.case_documents for insert
  with check (
    exists (select 1 from public.cases where id = case_id and user_id = auth.uid())
  );

create policy "Admins manage all documents"
  on public.case_documents for all
  using (public.is_admin());

-- CASE MESSAGES policies
create policy "Clients see non-internal messages on own cases"
  on public.case_messages for select
  using (
    public.is_admin() or
    (
      is_internal = false and
      exists (select 1 from public.cases where id = case_id and user_id = auth.uid())
    )
  );

create policy "Clients can send messages on own cases"
  on public.case_messages for insert
  with check (
    auth.uid() = author_id and
    exists (select 1 from public.cases where id = case_id and user_id = auth.uid())
  );

create policy "Admins manage all messages"
  on public.case_messages for all
  using (public.is_admin());

-- CASE TIMELINE policies
create policy "Clients see own case timeline"
  on public.case_timeline for select
  using (
    public.is_admin() or
    exists (select 1 from public.cases where id = case_id and user_id = auth.uid())
  );

create policy "Admins manage timeline"
  on public.case_timeline for all
  using (public.is_admin());

-- PAYMENTS policies
create policy "Clients see own payments"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins manage all payments"
  on public.payments for all
  using (public.is_admin());

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: auto-add timeline event on case status change
-- ============================================================
create or replace function public.log_case_status_change()
returns trigger
language plpgsql security definer
as $$
begin
  if old.status <> new.status then
    insert into public.case_timeline (case_id, event_type, event_description, created_by)
    values (
      new.id,
      'status_change',
      'Status changed from ' || old.status || ' to ' || new.status,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger cases_status_change
  after update on public.cases
  for each row execute function public.log_case_status_change();

-- ============================================================
-- STORAGE: Documents bucket (private — signed URLs only)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'case-documents');

create policy "Users can view own case documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'case-documents' and
    (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

create policy "Admins can manage all storage"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'case-documents' and public.is_admin());
