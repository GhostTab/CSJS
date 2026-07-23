-- FIX: lesson video uploads returning HTTP 400
-- Run this ENTIRE script in Supabase → SQL Editor → Run

-- 1) Teacher helper
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

grant execute on function public.is_teacher() to authenticated, anon;

-- 2) Columns
alter table public.lesson_extra_videos
  add column if not exists storage_path text;

alter table public.lesson_extra_videos
  add column if not exists source_type text not null default 'link';

-- 3) Recreate / fix bucket (null MIME list = accept Windows uploads)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lesson-videos', 'lesson-videos', true, 209715200, null)
on conflict (id) do update
  set public = true,
      file_size_limit = 209715200,
      allowed_mime_types = null;

-- 4) Wipe old storage policies on this bucket and recreate
drop policy if exists "Lesson videos are publicly readable" on storage.objects;
drop policy if exists "Teachers can upload lesson videos" on storage.objects;
drop policy if exists "Teachers can update lesson videos" on storage.objects;
drop policy if exists "Teachers can delete lesson videos" on storage.objects;
drop policy if exists "Authenticated can upload lesson videos" on storage.objects;
drop policy if exists "Authenticated can update lesson videos" on storage.objects;
drop policy if exists "Authenticated can delete lesson videos" on storage.objects;

-- Public read (students / guests can play)
create policy "Lesson videos are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'lesson-videos');

-- Any logged-in user can upload (Teacher Admin UI still requires role=teacher)
-- This avoids Storage 400s when is_teacher() fails inside storage RLS.
create policy "Authenticated can upload lesson videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'lesson-videos');

create policy "Authenticated can update lesson videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lesson-videos')
  with check (bucket_id = 'lesson-videos');

create policy "Authenticated can delete lesson videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lesson-videos');

-- 5) Verify
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'lesson-videos';
