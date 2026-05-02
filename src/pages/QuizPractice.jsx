import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Filter, 
  CheckCircle2, 
  XCircle,
  Trophy,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Target,
  Lightbulb,
  Clock,
  Sparkles,
  Calculator,
  Microscope,
  Scroll,
  Globe,
  Monitor,
  Music,
  Wrench
} from 'lucide-react'
import gradesData from '../data/grades.json'
import { getLessonsByGradeAndSubject } from '../data/lessonData'

const iconMap = {
  Calculator, Microscope, BookOpen, Scroll, Globe, Monitor, Music, Wrench
}

const difficultyColors = {
  'Easy': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Medium': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Hard': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

function hashString(input) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createSeededRng(seedInput) {
  let state = hashString(seedInput) || 1
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function shuffleOptions(options, seedInput) {
  const shuffled = [...options]
  const random = createSeededRng(seedInput)
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function QuizPractice() {
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [quizState, setQuizState] = useState({
    currentIndex: 0,
    selectedAnswer: null,
    showFeedback: false,
    answers: [],
    completed: false
  })

  // Collect all quizzes from all lessons
  const allQuizzes = useMemo(() => {
    const quizzes = []
    gradesData.forEach(grade => {
      grade.subjects.forEach(subject => {
        const collection = getLessonsByGradeAndSubject(grade.grade, subject.id)
        if (collection?.lessons) {
          collection.lessons.forEach(lesson => {
            if (lesson.quiz?.length > 0) {
              quizzes.push({
                grade: grade.grade,
                subject: subject,
                lesson: lesson,
                questions: lesson.quiz
              })
            }
          })
        }
      })
    })
    return quizzes
  }, [])

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter(quiz => {
      const gradeMatch = selectedGrade === 'all' || quiz.grade === parseInt(selectedGrade)
      const subjectMatch = selectedSubject === 'all' || quiz.subject.id === selectedSubject
      return gradeMatch && subjectMatch
    })
  }, [allQuizzes, selectedGrade, selectedSubject])

  // Get unique subjects for filter
  const allSubjects = useMemo(() => {
    const subjects = new Set()
    allQuizzes.forEach(q => subjects.add(q.subject.id))
    return Array.from(subjects)
  }, [allQuizzes])

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz)
    setQuizState({
      currentIndex: 0,
      selectedAnswer: null,
      showFeedback: false,
      answers: [],
      completed: false
    })
  }

  const handleSelect = (answer) => {
    if (quizState.showFeedback) return
    setQuizState(prev => ({ ...prev, selectedAnswer: answer }))
  }

  const handleCheck = () => {
    if (!quizState.selectedAnswer) return
    const currentQuestion = activeQuiz.questions[quizState.currentIndex]
    const isCorrect = quizState.selectedAnswer === currentQuestion.answer
    
    setQuizState(prev => ({
      ...prev,
      showFeedback: true,
      answers: [...prev.answers, { correct: isCorrect, selected: prev.selectedAnswer }]
    }))
  }

  const handleNext = () => {
    if (quizState.currentIndex < activeQuiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        showFeedback: false
      }))
    } else {
      setQuizState(prev => ({ ...prev, completed: true }))
    }
  }

  const handleRetry = () => {
    setQuizState({
      currentIndex: 0,
      selectedAnswer: null,
      showFeedback: false,
      answers: [],
      completed: false
    })
  }

  const exitQuiz = () => {
    setActiveQuiz(null)
  }

  // Quiz View
  if (activeQuiz) {
    const currentQuestion = activeQuiz.questions[quizState.currentIndex]
    const isTrueFalse = currentQuestion.type === 'true_false'
    const baseOptions = isTrueFalse ? ['True', 'False'] : (currentQuestion.choices || [])
    const optionsSeed = `${quizState.currentIndex}-${currentQuestion.question}-${JSON.stringify(baseOptions)}`
    const options = shuffleOptions(baseOptions, optionsSeed)
    const isCorrect = quizState.selectedAnswer === currentQuestion.answer
    const score = quizState.answers.filter(a => a.correct).length

    if (quizState.completed) {
      const finalScore = score
      const percentage = Math.round((finalScore / activeQuiz.questions.length) * 100)
      const isPerfect = percentage === 100

      return (
        <div className="min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-strong rounded-3xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500"
              >
                {isPerfect ? (
                  <Trophy className="h-14 w-14 text-white" />
                ) : percentage >= 70 ? (
                  <CheckCircle2 className="h-14 w-14 text-white" />
                ) : (
                  <Target className="h-14 w-14 text-white" />
                )}
              </motion.div>

              <h2 className="text-3xl font-bold text-slate-800">
                {isPerfect ? 'Perfect Score!' : 'Quiz Complete!'}
              </h2>
              <p className="mt-2 text-slate-600">
                You scored {finalScore} out of {activeQuiz.questions.length}
              </p>

              <div className="mx-auto mt-6 max-w-xs">
                <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full rounded-full ${
                      isPerfect 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                        : percentage >= 70
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        : 'bg-gradient-to-r from-blue-400 to-violet-500'
                    }`}
                  />
                </div>
                <p className="mt-2 text-lg font-bold text-slate-800">{percentage}%</p>
              </div>

              {isPerfect && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-amber-50 p-4"
                >
                  <p className="font-semibold text-amber-700">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    Perfect Score! Amazing work!
                  </p>
                </motion.div>
              )}

              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={exitQuiz}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
                >
                  Back to Practice
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={exitQuiz}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Quiz
            </button>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600">
                Question {quizState.currentIndex + 1} of {activeQuiz.questions.length}
              </p>
              <p className="text-xs text-slate-500">
                Score: {score}/{quizState.currentIndex + (quizState.showFeedback ? 1 : 0)}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((quizState.currentIndex + (quizState.showFeedback ? 1 : 0)) / activeQuiz.questions.length) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
            />
          </div>

          {/* Question Card */}
          <motion.div
            key={quizState.currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-strong rounded-2xl p-6"
          >
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <div 
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: activeQuiz.subject.color }}
                >
                  {activeQuiz.grade}
                </div>
                <span className="text-sm text-slate-500">{activeQuiz.subject.name}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{currentQuestion.question}</h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {options.map((option, i) => {
                const isSelected = quizState.selectedAnswer === option
                const isCorrectAnswer = option === currentQuestion.answer
                
                let buttonClass = 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                
                if (quizState.showFeedback) {
                  if (isCorrectAnswer) {
                    buttonClass = 'border-emerald-500 bg-emerald-50'
                  } else if (isSelected) {
                    buttonClass = 'border-rose-500 bg-rose-50'
                  } else {
                    buttonClass = 'border-slate-200 bg-white opacity-60'
                  }
                } else if (isSelected) {
                  buttonClass = 'border-blue-500 bg-blue-50'
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(option)}
                    disabled={quizState.showFeedback}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${buttonClass}`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected && !quizState.showFeedback
                        ? 'border-blue-500 bg-blue-500'
                        : quizState.showFeedback && isCorrectAnswer
                        ? 'border-emerald-500 bg-emerald-500'
                        : quizState.showFeedback && isSelected
                        ? 'border-rose-500 bg-rose-500'
                        : 'border-slate-300'
                    }`}>
                      {(isSelected || (quizState.showFeedback && isCorrectAnswer)) && (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="flex-1 font-medium text-slate-700">{option}</span>
                    {quizState.showFeedback && isCorrectAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                    {quizState.showFeedback && isSelected && !isCorrectAnswer && (
                      <XCircle className="h-5 w-5 text-rose-500" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {quizState.showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 rounded-xl p-4 ${isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                    )}
                    <div>
                      <p className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite right'}
                      </p>
                      {currentQuestion.explanation && (
                        <p className="mt-1 text-sm text-slate-600">
                          <Lightbulb className="inline h-4 w-4 mr-1 text-amber-500" />
                          {currentQuestion.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <div className="mt-6">
              {!quizState.showFeedback ? (
                <button
                  onClick={handleCheck}
                  disabled={!quizState.selectedAnswer}
                  className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  {quizState.currentIndex === activeQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Quiz List View
  return (
    <div className="min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Quiz Practice</h1>
          <p className="mt-2 text-slate-600">
            Test your knowledge with interactive quizzes from all subjects
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 glass-card rounded-2xl p-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Filter className="h-4 w-4" />
              Filter by:
            </div>
            
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Grades</option>
              {[7, 8, 9, 10].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {gradesData[0].subjects
                .filter((s) => allSubjects.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>

            <div className="ml-auto text-sm text-slate-500">
              {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''} available
            </div>
          </div>
        </motion.div>

        {/* Quiz Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredQuizzes.map((quiz) => {
            const IconComponent = iconMap[quiz.subject.icon] || BookOpen
            const difficulty = quiz.lesson.difficulty || 'Medium'
            const colors = difficultyColors[difficulty]

            return (
              <motion.div
                key={`${quiz.grade}-${quiz.subject.id}-${quiz.lesson.id}`}
                variants={itemVariants}
              >
                <button
                  onClick={() => startQuiz(quiz)}
                  className="group w-full text-left"
                >
                  <div className="glass-card h-full overflow-hidden rounded-2xl p-5 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50/30">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                        style={{
                          background: `linear-gradient(135deg, ${quiz.subject.color} 0%, ${quiz.subject.color}dd 100%)`,
                        }}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {difficulty}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {quiz.lesson.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{quiz.subject.name}</p>

                    {/* Meta */}
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {quiz.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~{Math.ceil(quiz.questions.length * 0.5)} min
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Start Quiz
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <Target className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-800">No quizzes found</h3>
            <p className="mt-2 text-slate-600">
              Try adjusting your filters to find more quizzes.
            </p>
            <button
              onClick={() => {
                setSelectedGrade('all')
                setSelectedSubject('all')
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

