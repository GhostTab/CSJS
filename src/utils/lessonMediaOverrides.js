/** Video overrides — keep legacy storage key so existing sessions keep working. */
export const VIDEO_OVERRIDES_KEY = 'csjs-video-approval-overrides'
export const SECTION_IMAGES_OVERRIDES_KEY = 'csjs-section-image-overrides'

/** Same event bumps LessonPlayer merge for video + images. */
export const LESSON_OVERRIDES_EVENT = 'csjs-lesson-overrides-updated'

/**
 * @returns {Record<string, { approved?: boolean, url?: string, title?: string }>}
 */
export function readVideoOverrides() {
  try {
    const raw = localStorage.getItem(VIDEO_OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * @returns {Record<string, { images: Array<{ src: string, alt: string, caption?: string }> }>}
 */
export function readSectionImageOverrides() {
  try {
    const raw = localStorage.getItem(SECTION_IMAGES_OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function setLessonVideoOverride(lessonKey, data) {
  const current = readVideoOverrides()
  const next = { ...current, [lessonKey]: data }
  localStorage.setItem(VIDEO_OVERRIDES_KEY, JSON.stringify(next))
}

export function makeLessonVideoKey(gradeId, subjectId, lessonId) {
  return `${gradeId}:${subjectId}:${lessonId}`
}

export function makeSectionImagesKey(gradeId, subjectId, lessonId, sectionType) {
  return `${gradeId}:${subjectId}:${lessonId}:${sectionType}`
}

export function normalizeImageEntry(row) {
  const src = String(row?.src || '').trim()
  if (!src || !/^https?:\/\//i.test(src)) return null
  return {
    src,
    alt: String(row?.alt || 'Lesson image').trim() || 'Lesson image',
    caption: String(row?.caption || '').trim(),
  }
}

export function setSectionImagesOverride(gradeId, subjectId, lessonId, sectionType, imageRows) {
  const key = makeSectionImagesKey(gradeId, subjectId, lessonId, sectionType)
  const images = (Array.isArray(imageRows) ? imageRows : [])
    .map((row) => normalizeImageEntry(row))
    .filter(Boolean)
  const current = readSectionImageOverrides()
  const next = { ...current }
  if (images.length === 0) {
    delete next[key]
  } else {
    next[key] = { images }
  }
  localStorage.setItem(SECTION_IMAGES_OVERRIDES_KEY, JSON.stringify(next))
}

export function clearSectionImagesOverride(gradeId, subjectId, lessonId, sectionType) {
  const key = makeSectionImagesKey(gradeId, subjectId, lessonId, sectionType)
  const current = readSectionImageOverrides()
  if (!(key in current)) return
  const next = { ...current }
  delete next[key]
  localStorage.setItem(SECTION_IMAGES_OVERRIDES_KEY, JSON.stringify(next))
}

/**
 * Merges video overrides from localStorage.
 */
export function mergeLessonVideo(lesson, gradeId, subjectId) {
  if (!lesson || typeof lesson !== 'object') return lesson
  const baseVideo = lesson.video && typeof lesson.video === 'object' ? { ...lesson.video } : {}
  const key = makeLessonVideoKey(gradeId, subjectId, lesson.id)
  const overrides = readVideoOverrides()[key]
  if (!overrides) {
    return { ...lesson, video: { ...baseVideo } }
  }
  return { ...lesson, video: { ...baseVideo, ...overrides } }
}

/**
 * Merges video + per-section image overrides (browser-only).
 */
export function mergeLessonWithLocalOverrides(lesson, gradeId, subjectId) {
  const withVideo = mergeLessonVideo(lesson, gradeId, subjectId)
  const imageMap = readSectionImageOverrides()
  const sections = (withVideo.sections || []).map((section) => {
    const k = makeSectionImagesKey(gradeId, subjectId, lesson.id, section.type)
    const o = imageMap[k]
    if (o && Array.isArray(o.images) && o.images.length > 0) {
      return { ...section, images: o.images }
    }
    return section
  })
  return { ...withVideo, sections }
}

export function isVideoApprovedForDisplay(video) {
  return video?.approved === true
}

export function dispatchLessonOverridesUpdated() {
  window.dispatchEvent(new CustomEvent(LESSON_OVERRIDES_EVENT))
  window.dispatchEvent(new CustomEvent('csjs-video-approval-updated'))
}

/** Alias */
export const readVideoApprovalOverrides = readVideoOverrides

/** Backup / restore (no server — devs keep this file). */
export function exportAllLocalOverrides() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    video: readVideoOverrides(),
    sectionImages: readSectionImageOverrides(),
  }
}

export function importLocalOverridesFromObject(data) {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Invalid file' }
  const hasVideo = data.video && typeof data.video === 'object'
  const hasImages = data.sectionImages && typeof data.sectionImages === 'object'
  if (!hasVideo && !hasImages) {
    return { ok: false, error: 'File must include video and/or sectionImages' }
  }
  if (hasVideo) {
    localStorage.setItem(VIDEO_OVERRIDES_KEY, JSON.stringify(data.video))
  }
  if (hasImages) {
    localStorage.setItem(SECTION_IMAGES_OVERRIDES_KEY, JSON.stringify(data.sectionImages))
  }
  dispatchLessonOverridesUpdated()
  return { ok: true }
}

export function downloadOverridesBackup() {
  const payload = exportAllLocalOverrides()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `csjs-lesson-overrides-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
