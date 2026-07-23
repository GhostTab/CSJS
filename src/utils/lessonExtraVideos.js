import { isPlayableVideoUrl, resolvePlayableVideo } from './videoEmbed'

export const EXTRA_VIDEOS_EVENT = 'csjs-extra-videos-updated'
export const LESSON_VIDEOS_BUCKET = 'lesson-videos'
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024 // 100 MB

const ALLOWED_UPLOAD_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
])

export function dispatchExtraVideosUpdated() {
  window.dispatchEvent(new CustomEvent(EXTRA_VIDEOS_EVENT))
}

export function isValidExtraVideoUrl(url) {
  return isPlayableVideoUrl(String(url || '').trim())
}

function extensionForFile(file) {
  const fromName = String(file?.name || '').split('.').pop()?.toLowerCase()
  if (fromName && ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v'].includes(fromName)) {
    return fromName === 'ogv' ? 'ogg' : fromName
  }
  if (file?.type === 'video/webm') return 'webm'
  if (file?.type === 'video/ogg') return 'ogg'
  if (file?.type === 'video/quicktime') return 'mov'
  return 'mp4'
}

function contentTypeForFile(file) {
  const ext = extensionForFile(file)
  const byExt = {
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
  }
  const mapped = byExt[ext] || 'video/mp4'
  // Windows often reports empty or application/octet-stream — never send those to Storage
  if (!file?.type || file.type === 'application/octet-stream' || file.type === 'binary/octet-stream') {
    return mapped
  }
  if (file.type.startsWith('video/')) return file.type
  return mapped
}

/**
 * @returns {Promise<{ data: Array, error: string|null }>}
 */
export async function fetchExtraVideosForLesson(supabase, gradeId, subjectId, lessonId) {
  if (!supabase) return { data: [], error: null }

  let { data, error } = await supabase
    .from('lesson_extra_videos')
    .select('id, grade_id, subject_id, lesson_id, url, title, created_by, created_at, storage_path, source_type')
    .eq('grade_id', String(gradeId))
    .eq('subject_id', subjectId)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })

  if (error && (error.message?.includes('storage_path') || error.message?.includes('source_type'))) {
    ;({ data, error } = await supabase
      .from('lesson_extra_videos')
      .select('id, grade_id, subject_id, lesson_id, url, title, created_by, created_at')
      .eq('grade_id', String(gradeId))
      .eq('subject_id', subjectId)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true }))
  }

  if (error) return { data: [], error: error.message }
  return { data: data || [], error: null }
}

/**
 * @returns {Promise<{ data: Array, error: string|null }>}
 */
export async function fetchAllExtraVideos(supabase) {
  if (!supabase) return { data: [], error: 'Supabase is not configured' }

  let { data, error } = await supabase
    .from('lesson_extra_videos')
    .select('id, grade_id, subject_id, lesson_id, url, title, created_by, created_at, storage_path, source_type')
    .order('created_at', { ascending: false })

  if (error && (error.message?.includes('storage_path') || error.message?.includes('source_type'))) {
    ;({ data, error } = await supabase
      .from('lesson_extra_videos')
      .select('id, grade_id, subject_id, lesson_id, url, title, created_by, created_at')
      .order('created_at', { ascending: false }))
  }

  if (error) return { data: [], error: error.message }
  return { data: data || [], error: null }
}

/**
 * Upload a local video file to Supabase Storage and return public URL + path.
 */
