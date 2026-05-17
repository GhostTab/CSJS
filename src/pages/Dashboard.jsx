import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock,
  BookOpen,
  Award,
  Star,
  TrendingUp,
  Calendar,
  ChevronRight,
  Flame,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import gradesData from '../data/grades.json'
import { getAllLessonCollections, getLessonsByGradeAndSubject } from '../data/lessonData'
import { useProgress } from '../context/ProgressContext'

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

export default function Dashboard() {
  const { progress } = useProgress()
  const allLessons = getAllLessonCollections().flatMap((collection) =>
    collection.lessons.map((lesson) => ({
      ...lesson,
      grade: collection.grade,
      subject: collection.subject,
      subjectId: collection.subjectId,
    })),
  )
  
  // Calculate stats
  const completedLessons = progress.completedLessons.length
  const quizAttempts = Object.keys(progress.quizScores).length
  const averageScore = quizAttempts > 0
    ? Math.round(
        Object.values(progress.quizScores).reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / quizAttempts
      )
    : 0
  
  const recentActivity = [
    ...(progress.completedLessons.slice(-5).map((id) => {
      const lesson = allLessons.find((item) => item.id === id)
      return {
      type: 'lesson',
      title: lesson ? `Completed ${lesson.title}` : 'Completed a lesson',
      time: lesson ? `Grade ${lesson.grade} ${lesson.subject}` : 'Recent activity',
      icon: CheckCircle2,
      color: 'emerald'
      }
    })),
  ].reverse()

  // Calculate per-grade stats
  const gradeStats = gradesData.map(grade => {
    const gradeLessons = grade.subjects.reduce((acc, subject) => {
      const collection = getLessonsByGradeAndSubject(grade.grade, subject.id)
      return acc + (collection?.lessons?.length || 0)
    }, 0)
    
    const gradeLessonIds = grade.subjects.flatMap((subject) => {
      const collection = getLessonsByGradeAndSubject(grade.grade, subject.id)
      return collection?.lessons?.map((lesson) => lesson.id) || []
    })
    const completedInGrade = gradeLessonIds.filter((id) =>
      progress.completedLessons.includes(id),
    ).length
    
    return {
      ...grade,
      totalLessons: gradeLessons || grade.subjects.length * 4,
      completed: completedInGrade,
      percentage: gradeLessons ? Math.round((completedInGrade / gradeLessons) * 100) : 0
    }
  })

  return (
    <div className="min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Learning Dashboard</h1>
          <p className="mt-2 text-slate-600">Track your progress and achievements</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{completedLessons}</p>
                <p className="text-sm text-slate-500">Lessons Completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-500 text-white">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{quizAttempts}</p>
                <p className="text-sm text-slate-500">Quizzes Taken</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{averageScore}%</p>
                <p className="text-sm text-slate-500">Avg Quiz Score</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{progress.currentStreak}</p>
                <p className="text-sm text-slate-500">Day Streak</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Grade Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Progress by Grade
              </h2>
              <div className="space-y-4">
                {gradeStats.map((grade) => (
                  <div key={grade.grade}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                          style={{ background: grade.subjects[0]?.color || '#3b82f6' }}
                        >
                          {grade.grade}
                        </div>
                        <span className="font-medium text-slate-700">Grade {grade.grade}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">{grade.percentage}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${grade.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {grade.completed} of {grade.totalLessons} lessons completed
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Clock className="h-5 w-5 text-violet-500" />
                Recent Activity
              </h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => {
                    const Icon = activity.icon
                    const colorClasses = {
                      emerald: 'bg-emerald-100 text-emerald-600',
                      blue: 'bg-blue-100 text-blue-600',
                      amber: 'bg-amber-100 text-amber-600',
                      violet: 'bg-violet-100 text-violet-600',
                    }
                    return (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-all hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-sm"
                        whileHover={{ x: 4 }}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[activity.color] || 'bg-slate-200'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{activity.title}</p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-6 text-center">
                  <p className="text-slate-500">No recent activity. Start learning to see your progress!</p>
                  <Link
                    to="/"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Start Learning
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Award className="h-5 w-5 text-amber-500" />
                Achievements
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {completedLessons > 0 ? (
                  <>
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">First Steps</p>
                      <p className="text-xs text-slate-500">Complete first lesson</p>
                    </div>
                    <div className={`rounded-xl p-4 text-center ${averageScore >= 100 ? 'bg-gradient-to-br from-amber-50 to-amber-100' : 'bg-slate-50 opacity-60'}`}>
                      <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${averageScore >= 100 ? 'bg-amber-500' : 'bg-slate-300'} text-white`}>
                        <Trophy className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">Perfect Score</p>
                      <p className="text-xs text-slate-500">100% on any quiz</p>
                    </div>
                    <div className={`rounded-xl p-4 text-center ${progress.currentStreak >= 3 ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-slate-50 opacity-60'}`}>
                      <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${progress.currentStreak >= 3 ? 'bg-orange-500' : 'bg-slate-300'} text-white`}>
                        <Flame className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">On Fire</p>
                      <p className="text-xs text-slate-500">3-day streak</p>
                    </div>
                    <div className={`rounded-xl p-4 text-center ${completedLessons >= 5 ? 'bg-gradient-to-br from-violet-50 to-violet-100' : 'bg-slate-50 opacity-60'}`}>
                      <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${completedLessons >= 5 ? 'bg-violet-500' : 'bg-slate-300'} text-white`}>
                        <Star className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">Explorer</p>
                      <p className="text-xs text-slate-500">Complete 5 lessons</p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 rounded-xl bg-slate-50 p-6 text-center">
                    <p className="text-slate-500">Complete lessons to unlock achievements!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="mb-4 text-lg font-bold text-slate-800">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center justify-between rounded-xl bg-blue-50 p-4 transition-colors hover:bg-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-slate-700">Continue Learning</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Link>
                <Link
                  to="/quiz-practice"
                  className="flex items-center justify-between rounded-xl bg-violet-50 p-4 transition-colors hover:bg-violet-100"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    <span className="font-medium text-slate-700">Practice Quiz</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

