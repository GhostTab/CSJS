# CSJS Learning Platform

Interactive Grade 7-10 learning app built with React + Vite + Supabase (auth & rankings).

## Documentation

- [System flowcharts & DFDs (revised v2)](docs/SYSTEM_FLOWCHARTS_AND_DFD.md) — overview, auth/roles, teacher video management, rankings; Level 0 / 1 / 2 DFDs
- [Developer flow](docs/DEVELOPER_FLOW.md) — how lessons, media approval, and local overrides work

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase URL and anon key (see below)
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

`npm install` automatically runs media approval normalization via `postinstall`, so no extra setup command is required.

## Supabase Setup (Auth + Rankings)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full script in [`supabase/schema.sql`](supabase/schema.sql).
3. In **Project Settings → API**, copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
4. Put them in a local `.env` file (never commit this file):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

5. Restart `npm run dev` after changing `.env`.

**Auth:** email + password register/login.

**Rankings:** overall points from **lesson quizzes only** (score × 5). Practice quizzes on `/quiz-practice` do not count.

Optional (Auth): disable “Confirm email” in Supabase Auth settings if you want instant login after register during development.

## Teacher Admin (extra lesson videos)

Teachers can add, edit, or remove **additional** videos on any lesson. The original curriculum video in the JSON lesson files is never deleted.

1. If your Supabase project already exists, run [`supabase/schema_teacher_videos.sql`](supabase/schema_teacher_videos.sql) in the SQL Editor (adds `profiles.role` + `lesson_extra_videos`). New projects can use the updated [`supabase/schema.sql`](supabase/schema.sql) instead.
2. Register/login a teacher account in the app.
3. Promote that account in SQL (replace the email):

```sql
update public.profiles
set role = 'teacher'
where email = 'teacher@example.com';
```

4. Log out and log back in. Open **Teacher** in the navbar (`/teacher`).
5. Filter lessons → expand a lesson → either paste a YouTube/Vimeo URL **or upload a video file from your laptop** (MP4/WebM/MOV, max 100 MB) → save. Students see extras in the Media Learning Hub.
6. For local uploads, also run [`supabase/schema_lesson_video_storage.sql`](supabase/schema_lesson_video_storage.sql) once (creates the `lesson-videos` storage bucket).

## School Hero Image

Drop a school photo at:

- `src/assets/school-hero.jpg` (also `.jpeg`, `.png`, or `.webp`)

The home hero uses it as a full-bleed background with a light overlay. If the file is missing, the gradient mesh fallback is used.

## Run Commands

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Media Data Commands

- `npm run videos:migrate-approval`
  - normalizes `lesson.video.approved`
  - sets `approved=true` when a lesson has a non-empty `video.url`
  - sets `approved=false` when `video.url` is empty
- `npm run videos:auto-match` - auto-finds YouTube videos per lesson
- `npm run images:auto-match` - auto-finds lesson images

## Demo Route

Home page "View Demo" button points to:

- `/grade/7/math/fractions-and-decimals`

This route is kept as a stable demo lesson with video enabled.
