import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { VideoReviewProvider } from './context/VideoReviewContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import GradePage from './pages/GradePage'
import SubjectPage from './pages/SubjectPage'
import LessonPage from './pages/LessonPage'
import Dashboard from './pages/Dashboard'
import QuizPractice from './pages/QuizPractice'
import DevVideoReviewPage from './pages/DevVideoReviewPage'

function App() {
  return (
    <VideoReviewProvider>
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grade/:gradeId" element={<GradePage />} />
            <Route path="/grade/:gradeId/:subjectId" element={<SubjectPage />} />
            <Route path="/grade/:gradeId/:subjectId/:lessonId" element={<LessonPage />} />
            <Route path="/quiz-practice" element={<QuizPractice />} />
            <Route path="/dev/video-review" element={<DevVideoReviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
    </VideoReviewProvider>
  )
}

export default App

