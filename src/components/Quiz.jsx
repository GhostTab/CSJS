import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy,
  RotateCcw,
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react'

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

export default function Quiz({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answers, setAnswers] = useState([])
  const [completed, setCompleted] = useState(false)

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No quiz questions available for this lesson.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isTrueFalse = currentQuestion.type === 'true_false'
  const baseOptions = isTrueFalse ? ['True', 'False'] : (currentQuestion.choices || [])
  const optionsSeed = `${currentIndex}-${currentQuestion.question}-${JSON.stringify(baseOptions)}`
  const options = shuffleOptions(baseOptions, optionsSeed)
  
  const isCorrect = selectedAnswer === currentQuestion.answer
  const score = answers.filter(a => a.correct).length

  const handleSelect = (answer) => {
    if (showFeedback) return
    setSelectedAnswer(answer)
  }

  const handleCheck = () => {
    if (!selectedAnswer) return
    setShowFeedback(true)
    setAnswers(prev => [...prev, { 
      question: currentQuestion.question, 
      correct: isCorrect,
      selected: selectedAnswer,
      correctAnswer: currentQuestion.answer
    }])
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setCompleted(true)
      onFinish?.(score, questions.length)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setAnswers([])
    setCompleted(false)
  }

  if (completed) {
    const finalScore = score + (isCorrect && !showFeedback ? 1 : 0)
    const percentage = Math.round((finalScore / questions.length) * 100)
    const isPerfect = percentage === 100

    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          {isPerfect ? (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          ) : percentage >= 70 ? (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500">
              <Target className="h-12 w-12 text-white" />
            </div>
          )}
        </motion.div>

        <h3 className="text-2xl font-bold text-slate-800">
          {isPerfect ? 'Perfect Score!' : percentage >= 70 ? 'Great Job!' : 'Quiz Complete!'}
        </h3>
        
        <p className="mt-2 text-slate-600">
          You scored <span className="font-bold text-slate-800">{finalScore}</span> out of{' '}
          <span className="font-bold text-slate-800">{questions.length}</span>
        </p>

        <div className="mt-4">
          <div className="mx-auto h-3 w-48 overflow-hidden rounded-full bg-slate-200">
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
          <p className="mt-2 text-sm font-medium text-slate-600">{percentage}%</p>
        </div>

        {isPerfect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-amber-50 p-3"
          >
            <p className="text-sm font-medium text-amber-700">
              <Sparkles className="inline h-4 w-4 mr-1" />
              You earned the Perfect Score badge!
            </p>
          </motion.div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>

        {/* Answer Review */}
        <div className="mt-8 text-left">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Answer Review
          </h4>
          <div className="space-y-3">
            {answers.map((answer, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 ${
                  answer.correct ? 'bg-emerald-50' : 'bg-rose-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {answer.correct ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">{answer.question}</p>
                    {!answer.correct && (
                      <p className="mt-1 text-sm text-slate-600">
                        Your answer: <span className="text-rose-600">{answer.selected}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Knowledge Check</h3>
          <p className="text-sm text-neutral-600">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">
            Score: {score}/{currentIndex + (showFeedback ? 1 : 0)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-2 overflow-hidden rounded-sm bg-neutral-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100}%` }}
          className="h-full rounded-sm bg-[#04aa6d]"
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-xl font-semibold leading-snug text-neutral-900">{currentQuestion.question}</h4>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, i) => {
          const isSelected = selectedAnswer === option
          const isCorrectAnswer = option === currentQuestion.answer
          
          let buttonClass = 'border-neutral-200 bg-white hover:border-[#04aa6d]/40 hover:bg-[#e7f5ef]/50'
          
          if (showFeedback) {
            if (isCorrectAnswer) {
              buttonClass = 'border-emerald-500 bg-emerald-50'
            } else if (isSelected) {
              buttonClass = 'border-rose-500 bg-rose-50'
            } else {
              buttonClass = 'border-neutral-200 bg-white opacity-60'
            }
          } else if (isSelected) {
            buttonClass = 'border-[#04aa6d] bg-[#e7f5ef]'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={`flex w-full items-center gap-3 rounded-md border-2 p-4 text-left transition-all ${buttonClass}`}
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                isSelected && !showFeedback
                  ? 'border-[#04aa6d] bg-[#04aa6d]'
                  : showFeedback && isCorrectAnswer
                  ? 'border-emerald-500 bg-emerald-500'
                  : showFeedback && isSelected
                  ? 'border-rose-500 bg-rose-500'
                  : 'border-neutral-300'
              }`}>
                {(isSelected || (showFeedback && isCorrectAnswer)) && (
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </div>
              <span className="flex-1 font-medium text-slate-700">{option}</span>
              {showFeedback && isCorrectAnswer && (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
              {showFeedback && isSelected && !isCorrectAnswer && (
                <XCircle className="h-5 w-5 text-rose-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-6 rounded-xl p-4 ${
              isCorrect ? 'bg-emerald-50' : 'bg-rose-50'
            }`}
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
        {!showFeedback ? (
          <button
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className="w-full rounded-md bg-[#04aa6d] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#038857] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#04aa6d] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#038857]"
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

