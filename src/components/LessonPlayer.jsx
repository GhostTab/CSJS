import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  ChevronRight,
  Sparkles,
  Lightbulb,
  PenTool,
  Image as ImageIcon,
  Video,
  X,
} from 'lucide-react'
import AnimatedConcept from './AnimatedConcept'
import Quiz from './Quiz'
import { useProgress } from '../context/ProgressContext'
import { useVideoReview } from '../context/VideoReviewContext'
import { getLessonTeachingContentErrors } from '../data/lessonValidation'
import LessonMediaReviewPanel from './LessonMediaReviewPanel'
import {
  isVideoApprovedForDisplay,
  LESSON_OVERRIDES_EVENT,
  mergeLessonWithLocalOverrides,
} from '../utils/lessonMediaOverrides'
import { getEmbeddableVideoUrl } from '../utils/videoEmbed'

const sectionIcons = {
  'introduction': BookOpen,
  'main_discussion': Lightbulb,
  'animated_explanation': Lightbulb,
  'guided_examples': BookOpen,
  'visual_examples': BookOpen,
  'key_terms': PenTool,
  'summary': Sparkles,
}

const essentialSectionTypes = new Set([
  'main_discussion',
  'guided_examples',
  'key_terms',
])

function getContentParagraphs(content) {
  return String(content || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

/** Fisher–Yates shuffle (new array). */
function shuffleArray(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function LessonImageBlock({ images = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  useEffect(() => {
    if (expandedIndex === null) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setExpandedIndex(null)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [expandedIndex])

  if (!Array.isArray(images) || images.length === 0) return null

  const expanded = expandedIndex !== null ? images[expandedIndex] : null

  return (
    <>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ImageIcon className="h-4 w-4 text-blue-600" />
          Visual Learning Materials
        </h4>
        <p className="text-xs text-slate-500">Click an image to expand.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <figure
              key={`${image.src}-${index}`}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:ring-2 hover:ring-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <button
                type="button"
                className="group block w-full cursor-zoom-in text-left"
                onClick={() => setExpandedIndex(index)}
                aria-label={`Expand image: ${image.alt || 'lesson image'}`}
              >
                <img
                  src={image.src}
                  alt={image.alt || ''}
                  className="h-40 w-full object-cover transition group-hover:opacity-95"
                  loading="lazy"
                />
              </button>
              {image.caption && (
                <figcaption className="p-3 text-xs text-slate-600">{image.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded image"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpandedIndex(null)}
          >
            <motion.button
              type="button"
              className="absolute right-4 top-4 z-[101] rounded-full bg-white/15 p-2.5 text-white ring-1 ring-white/30 transition hover:bg-white/25"
              aria-label="Close expanded image"
              onClick={(e) => {
                e.stopPropagation()
                setExpandedIndex(null)
              }}
            >
              <X className="h-6 w-6" />
            </motion.button>
            <motion.div
              className="flex max-h-[92vh] max-w-[min(96vw,1200px)] flex-col items-center justify-center"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={expanded.src}
                alt={expanded.alt || ''}
                className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
              {expanded.caption && (
                <p className="mt-4 max-w-2xl text-center text-sm text-white/95">{expanded.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function LessonVideoBlock({ lesson }) {
  const videoUrl = lesson?.video?.url
  if (!videoUrl) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Video className="h-4 w-4 text-blue-600" />
          Educational Video
        </h4>
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
          No lesson-specific video available yet.
        </p>
      </div>
    )
  }

  const embeddableUrl = getEmbeddableVideoUrl(videoUrl)
  if (!embeddableUrl) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Video className="h-4 w-4 text-blue-600" />
          Educational Video
        </h4>
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
          No lesson-specific video available yet.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Video className="h-4 w-4 text-blue-600" />
        Educational Video
      </h4>
      <iframe
        src={embeddableUrl}
        title={lesson?.video?.title || 'Lesson video'}
        className="h-64 w-full rounded-lg border border-slate-200 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function MediaLearningHub({ displayLesson, section }) {
  const images = Array.isArray(section?.images) ? section.images : []
  const hasImages = images.length > 0
  const videoSrc = displayLesson?.video?.url
  const hasStudentVideo =
    Boolean(videoSrc && getEmbeddableVideoUrl(videoSrc)) &&
    isVideoApprovedForDisplay(displayLesson.video)

  if (!hasImages && !hasStudentVideo) {
    return null
  }

  const availableTabs = [
    hasImages ? 'visual' : null,
    hasStudentVideo ? 'video' : null,
  ].filter(Boolean)

  const defaultTab = availableTabs[0] || 'visual'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const resolvedTab = availableTabs.includes(activeTab) ? activeTab : defaultTab

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800">Media Learning Hub</h4>
        <div className="flex items-center gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-1 ${hasImages ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            Visual
          </span>
          <span className={`rounded-full px-2.5 py-1 ${hasStudentVideo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            Video
          </span>
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
        {[
          { id: 'visual', label: 'Visual' },
          { id: 'video', label: 'Video' },
        ].map((tab) => {
          const enabled =
            (tab.id === 'visual' && hasImages) ||
            (tab.id === 'video' && hasStudentVideo)
          return (
          <button
            key={tab.id}
            onClick={() => enabled && setActiveTab(tab.id)}
            disabled={!enabled}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              resolvedTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : enabled
                ? 'text-slate-600 hover:text-slate-800'
                : 'cursor-not-allowed text-slate-400'
            }`}
          >
            {tab.label}
          </button>
          )
        })}
      </div>

      <div className="min-h-[120px]">
        {resolvedTab === 'visual' && <LessonImageBlock images={images} />}
        {resolvedTab === 'video' && <LessonVideoBlock lesson={displayLesson} />}
      </div>
    </div>
  )
}

export default function LessonPlayer({ 
  lesson, 
  gradeId, 
  subjectId, 
  prevLesson, 
  nextLesson, 
  lessonIndex, 
  totalLessons,
  onComplete,
  onQuizComplete
}) {
  const [activeSection, setActiveSection] = useState(0)
  const [showActivity, setShowActivity] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [completedLessonId, setCompletedLessonId] = useState(null)
  const { getLessonProgress } = useProgress()
  const {
    isReviewEnabled,
    reviewMode,
    approveVideo,
    rejectVideo,
    applyManualVideoUrl,
    applySectionImages,
    clearSectionImages,
  } = useVideoReview()
  const [approvalEpoch, setApprovalEpoch] = useState(0)

  useEffect(() => {
    const bump = () => setApprovalEpoch((n) => n + 1)
    window.addEventListener(LESSON_OVERRIDES_EVENT, bump)
    return () => window.removeEventListener(LESSON_OVERRIDES_EVENT, bump)
  }, [])

  const effectiveLesson = useMemo(
    () => mergeLessonWithLocalOverrides(lesson, gradeId, subjectId),
    [lesson, gradeId, subjectId, approvalEpoch],
  )

  /** Must use merged lesson so local image/video overrides appear in the hub and steps. */
  const sections = (effectiveLesson.sections || []).filter((section) =>
    essentialSectionTypes.has(section.type),
  )
  const lessonContentIssues = getLessonTeachingContentErrors(effectiveLesson)

  const fileVideoUrl = String(lesson?.video?.url || '').trim()
  const fileHasEmbeddableVideo = Boolean(fileVideoUrl && getEmbeddableVideoUrl(fileVideoUrl))
  const showVideoUnavailableMessage =
    fileHasEmbeddableVideo &&
    !isVideoApprovedForDisplay(effectiveLesson.video) &&
    !(isReviewEnabled && reviewMode)
  const hasCompleteLessonContent = lessonContentIssues.length === 0
  const lessonCompleted = completedLessonId === lesson.id || getLessonProgress(lesson.id)
  const totalSteps = Math.max(sections.length + (hasCompleteLessonContent ? 2 : 0), 1)
  const currentStep = Math.min(
    activeSection + (showActivity ? 1 : 0) + (showQuiz ? 1 : 0) + 1,
    totalSteps,
  )
  const progress = Math.round((currentStep / totalSteps) * 100)

  console.log('[lesson-video-debug]', {
    grade: gradeId,
    subject: subjectId,
    lessonId: lesson?.id,
    lessonTitle: lesson?.title,
    videoUrl: lesson?.video?.url || '',
    approvedFile: lesson?.video?.approved,
    approvedEffective: effectiveLesson?.video?.approved,
  })

  const handleNext = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection(prev => prev + 1)
    } else if (!showActivity && hasCompleteLessonContent) {
      setShowActivity(true)
    } else if (!showQuiz && hasCompleteLessonContent) {
      setShowQuiz(true)
    }
  }

  const handlePrev = () => {
    if (showQuiz) {
      setShowQuiz(false)
    } else if (showActivity) {
      setShowActivity(false)
    } else if (activeSection > 0) {
      setActiveSection(prev => prev - 1)
    }
  }

  const handleQuizFinish = (score, total) => {
    onQuizComplete(score, total)
    setCompletedLessonId(lesson.id)
    onComplete(score)
  }

  const isFirstStep = activeSection === 0 && !showActivity && !showQuiz
  const isLastStep = showQuiz || (!hasCompleteLessonContent && activeSection >= sections.length - 1)

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="glass-card-strong rounded-2xl p-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Link to={`/grade/${gradeId}`} className="text-slate-500 hover:text-blue-600">
            Grade {gradeId}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <Link to={`/grade/${gradeId}/${subjectId}`} className="text-slate-500 hover:text-blue-600 capitalize">
            {subjectId}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-800">Lesson {lessonIndex + 1}</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{lesson.title}</h1>
            <p className="mt-2 text-slate-600">{lesson.description}</p>
            
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                <BookOpen className="h-3.5 w-3.5" />
                Lesson {lessonIndex + 1} of {totalLessons}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <Clock className="h-3.5 w-3.5" />
                {lesson.estimatedTime}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                lesson.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                lesson.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                {lesson.difficulty}
              </span>
              {lessonCompleted && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${progress} 100` }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column - Content */}
        <div className="space-y-4">
          {isReviewEnabled && reviewMode && (
            <LessonMediaReviewPanel
              lessonStableKey={`${gradeId}-${subjectId}-${lesson.id}`}
              gradeId={gradeId}
              subjectId={subjectId}
              lessonId={lesson.id}
              effectiveLesson={effectiveLesson}
              onApproveVideo={() => approveVideo(gradeId, subjectId, lesson.id, effectiveLesson.video)}
              onRejectVideo={() => rejectVideo(gradeId, subjectId, lesson.id)}
              onApplyManualVideo={(url, title) => applyManualVideoUrl(gradeId, subjectId, lesson.id, url, title)}
              onApplySectionImages={applySectionImages}
              onClearSectionImages={clearSectionImages}
            />
          )}
          <AnimatePresence mode="wait">
            {!showActivity && !showQuiz && (
              <motion.div
                key={`section-${activeSection}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-2xl p-6"
              >
                {/* Section Content */}
                {sections[activeSection] && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      {(() => {
                        const Icon = sectionIcons[sections[activeSection].type] || BookOpen
                        return <Icon className="h-5 w-5 text-violet-500" />
                      })()}
                      <h3 className="text-lg font-bold text-slate-800">
                        {sections[activeSection].heading}
                      </h3>
                    </div>
                    
                    {sections[activeSection].content && (
                      <div className="mb-4 space-y-3">
                        {getContentParagraphs(sections[activeSection].content).map((paragraph, i) => (
                          <p key={i} className="text-slate-700 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}

                    {sections[activeSection].animation && (
                      <div className="mb-4">
                        <AnimatedConcept
                          type={sections[activeSection].animation}
                          labels={sections[activeSection].animationLabels || []}
                        />
                      </div>
                    )}

                    {sections[activeSection].terms && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {sections[activeSection].terms.map((term, i) => (
                          <div key={i} className="rounded-xl bg-slate-50 p-4">
                            <h4 className="font-bold text-slate-800">{term.word}</h4>
                            <p className="mt-1 text-sm text-slate-600">{term.meaning}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {sections[activeSection].items && (
                      <ul className="space-y-2">
                        {sections[activeSection].items.map((item, i) => (
                          <li key={i} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-slate-700">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                              {i + 1}
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    <MediaLearningHub
                      key={`${lesson.id}-${activeSection}`}
                      displayLesson={effectiveLesson}
                      section={sections[activeSection]}
                    />

                    {showVideoUnavailableMessage && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Video not available for this lesson.
                      </div>
                    )}

                    {!hasCompleteLessonContent && activeSection >= sections.length - 1 && (
                      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                        <h4 className="font-bold">Lesson content incomplete</h4>
                        <p className="mt-1 text-sm">
                          Activity and quiz are locked until the main discussion has real teaching content.
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                          {lessonContentIssues.map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Activity Section */}
            {hasCompleteLessonContent && showActivity && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-6"
              >
                <ActivitySection key={lesson.id} activity={lesson.activity} />
              </motion.div>
            )}

            {/* Quiz Section */}
            {hasCompleteLessonContent && showQuiz && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-6"
              >
                <Quiz 
                  questions={lesson.quiz} 
                  onFinish={handleQuizFinish}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            {!isLastStep ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                {showActivity ? 'Start Quiz' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to={nextLesson ? `/grade/${gradeId}/${subjectId}/${nextLesson.id}` : `/grade/${gradeId}/${subjectId}`}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                {nextLesson ? (
                  <>
                    Next Lesson
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Finish
                  </>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Lesson Navigation */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
              Lesson Steps
            </h4>
            <div className="space-y-2">
              {sections.map((section, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveSection(i)
                    setShowActivity(false)
                    setShowQuiz(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-all ${
                    i === activeSection && !showActivity && !showQuiz
                      ? 'bg-blue-50 text-blue-700'
                      : i < activeSection || showActivity || showQuiz
                      ? 'text-slate-600 hover:bg-slate-50'
                      : 'text-slate-400'
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i < activeSection || showActivity || showQuiz
                      ? 'bg-emerald-100 text-emerald-600'
                      : i === activeSection && !showActivity && !showQuiz
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {i < activeSection || showActivity || showQuiz ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="line-clamp-1">{section.heading}</span>
                </button>
              ))}
              
              {hasCompleteLessonContent ? (
                <>
                  <button
                    onClick={() => {
                      setActiveSection(sections.length - 1)
                      setShowActivity(true)
                      setShowQuiz(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-all ${
                      showActivity
                        ? 'bg-blue-50 text-blue-700'
                        : sections.length <= activeSection + 1
                        ? 'text-slate-600 hover:bg-slate-50'
                        : 'text-slate-400'
                    }`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      showQuiz ? 'bg-emerald-100 text-emerald-600' : showActivity ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showQuiz ? <CheckCircle2 className="h-4 w-4" /> : sections.length + 1}
                    </div>
                    <span>Interactive Activity</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveSection(sections.length - 1)
                      setShowActivity(true)
                      setShowQuiz(true)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-all ${
                      showQuiz
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-400'
                    }`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      showQuiz ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {sections.length + 2}
                    </div>
                    <span>Quiz</span>
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Add real teaching content before Activity and Quiz unlock.
                </div>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              Quick Navigation
            </h4>
            <div className="space-y-2">
              {prevLesson && (
                <Link
                  to={`/grade/${gradeId}/${subjectId}/${prevLesson.id}`}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="line-clamp-1">Previous: {prevLesson.title}</span>
                </Link>
              )}
              {nextLesson && (
                <Link
                  to={`/grade/${gradeId}/${subjectId}/${nextLesson.id}`}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <span className="line-clamp-1">Next: {nextLesson.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                to={`/grade/${gradeId}/${subjectId}`}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 transition-colors hover:bg-slate-100"
              >
                <BookOpen className="h-4 w-4" />
                <span>Back to Lessons</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivitySection({ activity }) {
  const [state, setState] = useState({})

  const matchingShuffleKey =
    activity?.type === 'matching'
      ? JSON.stringify(activity.items.map((i) => [i.term, i.answer]))
      : ''

  const shuffledMatchingAnswers = useMemo(() => {
    if (activity?.type !== 'matching') return []
    const unique = [...new Set(activity.items.map((i) => i.answer))]
    return shuffleArray(unique)
  }, [matchingShuffleKey])

  const shuffledMatchingItems = useMemo(() => {
    if (activity?.type !== 'matching') return []
    return shuffleArray([...activity.items])
  }, [matchingShuffleKey])

  const [sequenceItems, setSequenceItems] = useState(() =>
    activity?.type === 'sequence' ? shuffleArray([...(activity.items || [])]) : activity?.items || [],
  )

  if (!activity) {
    return (
      <div className="rounded-xl bg-slate-50 p-6 text-center">
        <p className="text-slate-600">This activity is not available yet.</p>
      </div>
    )
  }

  if (activity.type === 'matching') {
    const allMatched = activity.items.every(item => state[item.term])
    const allCorrect = activity.items.every(item => state[item.term] === item.answer)

    return (
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-800">Interactive Activity</h3>
        <p className="mb-6 text-slate-600">{activity.instruction}</p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {shuffledMatchingItems.map((item) => (
            <div key={item.term} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 font-semibold text-slate-800">{item.term}</p>
              <select
                value={state[item.term] || ''}
                onChange={(e) => setState(prev => ({ ...prev, [item.term]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select answer...</option>
                {shuffledMatchingAnswers.map((ans) => (
                  <option key={ans} value={ans}>{ans}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {allMatched && (
          <div className={`mt-6 rounded-xl p-4 ${allCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            <p className="font-semibold">
              {allCorrect ? 'Perfect! All matches are correct.' : 'Some answers need another look. Try again.'}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (activity.type === 'sequence') {
    const move = (index, direction) => {
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= sequenceItems.length) return
      const newItems = [...sequenceItems]
      ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
      setSequenceItems(newItems)
    }

    const isCorrect = JSON.stringify(sequenceItems) === JSON.stringify(activity.correctOrder)

    return (
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-800">Arrange in Order</h3>
        <p className="mb-6 text-slate-600">{activity.instruction}</p>
        
        <div className="space-y-2">
          {sequenceItems.map((item, i) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-white p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-600">
                {i + 1}
              </div>
              <span className="flex-1 font-medium text-slate-700">{item}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === sequenceItems.length - 1}
                  className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-40"
                >
                  Down
                </button>
              </div>
            </div>
          ))}
        </div>

        {isCorrect && (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-700">
            <p className="font-semibold">Correct order. Well done!</p>
          </div>
        )}
      </div>
    )
  }

  if (activity.type === 'fill_blank') {
    const correct = state.answer?.toLowerCase().trim() === activity.answer.toLowerCase()

    return (
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-800">Fill in the Blank</h3>
        <p className="mb-6 text-slate-600">{activity.instruction}</p>
        
        <div className="rounded-xl bg-white p-4">
          <input
            type="text"
            value={state.answer || ''}
            onChange={(e) => setState({ answer: e.target.value })}
            placeholder="Type your answer..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
          />
          
          {state.answer && (
            <div className={`mt-4 rounded-lg p-3 ${correct ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <p className="font-semibold">
                {correct ? 'Correct!' : 'Not quite right. Try again!'}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (activity.type === 'reveal_cards') {
    return (
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-800">Click to Reveal</h3>
        <p className="mb-6 text-slate-600">{activity.instruction}</p>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {activity.items.map((item, i) => (
            <button
              key={i}
              onClick={() => setState(prev => ({ ...prev, [i]: !prev[i] }))}
              className="rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300"
            >
              <p className="font-semibold text-slate-800">{item.prompt}</p>
              {state[i] && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-slate-600"
                >
                  {item.answer}
                </motion.p>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-slate-50 p-6 text-center">
      <p className="text-slate-600">Activity coming soon!</p>
    </div>
  )
}