export async function uploadLessonVideoFile(supabase, file, { gradeId, subjectId, lessonId }) {
  if (!supabase) return { data: null, error: 'Supabase is not configured' }
  if (!file) return { data: null, error: 'Choose a video file from your computer.' }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { data: null, error: 'Video must be 100 MB or smaller.' }
  }

  const typeOk =
    ALLOWED_UPLOAD_TYPES.has(file.type) ||
    !file.type ||
    file.type === 'application/octet-stream' ||
    file.type.startsWith('video/') ||
    /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(file.name || '')
  if (!typeOk) {
    return { data: null, error: 'Use MP4, WebM, OGG, or MOV video files.' }
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError || !session?.access_token) {
    return { data: null, error: 'You must be logged in to upload videos.' }
  }

  const ext = extensionForFile(file)
  const contentType = contentTypeForFile(file)
  const safeLesson = String(lessonId || 'lesson').replace(/[^a-zA-Z0-9_-]/g, '_')
  // Flat path avoids nested-folder edge cases on some Storage configs
  const path = `${gradeId}-${subjectId}-${safeLesson}-${crypto.randomUUID()}.${ext}`
  const blob = new Blob([file], { type: contentType })

  // Prefer SDK upload first
  const { error: uploadError } = await supabase.storage
    .from(LESSON_VIDEOS_BUCKET)
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: true,
      contentType,
    })

  if (uploadError) {
    // Fallback: raw fetch to capture real API error JSON
    const baseUrl = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    let apiDetail = uploadError.message || String(uploadError)

    try {
      const res = await fetch(
        `${baseUrl}/storage/v1/object/${LESSON_VIDEOS_BUCKET}/${path}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: anonKey,
            'Content-Type': contentType,
            'x-upsert': 'true',
          },
          body: blob,
        },
      )
      const text = await res.text()
      let parsed = text
      try {
        parsed = JSON.stringify(JSON.parse(text))
      } catch {
        /* keep raw text */
      }
      if (res.ok) {
        const { data: publicData } = supabase.storage.from(LESSON_VIDEOS_BUCKET).getPublicUrl(path)
        return {
          data: {
            url: publicData.publicUrl,
            storagePath: path,
            sourceType: 'upload',
          },
          error: null,
        }
      }
      apiDetail = `HTTP ${res.status}: ${parsed || res.statusText}`
    } catch (fetchErr) {
      apiDetail = `${apiDetail} | fetch fallback: ${fetchErr.message}`
    }

    let friendly = apiDetail
    if (/Bucket not found|does not exist/i.test(apiDetail)) {
      friendly =
        'Storage bucket "lesson-videos" is missing. Run supabase/schema_lesson_video_storage.sql in the SQL Editor, then try again.'
    } else if (/row-level security|violates|policy|Unauthorized|403|JWT/i.test(apiDetail)) {
      friendly =
        `Permission denied uploading to Storage. Re-run supabase/schema_lesson_video_storage.sql (updated policies). Details: ${apiDetail}`
    } else if (/mime|not supported|content.type/i.test(apiDetail)) {
      friendly =
        `File type rejected (sent as ${contentType}). Re-run the storage SQL so allowed_mime_types is null. Details: ${apiDetail}`
    } else {
      friendly = `Upload failed. ${apiDetail}. If this persists, run supabase/schema_lesson_video_storage.sql then log out/in.`
    }
    return { data: null, error: friendly }
  }

  const { data: publicData } = supabase.storage.from(LESSON_VIDEOS_BUCKET).getPublicUrl(path)
  return {
    data: {
      url: publicData.publicUrl,
      storagePath: path,
      sourceType: 'upload',
    },
    error: null,
  }
}

/**
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function addExtraVideo(supabase, {
  gradeId,
  subjectId,
  lessonId,
  url,
  title,
  userId,
  storagePath = null,
  sourceType = 'link',
}) {
  if (!supabase) return { data: null, error: 'Supabase is not configured' }

  const trimmedUrl = String(url || '').trim()
  if (!isValidExtraVideoUrl(trimmedUrl)) {
    return {
      data: null,
      error: 'Enter a valid YouTube/Vimeo link, or upload an MP4/WebM/MOV file.',
    }
  }

  const payload = {
    grade_id: String(gradeId),
    subject_id: subjectId,
    lesson_id: lessonId,
    url: trimmedUrl,
    title: String(title || '').trim() || 'Additional lesson video',
    created_by: userId || null,
    storage_path: storagePath,
    source_type: sourceType === 'upload' ? 'upload' : 'link',
  }

  const { data, error } = await supabase
    .from('lesson_extra_videos')
    .insert(payload)
    .select('id, grade_id, subject_id, lesson_id, url, title, created_by, created_at, storage_path, source_type')
    .single()

  if (error) {
    // Column may not exist yet on older DB — retry without new columns
    if (error.message?.includes('storage_path') || error.message?.includes('source_type')) {
      const legacy = {
        grade_id: payload.grade_id,
        subject_id: payload.subject_id,
        lesson_id: payload.lesson_id,
        url: payload.url,
        title: payload.title,
        created_by: payload.created_by,
      }
      const retry = await supabase
        .from('lesson_extra_videos')
        .insert(legacy)
        .select('id, grade_id, subject_id, lesson_id, url, title, created_by, created_at')
        .single()
      if (retry.error) return { data: null, error: retry.error.message }
      dispatchExtraVideosUpdated()
      return { data: retry.data, error: null }
    }
    return { data: null, error: error.message }
  }
  dispatchExtraVideosUpdated()
  return { data, error: null }
}

/**
 * Add from a local File: upload to Storage, then insert DB row.
 */
export async function addExtraVideoFromFile(supabase, {
  gradeId,
  subjectId,
  lessonId,
  file,
  title,
  userId,
}) {
  const uploaded = await uploadLessonVideoFile(supabase, file, { gradeId, subjectId, lessonId })
  if (uploaded.error) return { data: null, error: uploaded.error }

  const defaultTitle =
    String(title || '').trim() ||
    String(file?.name || '').replace(/\.[^.]+$/, '') ||
    'Uploaded lesson video'

  return addExtraVideo(supabase, {
    gradeId,
    subjectId,
    lessonId,
    url: uploaded.data.url,
    title: defaultTitle,
    userId,
    storagePath: uploaded.data.storagePath,
    sourceType: 'upload',
  })
}

/**
 * @returns {Promise<{ error: string|null }>}
 */
export async function deleteExtraVideo(supabase, videoId, storagePath = null) {
  if (!supabase) return { error: 'Supabase is not configured' }
  if (!videoId) return { error: 'Missing video id' }

  // Prefer path passed in; otherwise look it up
  let path = storagePath
  if (!path) {
    const { data } = await supabase
      .from('lesson_extra_videos')
      .select('storage_path')
      .eq('id', videoId)
      .maybeSingle()
    path = data?.storage_path || null
  }

  const { error } = await supabase.from('lesson_extra_videos').delete().eq('id', videoId)
  if (error) return { error: error.message }

  if (path) {
    await supabase.storage.from(LESSON_VIDEOS_BUCKET).remove([path])
  }

  dispatchExtraVideosUpdated()
  return { error: null }
}

/**
 * Update title (and optionally URL) of an extra video.
 */
export async function updateExtraVideo(supabase, videoId, { url, title }) {
  if (!supabase) return { data: null, error: 'Supabase is not configured' }

  const patch = {}
  if (title !== undefined) patch.title = String(title || '').trim() || 'Additional lesson video'
  if (url !== undefined) {
    const trimmedUrl = String(url || '').trim()
    if (!isValidExtraVideoUrl(trimmedUrl)) {
      return {
        data: null,
        error: 'Enter a valid YouTube/Vimeo link or direct video file URL.',
      }
    }
    patch.url = trimmedUrl
    patch.source_type = resolvePlayableVideo(trimmedUrl)?.type === 'file' ? 'upload' : 'link'
  }

  const { data, error } = await supabase
    .from('lesson_extra_videos')
    .update(patch)
    .eq('id', videoId)
    .select('id, grade_id, subject_id, lesson_id, url, title, created_by, created_at, storage_path, source_type')
    .single()

  if (error) return { data: null, error: error.message }
  dispatchExtraVideosUpdated()
  return { data, error: null }
}

/** Group extras by lesson key `grade:subject:lesson` */
export function groupExtrasByLessonKey(rows) {
  const map = {}
  for (const row of rows || []) {
    const key = `${row.grade_id}:${row.subject_id}:${row.lesson_id}`
    if (!map[key]) map[key] = []
    map[key].push(row)
  }
  return map
}

export { resolvePlayableVideo, isPlayableVideoUrl }
