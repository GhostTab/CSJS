import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calculator, 
  Microscope, 
  BookOpen, 
  Scroll, 
  Globe, 
  Monitor, 
  Music, 
  Wrench,
  ChevronRight,
  BookOpenCheck,
  Clock,
  Star
} from 'lucide-react'
import gradesData from '../data/grades.json'
import { getLessonsByGradeAndSubject } from '../data/lessonData'
import { useProgress } from '../context/ProgressContext'
import { cardHover } from '../utils/motionPresets'

const iconMap = {
  Calculator,
  Microscope,
  BookOpen,
  Scroll,
  Globe,
  Monitor,
  Music,
  Wrench
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
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

export default function GradePage() {
  const { gradeId } = useParams()
  const { progress } = useProgress()
  
  const grade = gradesData.find(g => String(g.grade) === gradeId)
  
  useEffect(() => {
    localStorage.setItem('csjs-last-grade', gradeId)
  }, [gradeId])

  if (!grade) return <Navigate to="/" replace />

  const subjectCollections = grade.subjects.map((subject) => {
    const collection = getLessonsByGradeAndSubject(gradeId, subject.id)
    return {
      subject,
      lessons: collection?.lessons || [],
    }
  })
  const totalLessons = subjectCollections.reduce((sum, item) => sum + item.lessons.length, 0)
  const completedInGrade = subjectCollections.reduce(
    (sum, item) =>
      sum + item.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length,
    0,
  )
  const completionPercent = totalLessons === 0 ? 0 : Math.round((completedInGrade / totalLessons) * 100)

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
          <span className="text-slate-400">Subjects</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-800">Grade {gradeId}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Grades
          </Link>
          
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Grade {grade.grade} Subjects
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Choose a subject and jump into lessons, missions, and mini activities.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-3"
        >
          <div className="glass-card flex items-center gap-2 rounded-xl px-4 py-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700">
              {grade.subjects.length} active subjects
            </span>
          </div>
          <div className="glass-card flex items-center gap-2 rounded-xl px-4 py-2">
            <BookOpenCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-700">
              {totalLessons} total lessons this grade
            </span>
          </div>
          <div className="glass-card flex items-center gap-2 rounded-xl px-4 py-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">
              {totalLessons * 2} interactive activities
            </span>
          </div>
        </motion.div>

        {/* Progress Overview */}
        {completionPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Your Progress</h3>
                <p className="text-sm text-slate-600">
                  {completedInGrade} of {totalLessons} lessons completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">{completionPercent}%</span>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              />
            </div>
          </motion.div>
        )}

        {/* Subject Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {subjectCollections.map(({ subject, lessons }) => {
            const IconComponent = iconMap[subject.icon] || BookOpen
            const completedLessons = lessons.filter((lesson) =>
              progress.completedLessons.includes(lesson.id),
            ).length
            const totalSubjectLessons = lessons.length
            const progressPercent =
              totalSubjectLessons === 0 ? 0 : Math.round((completedLessons / totalSubjectLessons) * 100)
            const featuredLessons = lessons.slice(0, 2)

            return (
              <motion.div key={subject.id} variants={itemVariants}>
                <Link
                  to={`/grade/${gradeId}/${subject.id}`}
                  className="group block h-full"
                >
                  <motion.div
                    className="glass-card relative h-full overflow-hidden rounded-2xl p-5"
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={cardHover}
                  >
                    {/* Icon Header */}
                    <div 
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-white"
                      style={{ 
                        background: `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}dd 100%)`,
                      }}
                    >
                      <IconComponent className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-800">{subject.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{subject.description}</p>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{completedLessons}/{totalSubjectLessons} Lessons</span>
                        <span className="font-medium" style={{ color: subject.color }}>
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${progressPercent}%`,
                            background: `linear-gradient(90deg, ${subject.color} 0%, ${subject.color}dd 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-4 flex gap-3 text-xs">
                      <div className="rounded-lg bg-slate-100 px-2 py-1.5">
                        <span className="font-semibold text-slate-700">{totalSubjectLessons}</span>
                        <span className="ml-1 text-slate-500">LESSONS</span>
                      </div>
                      <div className="rounded-lg bg-slate-100 px-2 py-1.5">
                        <span className="font-semibold text-slate-700">{totalSubjectLessons}</span>
                        <span className="ml-1 text-slate-500">INTERACTIVE</span>
                      </div>
                    </div>

                    {/* Featured Lessons */}
                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Featured Lessons
                      </p>
                      <div className="space-y-2">
                        {featuredLessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            {lesson.title}
                          </div>
                        ))}
                        {featuredLessons.length === 0 && (
                          <div className="text-sm text-slate-500">Lessons coming soon</div>
                        )}
                      </div>
                    </div>

                    {/* Hover CTA */}
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Start Learning
                      <ChevronRight className="h-4 w-4" />
                    </div>

                    {/* Decorative Elements */}
                    <div 
                      className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{ background: subject.color }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

