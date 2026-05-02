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
