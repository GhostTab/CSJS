# CSJS Learning Platform

Interactive Grade 7-10 learning app built with React + Vite + Supabase (auth & rankings).

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
