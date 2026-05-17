import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  Target, 
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  Award,
  Sparkles
} from 'lucide-react'
import gradesData from '../data/grades.json'
import { getLessonsByGradeAndSubject } from '../data/lessonData'
import { useProgress } from '../context/ProgressContext'
import { cardHover } from '../utils/motionPresets'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
}

const difficultyColors = {
  'Easy': 'bg-emerald-100 text-emerald-700',
  'Medium': 'bg-amber-100 text-amber-700',
  'Hard': 'bg-rose-100 text-rose-700'
}

export default function SubjectPage() {
  const { gradeId, subjectId } = useParams()
  const { progress, getLessonProgress } = useProgress()
  
  const grade = gradesData.find(g => String(g.grade) === gradeId)
  const subject = grade?.subjects.find(s => s.id === subjectId)
  const lessonsCollection = getLessonsByGradeAndSubject(gradeId, subjectId)

  useEffect(() => {
    if (gradeId) {
      localStorage.setItem('csjs-last-grade', gradeId)
    }
  }, [gradeId])

  if (!grade || !subject || !lessonsCollection) {
    return <Navigate to={`/grade/${gradeId}`} replace />
  }

  const lessons = lessonsCollection.lessons
  const completedCount = lessons.filter(l => getLessonProgress(l.id)).length
  const completionPercent = Math.round((completedCount / lessons.length) * 100)

  return (
    <div className="min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <Link to="/" className="text-slate-500 hover:text-slate-700">Home</Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <Link to={`/grade/${gradeId}`} className="text-slate-500 hover:text-slate-700">
            Grade {gradeId}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-800">{subject.name}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to={`/grade/${gradeId}`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subjects
          </Link>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                Grade {gradeId} · {subject.name}
              </h1>
              <p className="mt-2 text-lg text-slate-600">{subject.description}</p>
            </div>
            
            {/* Overall Progress */}
            <div className="glass-card rounded-2xl p-4 md:w-64">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Progress</span>
                <span className="text-lg font-bold" style={{ color: subject.color }}>
                  {completionPercent}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: subject.color }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {completedCount} of {lessons.length} lessons completed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lessons Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-5 md:grid-cols-2"
        >
          {lessons.map((lesson, index) => {
            const isCompleted = getLessonProgress(lesson.id)
            const quizScore = progress.quizScores[lesson.id]

            return (
              <motion.div key={lesson.id} variants={itemVariants}>
                <Link
                  to={`/grade/${gradeId}/${subjectId}/${lesson.id}`}
                  className="group block"
                >
                  <motion.div
                    className={`glass-card relative overflow-hidden rounded-2xl p-6 ${
                    isCompleted ? 'border-emerald-200' : ''
                  }`}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={cardHover}
                  >
                    {/* Completed Badge */}
                    {isCompleted && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Completed</span>
                      </div>
                    )}

                    {/* Number & Title */}
                    <div className="flex items-start gap-4">
                      <div 
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                        style={{
                          background: isCompleted
                            ? '#10b981'
                            : `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}dd 100%)`,
                        }}
                      >
                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        difficultyColors[lesson.difficulty] || 'bg-slate-100 text-slate-700'
                      }`}>
                        {lesson.difficulty}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        <Clock className="h-3 w-3" />
                        {lesson.estimatedTime}
                      </span>
                      {quizScore && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          <Award className="h-3 w-3" />
                          {quizScore.score}/{quizScore.total} Quiz
                        </span>
                      )}
                    </div>

                    {/* Objectives Preview */}
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Learning Objectives
                      </p>
                      <ul className="space-y-1">
                        {lesson.objectives.slice(0, 2).map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="line-clamp-1">{obj}</span>
                          </li>
                        ))}
                        {lesson.objectives.length > 2 && (
                          <li className="text-xs text-slate-400 pl-5">
                            +{lesson.objectives.length - 2} more objectives
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-5 flex items-center gap-2">
                      <span 
                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
                        style={{ 
                          background: isCompleted 
                            ? '#10b981' 
                            : `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}cc 100%)`
                        }}
                      >
                        <Play className="h-4 w-4" />
                        {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                      </span>
                      {isCompleted && quizScore && quizScore.score === quizScore.total && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                          <Sparkles className="h-3 w-3" />
                          Perfect Score!
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {lessons.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-800">No lessons yet</h3>
            <p className="mt-2 text-slate-600">
              Lessons for this subject are coming soon!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

