-- PeerLoop Supabase schema
-- Run this file in Supabase Dashboard > SQL Editor.
-- Tables and policies match the columns used by app.js.

create extension if not exists pgcrypto;

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null,
  title text not null check (char_length(trim(title)) between 3 and 100),
  subject text not null,
  body text not null check (char_length(trim(body)) >= 10),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  strengths text not null check (char_length(trim(strengths)) > 0),
  suggestion text not null check (char_length(trim(suggestion)) > 0),
  created_at timestamptz not null default now(),
  constraint one_review_per_student unique (assignment_id, reviewer_id)
);

create index if not exists assignments_created_at_idx on public.assignments (created_at desc);
create index if not exists assignments_owner_id_idx on public.assignments (owner_id);
create index if not exists reviews_assignment_id_idx on public.reviews (assignment_id);
create index if not exists reviews_reviewer_id_idx on public.reviews (reviewer_id);

alter table public.assignments enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Signed-in students can read assignments" on public.assignments;
create policy "Signed-in students can read assignments"
on public.assignments for select to authenticated using (true);

drop policy if exists "Students can submit as themselves" on public.assignments;
create policy "Students can submit as themselves"
on public.assignments for insert to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "Students can edit their own assignments" on public.assignments;
create policy "Students can edit their own assignments"
on public.assignments for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Students can delete their own assignments" on public.assignments;
create policy "Students can delete their own assignments"
on public.assignments for delete to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Signed-in students can read reviews" on public.reviews;
create policy "Signed-in students can read reviews"
on public.reviews for select to authenticated using (true);

drop policy if exists "Students can review another student's assignment" on public.reviews;
create policy "Students can review another student's assignment"
on public.reviews for insert to authenticated
with check (
  reviewer_id = (select auth.uid())
  and exists (
    select 1 from public.assignments a
    where a.id = assignment_id
      and a.owner_id <> (select auth.uid())
  )
);

-- Reviews are immutable in this version: students cannot edit or delete submitted reviews.
