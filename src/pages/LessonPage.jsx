import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import LessonPlayer from '../components/LessonPlayer'
import { getLessonsByGradeAndSubject, getLessonById } from '../data/lessonData'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { upsertLessonQuizAttempt } from '../utils/quizRanking'

export default function LessonPage() {
  const { gradeId, subjectId, lessonId } = useParams()
  const { completeLesson, saveQuizScore } = useProgress()
  const { user, isAuthenticated } = useAuth()
  const [rankingNotice, setRankingNotice] = useState(null)

  const lessonsCollection = getLessonsByGradeAndSubject(gradeId, subjectId)
  const lesson = getLessonById(gradeId, subjectId, lessonId)

  useEffect(() => {
    if (gradeId) {
      localStorage.setItem('csjs-last-grade', gradeId)
    }
  }, [gradeId])

  useEffect(() => {
    setRankingNotice(null)
  }, [lessonId])

  if (!lessonsCollection) {
    return <Navigate to={`/grade/${gradeId}/${subjectId}`} replace />
  }

  if (!lesson) {
    return (
      <div className="lesson-layout lesson-shell-bg min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="lesson-panel lesson-accent-top p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Lesson content is not available yet</h1>
            <p className="mt-2 text-slate-600">
              The selected lesson does not have complete subject-specific content yet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const lessonIndex = lessonsCollection.lessons.findIndex(l => l.id === lessonId)
  const prevLesson = lessonsCollection.lessons[lessonIndex - 1]
  const nextLesson = lessonsCollection.lessons[lessonIndex + 1]

  const handleComplete = (score) => {
    completeLesson(lessonId, score)
  }

  const handleQuizComplete = async (score, total) => {
    saveQuizScore(lessonId, score, total)

    if (!isAuthenticated || !user) {
      setRankingNotice('guest')
      return
    }

    const result = await upsertLessonQuizAttempt(supabase, {
      userId: user.id,
      lessonId,
      gradeId,
      subjectId,
      score,
      total,
    })

    if (result.ok) {
      setRankingNotice('synced')
    } else if (!result.skipped) {
      setRankingNotice('error')
    } else {
      setRankingNotice('synced')
    }
  }

  return (
    <div className="lesson-layout lesson-shell-bg min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        {rankingNotice === 'guest' && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Score saved on this device. <strong>Log in</strong> to appear on the student rankings
              (lesson quizzes only).
            </p>
            <Link
              to="/login"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          </div>
        )}
        {rankingNotice === 'synced' && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Lesson quiz points saved to rankings.{' '}
            <Link to="/rankings" className="font-semibold underline">
              View rankings
            </Link>
          </div>
        )}
        {rankingNotice === 'error' && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Could not sync this score to rankings. Your local progress is still saved.
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <LessonPlayer
            lesson={lesson}
            gradeId={gradeId}
            subjectId={subjectId}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            lessonIndex={lessonIndex}
            totalLessons={lessonsCollection.lessons.length}
            onComplete={handleComplete}
            onQuizComplete={handleQuizComplete}
          />
        </motion.div>
      </div>
    </div>
  )
}
