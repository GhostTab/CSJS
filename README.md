# CSJS Learning Platform

Interactive Grade 7-10 learning app built with React + Vite.

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

`npm install` automatically runs media approval normalization via `postinstall`, so no extra setup command is required.

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
