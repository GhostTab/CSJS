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
  PlayCircle,
} from 'lucide-react'
import { useProgress } from '../context/ProgressContext'
import schoolLogo from '../assets/CSJS.png'
import { SCHOOL_FACEBOOK_LABEL, SCHOOL_FACEBOOK_URL } from '../constants/schoolLinks'
import FacebookIcon from './FacebookIcon'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/grade/7', label: 'Lessons', icon: BookOpen },
  { path: '/quiz-practice', label: 'Activities', icon: Activity },
]

function FacebookLink({ className = '', showLabel = false, onClick }) {
  return (
    <a
      href={SCHOOL_FACEBOOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={SCHOOL_FACEBOOK_LABEL}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1877F2] font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-[#166fe5] hover:shadow-lg ${className}`}
    >
      <FacebookIcon className={showLabel ? 'h-5 w-5' : 'h-5 w-5'} />
      {showLabel && <span className="pr-1 text-sm">Facebook</span>}
    </a>
  )
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const location = useLocation()
  const { progress } = useProgress()

  const hasProgress = progress.completedLessons.length > 0
  const lastGrade = localStorage.getItem('csjs-last-grade')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-gradient-to-r from-white/95 via-sky-50/90 to-white/95 backdrop-blur-md">
      <motion.div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="nav-link-hover flex min-w-0 shrink items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-sky-50"
          >
            <img
              src={schoolLogo}
              alt="Colegio de San Juan Samar"
              className="h-9 w-auto max-w-[100px] object-contain sm:h-10 sm:max-w-[120px]"
            />
            <span className="hidden truncate text-lg font-bold text-slate-900 sm:inline">
              CSJS Learn
            </span>
          </Link>

          {/* Desktop nav — center */}
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path === '/grade/7' && location.pathname.startsWith('/grade')) ||
                (item.path === '/quiz-practice' && location.pathname === '/quiz-practice')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link-hover flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4 ${
                    isActive
                      ? 'nav-gradient-active text-white'
                      : 'text-slate-600 hover:bg-sky-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right: Facebook + Start/Resume + mobile menu */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <FacebookLink className="h-10 w-10 justify-center p-0 md:hidden" />
            <FacebookLink className="hidden h-9 px-3 py-2 md:inline-flex" showLabel />

            <motion.div className="hidden items-center gap-3 md:flex">
              {hasProgress && lastGrade ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setResumeOpen(!resumeOpen)}
                    className="btn-gradient flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
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
                        className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-100 bg-white p-3 shadow-lg"
                      >
                        <p className="mb-2 text-xs font-medium text-slate-500">
                          Continue where you left off
                        </p>
                        <Link
                          to={`/grade/${lastGrade}`}
                          onClick={() => setResumeOpen(false)}
                          className="flex items-center gap-3 rounded-lg bg-blue-50 p-2 transition-colors hover:bg-blue-100"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold text-white">
                            {lastGrade}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Grade {lastGrade}
                            </p>
                            <p className="text-xs text-slate-500">
                              {progress.completedLessons.length} lessons completed
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/grade/7"
                  className="btn-gradient flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start
                </Link>
              )}
            </motion.div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 pb-3 lg:hidden"
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
                          ? 'nav-gradient-active text-white'
                          : 'text-slate-600 hover:bg-sky-50'
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
                    className="btn-gradient mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Resume Grade {lastGrade}
                  </Link>
                )}
                <FacebookLink
                  className="mt-2 h-11 w-full justify-center px-4"
                  showLabel
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  )
}
