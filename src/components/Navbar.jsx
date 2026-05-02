import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  Activity, 
  Menu, 
  X,
  GraduationCap,
  PlayCircle,
  ChevronRight
} from 'lucide-react'
import { useProgress } from '../context/ProgressContext'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/grade/7', label: 'Lessons', icon: BookOpen },
  { path: '/quiz-practice', label: 'Activities', icon: Activity },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const location = useLocation()
  const { progress } = useProgress()

  const hasProgress = progress.completedLessons.length > 0
  const lastGrade = localStorage.getItem('csjs-last-grade')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">CSJS Learn</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || 
                (item.path === '/grade/7' && location.pathname.startsWith('/grade')) ||
                (item.path === '/quiz-practice' && location.pathname === '/quiz-practice')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Resume Button */}
          <div className="hidden items-center gap-3 md:flex">
            {hasProgress && lastGrade ? (
              <div className="relative">
                <button
                  onClick={() => setResumeOpen(!resumeOpen)}
                  className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume
                </button>
                
                <AnimatePresence>
                  {resumeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-100 bg-white p-3"
                    >
                      <p className="mb-2 text-xs font-medium text-slate-500">Continue where you left off</p>
                      <Link
                        to={`/grade/${lastGrade}`}
                        onClick={() => setResumeOpen(false)}
                        className="flex items-center gap-3 rounded-lg bg-blue-50 p-2 transition-colors hover:bg-blue-100"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold text-white">
                          {lastGrade}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Grade {lastGrade}</p>
                          <p className="text-xs text-slate-500">{progress.completedLessons.length} lessons completed</p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/grade/7"
                className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                <PlayCircle className="h-4 w-4" />
                Start
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 pb-3 md:hidden"
            >
              <div className="flex flex-col gap-1 pt-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
                {hasProgress && lastGrade && (
                  <Link
                    to={`/grade/${lastGrade}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 flex items-center gap-3 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Resume Grade {lastGrade}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

