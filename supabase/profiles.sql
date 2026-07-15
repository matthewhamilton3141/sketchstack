-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Creates a per-user profile row holding a unique username, secured with RLS.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Usernames are public: anyone can read profile rows.
create policy "profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- A user may create only their own profile row.
create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user may update only their own profile row.
create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
