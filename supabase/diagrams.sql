-- Run in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Per-user saved diagrams (cloud save) + public sharing, secured with RLS.
--
-- Already created this table before sharing existed? Run the migration at the
-- bottom instead (adds is_public + the public-read policy).

create table if not exists public.diagrams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  mode text not null default 'system',
  data jsonb not null, -- { nodes, edges }
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.diagrams enable row level security;

-- Owners can do anything with their own diagrams.
create policy "own diagrams — select"
  on public.diagrams for select using (auth.uid() = user_id);
create policy "own diagrams — insert"
  on public.diagrams for insert with check (auth.uid() = user_id);
create policy "own diagrams — update"
  on public.diagrams for update using (auth.uid() = user_id);
create policy "own diagrams — delete"
  on public.diagrams for delete using (auth.uid() = user_id);

-- Anyone (including signed-out visitors) can read a diagram marked public.
create policy "public diagrams are viewable"
  on public.diagrams for select using (is_public = true);

-- ---------------------------------------------------------------------------
-- MIGRATION (only if the diagrams table already existed without sharing):
--
--   alter table public.diagrams
--     add column if not exists is_public boolean not null default false;
--
--   create policy "public diagrams are viewable"
--     on public.diagrams for select using (is_public = true);
-- ---------------------------------------------------------------------------
