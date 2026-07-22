-- CSJS Learn — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- Lesson quiz attempts only (practice quizzes are not stored)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null,
  grade_id text not null,
  subject_id text not null,
  score int not null check (score >= 0),
  total int not null check (total > 0),
  points int not null check (points >= 0),
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_points_idx on public.quiz_attempts (points desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;

-- Profiles: users can read all (for rankings), update own
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Quiz attempts: read all (rankings), insert/update own
drop policy if exists "Quiz attempts viewable by authenticated users" on public.quiz_attempts;
create policy "Quiz attempts viewable by authenticated users"
  on public.quiz_attempts for select
  to authenticated
  using (true);

drop policy if exists "Users can insert own quiz attempts" on public.quiz_attempts;
create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own quiz attempts" on public.quiz_attempts;
create policy "Users can update own quiz attempts"
  on public.quiz_attempts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
