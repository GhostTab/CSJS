import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react'
import {
  clearSectionImagesOverride,
  dispatchLessonOverridesUpdated,
  makeLessonVideoKey,
  setLessonVideoOverride,
  setSectionImagesOverride,
} from '../utils/lessonMediaOverrides'
import { getEmbeddableVideoUrl } from '../utils/videoEmbed'

const REVIEW_MODE_KEY = 'csjs-video-review-mode'

function getReviewModeSnapshot() {
  return localStorage.getItem(REVIEW_MODE_KEY) === '1'
}

function subscribeReviewMode(onStoreChange) {
  const onStorage = (e) => {
    if (e.key === REVIEW_MODE_KEY || e.key === null) onStoreChange()
  }
  const onCustom = () => onStoreChange()
  window.addEventListener('storage', onStorage)
  window.addEventListener('csjs-video-review-mode', onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('csjs-video-review-mode', onCustom)
  }
}

const VideoReviewContext = createContext(null)

export function VideoReviewProvider({ children }) {
  const isReviewEnabled =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_VIDEO_REVIEW === 'true'

  const reviewMode = useSyncExternalStore(subscribeReviewMode, getReviewModeSnapshot, () => false)

  const setReviewMode = useCallback((next) => {
    if (next) {
      localStorage.setItem(REVIEW_MODE_KEY, '1')
    } else {
      localStorage.removeItem(REVIEW_MODE_KEY)
    }
    window.dispatchEvent(new CustomEvent('csjs-video-review-mode'))
  }, [])

  /**
   * Persists approval. If `videoSnapshot` includes a URL (e.g. after manual override),
   * it is stored so approval does not revert to the JSON file URL.
   */
  const approveVideo = useCallback((gradeId, subjectId, lessonId, videoSnapshot) => {
    const key = makeLessonVideoKey(gradeId, subjectId, lessonId)
    const url = String(videoSnapshot?.url || '').trim()
    const title = String(videoSnapshot?.title || '').trim()
    if (url) {
      setLessonVideoOverride(key, {
        approved: true,
        url,
        title: title || 'Lesson video',
      })
    } else {
      setLessonVideoOverride(key, { approved: true })
    }
    dispatchLessonOverridesUpdated()
  }, [])

  const rejectVideo = useCallback((gradeId, subjectId, lessonId) => {
    const key = makeLessonVideoKey(gradeId, subjectId, lessonId)
    setLessonVideoOverride(key, { approved: false, url: '', title: '' })
    dispatchLessonOverridesUpdated()
  }, [])

  /** Replace lesson video with a manual URL for local preview (not approved until you click Approve). */
  const applyManualVideoUrl = useCallback((gradeId, subjectId, lessonId, url, title) => {
    const trimmed = String(url || '').trim()
    if (!trimmed || !getEmbeddableVideoUrl(trimmed)) {
      return false
    }
    const key = makeLessonVideoKey(gradeId, subjectId, lessonId)
    setLessonVideoOverride(key, {
      url: trimmed,
      title: String(title || '').trim() || 'Lesson video',
      approved: false,
    })
    dispatchLessonOverridesUpdated()
    return true
  }, [])

  const applySectionImages = useCallback((gradeId, subjectId, lessonId, sectionType, rows) => {
    setSectionImagesOverride(gradeId, subjectId, lessonId, sectionType, rows)
    dispatchLessonOverridesUpdated()
  }, [])

  const clearSectionImages = useCallback((gradeId, subjectId, lessonId, sectionType) => {
    clearSectionImagesOverride(gradeId, subjectId, lessonId, sectionType)
    dispatchLessonOverridesUpdated()
  }, [])

  const value = useMemo(
    () => ({
      isReviewEnabled,
      reviewMode,
      setReviewMode,
      approveVideo,
      rejectVideo,
      applyManualVideoUrl,
      applySectionImages,
      clearSectionImages,
    }),
    [
      isReviewEnabled,
      reviewMode,
      setReviewMode,
      approveVideo,
      rejectVideo,
      applyManualVideoUrl,
      applySectionImages,
      clearSectionImages,
    ],
  )

  return <VideoReviewContext.Provider value={value}>{children}</VideoReviewContext.Provider>
}

export function useVideoReview() {
  const ctx = useContext(VideoReviewContext)
  if (!ctx) {
    throw new Error('useVideoReview must be used within VideoReviewProvider')
  }
  return ctx
}
