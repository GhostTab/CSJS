# CSJS Learn — developer flow

This document describes how the **Multimedia Animation Learning System** is wired for developers: where data lives, how it moves through the app, and how local-only curation (video + images) works without a backend.

## 1. High-level architecture

- **Stack:** Vite + React + React Router; client-only (no app database).
- **Lesson content:** JSON files under `src/data/lessons/{grade}/{subject}.json`, bundled at build time via `import.meta.glob` in `src/data/lessonData.js`.
- **Persistence for learners:** `ProgressContext` uses **localStorage** for completion/quiz progress (not described in detail here).
- **Persistence for content curation (devs):** video and section image overrides also use **localStorage**, with optional **JSON file export/import** so work is not lost when switching machines or clearing one browser’s data.

## 2. Data loading path

```text
JSON collections (per grade + subject)
       ↓
lessonData.js  →  eager import + validateLessonBySubject()
       ↓
LessonPage.jsx (route: /grade/:gradeId/:subjectId/:lessonId)
       ↓
LessonPlayer.jsx  ← merges local overrides into “effective” lesson
```

- **`getLessonById(gradeId, subjectId, lessonId)`** returns the lesson object from bundled JSON.
- **`mergeLessonWithLocalOverrides(lesson, gradeId, subjectId)`** (`src/utils/lessonMediaOverrides.js`) overlays **browser-only** edits:
  - **`lesson.video`** — URL, title, `approved` flag from video overrides.
  - **`section.images`** — per section type, from section image overrides.

The player UI (steps, Media Learning Hub, validation for unlocking activity/quiz) uses **`effectiveLesson`**, not the raw JSON lesson, so overrides affect layout and teaching validation consistently.

## 3. Lesson shape (conceptual)

Each lesson typically includes:

| Area | Role |
|------|------|
| `sections[]` | Ordered blocks (`introduction`, `main_discussion`, `guided_examples`, `key_terms`, etc.). |
| `lesson.video` | `{ url, title, keywords, source, approved }` — student-facing embed only if **`approved === true`**. |
| `sections[].images[]` | `{ src, alt, caption? }` for the Media Learning Hub “Visual” tab. |
| `activity` | Interactive step (`matching`, `sequence`, `fill_blank`, `reveal_cards`, …). |
| `quiz` | Assessment items. |

Structural and quality checks live in **`src/data/lessonValidation.js`** (runs at bundle time in dev; warnings in console).

## 4. Video lifecycle

1. **Source of truth in repo:** `lesson.video` in JSON. Auto-match sets **`approved: false`** (`scripts/autoMatchLessonVideos.mjs`).
2. **Student rule:** iframe is shown only when **`video.approved === true`** after merge (including local overrides).
3. **Dev review:** Hidden route **`/dev/video-review`** (enabled in dev or when `VITE_ENABLE_VIDEO_REVIEW=true`). Toggle “Enable media review”, then open a lesson:
   - Paste manual YouTube/Vimeo URLs, preview, **Approve video** / **Reject**.
   - Overrides are stored under key **`csjs-video-approval-overrides`** in localStorage (see `lessonMediaOverrides.js`).
4. **Approve with manual URL:** Approval persists the **effective** URL/title so the chosen link is not overwritten by JSON-only approval logic.

## 5. Section images (local overrides)

- Overrides are keyed by **`gradeId:subjectId:lessonId:sectionType`** (e.g. `main_discussion`).
- Storage key: **`csjs-section-image-overrides`**.
- Review UI lets devs add rows (**URL, alt, caption**) and **Apply** / **Clear override** for a chosen section type.
- **`LessonPlayer`** builds filtered **`sections`** from **`effectiveLesson.sections`**, so merged images appear in the Media Learning Hub for the matching step.

Images must be **`http(s)`** URLs suitable for `<img src>` (see `normalizeImageEntry` in `lessonMediaOverrides.js`).

## 6. Media Learning Hub (`LessonPlayer.jsx`)

Rendered only when there is something to show:

- **Visual:** section has non-empty `images` after merge.
- **Video:** embeddable URL exists **and** `approved === true`.

Unapproved video with a URL in data → learners may see a short **“Video not available for this lesson.”** message (no iframe).

## 7. Backup / restore (no database)

On **`/dev/video-review`**:

- **Download backup JSON** — saves video + section-image overrides (see `exportAllLocalOverrides`, `downloadOverridesBackup`).
- **Import backup JSON** — restores into localStorage (`importLocalOverridesFromObject`).

**Note:** Override data **survives closing the browser** on the same origin/profile unless the user clears site data. It does **not** sync across devices unless you share a backup file or commit changes into **`src/data/lessons/**/*.json`** for production.

## 8. Interactive activities (`ActivitySection` in `LessonPlayer.jsx`)

- **Matching:** Unique answers and term rows are **shuffled** (Fisher–Yates) so dropdown order does not mirror the JSON. Shuffle is stable for a given activity payload until the lesson remounts (`key={lesson.id}`).
- **Sequence:** Initial item order is **shuffled** so the list does not start in the authored correct order.

## 9. Useful npm scripts

| Script | Purpose |
|--------|---------|
| `npm run videos:auto-match` | Runs `scripts/autoMatchLessonVideos.mjs` — YouTube search + scoring; writes `lesson.video`, sets **`approved: false`**. |
| `npm run images:auto-match` | `scripts/autoMatchLessonImages.mjs` — image pipeline for lesson data (see script for scope). |
| `node scripts/migrateVideoApproved.mjs` | One-time migration helper for `lesson.video.approved` if you add new lesson files by hand. |

## 10. Key files (quick reference)

| File | Purpose |
|------|---------|
| `src/App.jsx` | Routes; wraps app with `VideoReviewProvider`. |
| `src/pages/LessonPage.jsx` | Resolves lesson from `lessonData`, renders `LessonPlayer`. |
| `src/components/LessonPlayer.jsx` | Lesson UX: sections, hub, activities, quiz, image lightbox. |
| `src/components/LessonMediaReviewPanel.jsx` | Dev video + section image override UI. |
| `src/context/VideoReviewContext.jsx` | Review mode flag + actions that write overrides and dispatch events. |
| `src/utils/lessonMediaOverrides.js` | Merge logic, localStorage keys, export/import. |
| `src/utils/videoEmbed.js` | YouTube/Vimeo → embed URL for iframes. |
| `src/data/lessonValidation.js` | Teaching content, video, quiz rules. |
| `src/data/lessonData.js` | Loads all lesson JSON. |
| `docs/DEVELOPER_FLOW.md` | This document. |

## 11. Events

- **`csjs-lesson-overrides-updated`** — fired when video or image overrides change; `LessonPlayer` bumps an epoch so `effectiveLesson` recomputes.
- **`csjs-video-approval-updated`** — still emitted for compatibility (same hook path).

---

For product-facing behavior (students vs dev tools), keep **`/dev/video-review`** unlinked from public navigation; gate extra Review UI with **`import.meta.env.DEV`** or **`VITE_ENABLE_VIDEO_REVIEW`**.
