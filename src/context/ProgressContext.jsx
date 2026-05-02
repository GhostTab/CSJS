import { createContext, useContext, useState, useEffect } from 'react'

const ProgressContext = createContext()

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('csjs-progress')
    return saved ? JSON.parse(saved) : {
      completedLessons: [],
      quizScores: {},
      currentStreak: 0,
      totalPoints: 0,
      badges: []
    }
  })

  useEffect(() => {
    localStorage.setItem('csjs-progress', JSON.stringify(progress))
  }, [progress])

  const completeLesson = (lessonId, score = 0) => {
    setProgress(prev => {
      if (prev.completedLessons.includes(lessonId)) return prev
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        totalPoints: prev.totalPoints + score + 10,
        currentStreak: prev.currentStreak + 1
      }
    })
  }

  const saveQuizScore = (lessonId, score, total) => {
    setProgress(prev => ({
      ...prev,
      quizScores: { ...prev.quizScores, [lessonId]: { score, total, date: new Date().toISOString() } },
      totalPoints: prev.totalPoints + score * 5
    }))
  }

  const getLessonProgress = (lessonId) => {
    return progress.completedLessons.includes(lessonId)
  }

  const getQuizScore = (lessonId) => {
    return progress.quizScores[lessonId] || null
  }

  return (
    <ProgressContext.Provider value={{
      progress,
      completeLesson,
      saveQuizScore,
      getLessonProgress,
      getQuizScore
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)

