import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Navigate } from 'react-router-dom'
import LessonPlayer from '../components/LessonPlayer'
import { getLessonsByGradeAndSubject, getLessonById } from '../data/lessonData'
import { useProgress } from '../context/ProgressContext'

export default function LessonPage() {
  const { gradeId, subjectId, lessonId } = useParams()
  const { completeLesson, saveQuizScore } = useProgress()
  
  const lessonsCollection = getLessonsByGradeAndSubject(gradeId, subjectId)
  const lesson = getLessonById(gradeId, subjectId, lessonId)

  useEffect(() => {
    if (gradeId) {
      localStorage.setItem('csjs-last-grade', gradeId)
    }
  }, [gradeId])

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

  const handleQuizComplete = (score, total) => {
    saveQuizScore(lessonId, score, total)
  }

  return (
    <div className="lesson-layout lesson-shell-bg min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-6xl">
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

