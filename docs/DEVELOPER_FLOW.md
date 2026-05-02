# CSJS Learn — developer guide

**Audience:** People editing this repo (developers, thesis authors). Students and teachers do not need this file.

---

## Start here

1. **Install and run:** From the repo root, run `npm install` once, then `npm run dev`. Open the URL Vite prints (usually `http://localhost:5173`).
2. **What you’re building:** A **static learning site** — pick grade → subject → lesson → read sections, use the **Media Learning Hub**, do an **activity**, take a **quiz**. Lesson content lives in **JSON** shipped with the app; there is **no server-side database** here.
3. **Two different uses of the browser:**  
   - **Learner progress** (quiz/completion) uses `localStorage` via `ProgressContext`.  
   - **Dev-only media curation** (approve video, paste image URLs) also uses `localStorage` plus optional **JSON backup** — it does **not** ship to production unless you update **`src/data/lessons/**/*.json`** or deploy with baked defaults.

---

## Run, build, and check

All commands run from the repository root.

| Command | When to use |
|---------|----------------|
| `npm install` | First clone, or after dependencies change. |
| `npm run dev` | Local development: Vite dev server, hot reload. |
| `npm run build` | Production bundle → `dist/`. |
| `npm run preview` | Serve the built `dist/` locally to verify the production bundle. |
| `npm run lint` | Run ESLint on the project. |
| `npm run videos:auto-match` | Script: `scripts/autoMatchLessonVideos.mjs` — sets `lesson.video` and **`approved: false`**. |
| `npm run images:auto-match` | Script: `scripts/autoMatchLessonImages.mjs` — image pipeline (see script for scope). |
| `node scripts/migrateVideoApproved.mjs` | One-time helper if you add lessons by hand and need `lesson.video.approved` filled in. |

---

## Glossary (words that confuse people)

| Term | Meaning |
|------|--------|
| **Raw lesson** | The object from bundled JSON via `getLessonById` — no `localStorage` applied. |
| **`effectiveLesson`** | `mergeLessonWithLocalOverrides(lesson, gradeId, subjectId)` in `LessonPlayer.jsx`. This is what the UI should use: it merges **video** and **per-section image** overrides from the browser. **Always derive `sections` and hub content from `effectiveLesson`, not from the raw `lesson`.** |
| **Video approval** | Learners only see an embedded YouTube/Vimeo player if, after merge, `video.approved === true`. Auto-match sets `approved: false` until a human approves (in JSON or via dev overrides). |
| **`/dev/video-review`** | Dev page for **video approval/reject**, **section image URL rows**, and **download/import override backup JSON**. The path name says “video” but the page covers **all** of those. |

---

## Architecture (short)

- **Stack:** Vite + React + React Router; **client-only** (no app database).
- **Lessons:** JSON under `src/data/lessons/{grade}/{subject}.json`, loaded through `import.meta.glob` in `src/data/lessonData.js`.
- **Route for a lesson:** `LessonPage.jsx` at `/grade/:gradeId/:subjectId/:lessonId` → `LessonPlayer.jsx`.

## Data flow

```text
JSON (per grade + subject)
       ↓
lessonData.js  →  import + validateLessonBySubject()
       ↓
LessonPage.jsx
       ↓
LessonPlayer.jsx  →  effectiveLesson = mergeLessonWithLocalOverrides(...)
```

- **`getLessonById(gradeId, subjectId, lessonId)`** — raw lesson from JSON.
- **`mergeLessonWithLocalOverrides`** (`src/utils/lessonMediaOverrides.js`) — adds browser-only:
  - **`lesson.video`** — `url`, `title`, `approved`, etc.
  - **`section.images`** — per section type, keyed in storage (see below).

## Lesson shape (conceptual)

| Area | Role |
|------|------|
| `sections[]` | Blocks: `introduction`, `main_discussion`, `guided_examples`, `key_terms`, etc. |
| `lesson.video` | `{ url, title, keywords, source, approved }` — embed only if **`approved === true`**. |
| `sections[].images[]` | `{ src, alt, caption? }` for the Media Learning Hub “Visual” tab. |
| `activity` | e.g. `matching`, `sequence`, `fill_blank`, `reveal_cards`. |
| `quiz` | Assessment. |

**Validation:** `src/data/lessonValidation.js` (dev bundle-time checks; console warnings).

## Video lifecycle

1. **In repo JSON:** `lesson.video`. Auto-match sets **`approved: false`**.
2. **Learner rule:** Iframe only when **`video.approved === true`** after merge.
3. **Dev review:** Open **`/dev/video-review`** (in dev, or with `VITE_ENABLE_VIDEO_REVIEW=true`). Enable media review, open a lesson, paste URLs, **Approve** / **Reject**. Storage: **`csjs-video-approval-overrides`** (`lessonMediaOverrides.js`).
4. **Approve with a manual URL:** Approval keeps the **effective** URL/title you chose so it is not clobbered by JSON-only logic.

## Section images (overrides)

- **Key format:** `gradeId:subjectId:lessonId:sectionType` (e.g. `main_discussion`).
- **Storage key:** **`csjs-section-image-overrides`**.
- **UI:** Add rows (URL, alt, caption), **Apply** / **Clear** per section type.
- **Player:** Build filtered **`sections` from `effectiveLesson.sections`** so merged images show in the hub.
- **URLs:** Must be `http(s)` for `<img src>` (`normalizeImageEntry`).

## Media Learning Hub

Shown when there is something to show:

- **Visual:** section has `images` after merge.
- **Video:** valid embed URL **and** `approved === true`.

Unapproved video with a URL in data → short **“Video not available for this lesson.”** (no iframe).

## Dev page: backup and restore

On **`/dev/video-review`**:

- **Download backup JSON** — `exportAllLocalOverrides` / `downloadOverridesBackup` (video + section images).
- **Import** — `importLocalOverridesFromObject` into `localStorage`.

Overrides **persist across browser restarts** on the same origin until the user clears site data. They **do not** sync between machines unless you pass a backup file or **edit committed JSON** for production.

## Activities (`ActivitySection` in `LessonPlayer.jsx`)

- **Matching:** Answer options and term rows are **shuffled** (Fisher–Yates) so order does not mirror JSON. Stable until the lesson remounts (`key={lesson.id}`).
- **Sequence:** Initial order is **shuffled** so the list does not start in authored order.

## Events

- **`csjs-lesson-overrides-updated`** — video or image overrides changed; `LessonPlayer` recomputes `effectiveLesson`.
- **`csjs-video-approval-updated`** — legacy alias; still fired for compatibility.

## Key files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Routes; `VideoReviewProvider`. |
| `src/pages/LessonPage.jsx` | Resolves lesson, renders `LessonPlayer`. |
| `src/components/LessonPlayer.jsx` | Sections, hub, activities, quiz, image lightbox. |
| `src/components/LessonMediaReviewPanel.jsx` | Dev video + section image UI. |
| `src/context/VideoReviewContext.jsx` | Review mode + actions writing overrides. |
| `src/utils/lessonMediaOverrides.js` | Merge, keys, export/import. |
| `src/utils/videoEmbed.js` | YouTube/Vimeo → embed URL. |
| `src/data/lessonValidation.js` | Content and media rules. |
| `src/data/lessonData.js` | Loads lesson JSON. |
| `src/pages/DevVideoReviewPage.jsx` | `/dev/video-review` page shell. |

---

**Navigation:** Do not link **`/dev/video-review`** from public learner UI. Gate extra review UI with **`import.meta.env.DEV`** or **`VITE_ENABLE_VIDEO_REVIEW`**.
