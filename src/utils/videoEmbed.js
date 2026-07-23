/**
 * Returns an iframe-safe embed URL for YouTube / Vimeo watch links, or null if unsupported.
 */
export function getEmbeddableVideoUrl(src) {
  if (!src || typeof src !== 'string') return null
  try {
    const url = new URL(src.trim())
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed')) {
        return src.trim()
      }
      const videoId = url.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    if (url.hostname === 'youtu.be') {
      const videoId = url.pathname.replace(/^\//, '').split('/')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    if (url.hostname.includes('vimeo.com')) {
      const videoId = url.pathname.split('/').filter(Boolean).pop()
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null
    }
  } catch {
    return null
  }
  return null
}

const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i

/**
 * True for direct video file URLs (uploaded files, CDN, Supabase Storage).
 */
export function isDirectVideoFileUrl(src) {
  if (!src || typeof src !== 'string') return false
  try {
    const url = new URL(src.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (VIDEO_EXT_RE.test(url.pathname)) return true
    // Supabase public storage objects for our lesson-videos bucket
    if (
      url.pathname.includes('/storage/v1/object/public/lesson-videos/') ||
      url.pathname.includes('/storage/v1/object/sign/lesson-videos/')
    ) {
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * @returns {{ type: 'embed'|'file', src: string } | null}
 */
export function resolvePlayableVideo(src) {
  const embed = getEmbeddableVideoUrl(src)
  if (embed) return { type: 'embed', src: embed }
  if (isDirectVideoFileUrl(src)) return { type: 'file', src: String(src).trim() }
  return null
}

export function isPlayableVideoUrl(src) {
  return Boolean(resolvePlayableVideo(src))
}
