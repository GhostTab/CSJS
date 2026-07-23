-- CSJS Learn — Teacher admin + extra lesson videos
-- Run this in Supabase SQL Editor AFTER using Teacher Admin.
-- Safe to re-run on an existing project (uses IF NOT EXISTS / DROP POLICY IF EXISTS).

-- ---------------------------------------------------------------------------
-- 1) Teacher role on profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'student';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'teacher'));

-- Prevent students from elevating their own role via the API
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Block role changes from the client API (JWT present).
  -- Allow updates from the Supabase SQL Editor (auth.uid() is null).
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Role can only be changed from the Supabase dashboard (SQL Editor).';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_role_guard on public.profiles;
create trigger on_profile_role_guard
  before update on public.profiles
  for each row execute function public.prevent_profile_role_escalation();

-- Helper for RLS
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

-- ---------------------------------------------------------------------------
-- 2) Extra videos teachers add (static JSON lesson.video is never modified)
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_extra_videos (
  id uuid primary key default gen_random_uuid(),
  grade_id text not null,
  subject_id text not null,
  lesson_id text not null,
  url text not null,
  title text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_extra_videos_lesson_idx
  on public.lesson_extra_videos (grade_id, subject_id, lesson_id);

alter table public.lesson_extra_videos enable row level security;

-- Everyone (including guests) can read extras so videos show in lessons
drop policy if exists "Extra videos are publicly readable" on public.lesson_extra_videos;
create policy "Extra videos are publicly readable"
  on public.lesson_extra_videos for select
  to anon, authenticated
  using (true);

drop policy if exists "Teachers can insert extra videos" on public.lesson_extra_videos;
create policy "Teachers can insert extra videos"
  on public.lesson_extra_videos for insert
  to authenticated
  with check (public.is_teacher());

drop policy if exists "Teachers can update extra videos" on public.lesson_extra_videos;
create policy "Teachers can update extra videos"
  on public.lesson_extra_videos for update
  to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

drop policy if exists "Teachers can delete extra videos" on public.lesson_extra_videos;
create policy "Teachers can delete extra videos"
  on public.lesson_extra_videos for delete
  to authenticated
  using (public.is_teacher());

-- ---------------------------------------------------------------------------
-- 3) Promote a teacher (run once with YOUR teacher email)
-- ---------------------------------------------------------------------------
-- update public.profiles
-- set role = 'teacher'
-- where email = 'teacher@school.edu';
