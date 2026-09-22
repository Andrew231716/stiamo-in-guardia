-- Stiamo in guardia — schema Supabase
-- Applica in SQL Editor. Abilita RLS su tutte le tabelle personali.
-- Non esporre mai la service_role key al browser.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  preferences jsonb not null default '{}'::jsonb,
  notification_settings jsonb not null default '{}'::jsonb
);

create table if not exists public.daily_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  category text not null,
  title text not null,
  duration_minutes int not null,
  objective text,
  introduction text,
  scripture_references jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  writing_prompt text,
  reflection_question text,
  daily_action text,
  source_references jsonb,
  personal_response text,
  reflection_answer text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  pornography_status text not null,
  masturbation_status text not null,
  involuntary_impulse_status text not null,
  triggers jsonb not null default '[]'::jsonb,
  chain_stage text,
  strategies_used jsonb not null default '[]'::jsonb,
  small_victory text,
  improvement_note text,
  prayer_completed boolean,
  notes text,
  preventive_adjustment text,
  interruption_point text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.trigger_catalog (
  id text primary key,
  name text not null,
  category text not null,
  description text
);

create table if not exists public.strategies (
  id text primary key,
  name text not null,
  description text,
  category text
);

create table if not exists public.prayer_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  verse_reference text,
  written_prayer text,
  feeling_note text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  start_date date not null,
  end_date date not null,
  report_data jsonb not null,
  generated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id text primary key,
  title text not null,
  organization text not null,
  url text not null,
  source_type text not null,
  description text,
  last_verified_at date
);

create index if not exists daily_checkins_user_date_idx on public.daily_checkins (user_id, date desc);
create index if not exists daily_activities_user_date_idx on public.daily_activities (user_id, date desc);
create index if not exists reports_user_period_idx on public.reports (user_id, period_type, start_date desc);

alter table public.profiles enable row level security;
alter table public.daily_activities enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.prayer_entries enable row level security;
alter table public.reports enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "activities_own" on public.daily_activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "checkins_own" on public.daily_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "prayers_own" on public.prayer_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reports_own" on public.reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cataloghi e fonti: lettura pubblica autenticata (opzionale)
alter table public.trigger_catalog enable row level security;
alter table public.strategies enable row level security;
alter table public.sources enable row level security;

create policy "trigger_read" on public.trigger_catalog for select to authenticated using (true);
create policy "strategies_read" on public.strategies for select to authenticated using (true);
create policy "sources_read" on public.sources for select to authenticated using (true);
