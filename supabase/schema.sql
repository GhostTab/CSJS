-- CSJS Learn — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'student' check (role in ('student', 'teacher')),
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
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

-- Extra videos teachers add (static JSON lesson.video is never modified)
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

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.lesson_extra_videos enable row level security;

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

-- Extra videos: public read; teachers write
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

-- Local video uploads (teachers)
alter table public.lesson_extra_videos
  add column if not exists storage_path text;

alter table public.lesson_extra_videos
  add column if not exists source_type text not null default 'link';

alter table public.lesson_extra_videos
  drop constraint if exists lesson_extra_videos_source_type_check;

alter table public.lesson_extra_videos
  add constraint lesson_extra_videos_source_type_check
  check (source_type in ('link', 'upload'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-videos',
  'lesson-videos',
  true,
  104857600,
  array['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Lesson videos are publicly readable" on storage.objects;
create policy "Lesson videos are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'lesson-videos');

drop policy if exists "Teachers can upload lesson videos" on storage.objects;
create policy "Teachers can upload lesson videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'lesson-videos' and public.is_teacher());

drop policy if exists "Teachers can update lesson videos" on storage.objects;
create policy "Teachers can update lesson videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lesson-videos' and public.is_teacher())
  with check (bucket_id = 'lesson-videos' and public.is_teacher());

drop policy if exists "Teachers can delete lesson videos" on storage.objects;
create policy "Teachers can delete lesson videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lesson-videos' and public.is_teacher());
