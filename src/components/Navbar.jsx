import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  LayoutDashboard,
  BookOpen,
  Activity,
  Menu,
  X,
  Trophy,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import schoolLogo from '../assets/CSJS.png'
import FacebookIcon from './FacebookIcon'
import { SCHOOL_FACEBOOK_LABEL, SCHOOL_FACEBOOK_URL } from '../constants/schoolLinks'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/rankings', label: 'Rankings', icon: Trophy },
  { path: '/grade/7', label: 'Lessons', icon: BookOpen },
  { path: '/quiz-practice', label: 'Activities', icon: Activity },
]

const actionBtn =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors'

function shortName(raw) {
  if (!raw) return 'Accou...'
  return raw.length > 5 ? `${raw.slice(0, 5)}...` : raw
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const { user, isAuthenticated, isTeacher, signOut } = useAuth()

  const fullLabel = user?.email?.split('@')[0] || 'Account'
  const userLabel = shortName(fullLabel)

  const visibleNavItems = isTeacher
    ? [...navItems.slice(0, 2), { path: '/teacher', label: 'Teacher', icon: Shield }, ...navItems.slice(2)]
    : navItems

  const isNavActive = (item) =>
    location.pathname === item.path ||
    (item.path === '/grade/7' && location.pathname.startsWith('/grade')) ||
    (item.path === '/quiz-practice' && location.pathname === '/quiz-practice') ||
    (item.path === '/rankings' && location.pathname === '/rankings') ||
    (item.path === '/teacher' && location.pathname.startsWith('/teacher'))

  const menuHasActive = visibleNavItems.some(isNavActive)

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    setMenuOpen(false)
  }

  useEffect(() => {
    setMenuOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg py-1 transition-opacity hover:opacity-90"
          >
            <img
              src={schoolLogo}
              alt="Colegio de San Juan Samar"
              className="h-9 w-auto object-contain sm:h-10"
            />
            <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline">
              CSJS Learn
            </span>
          </Link>

          {/* Right: auth + Menu (desktop) / hamburger (mobile) */}
          <div className="flex h-10 shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="hidden h-10 items-center gap-2.5 md:flex sm:gap-3">
              {isAuthenticated ? (
                <>
                  <span
                    className="text-sm font-medium text-slate-500"
                    title={user?.email}
                  >
                    {userLabel}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={`${actionBtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`${actionBtn} border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50`}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`${actionBtn} btn-gradient text-white`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Desktop Menu — right side */}
            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className={`${actionBtn} min-w-[7.5rem] border ${
                  menuHasActive || menuOpen
                    ? 'border-transparent nav-gradient-active text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-sky-50'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Menu
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Navigate
                    </p>
                    {visibleNavItems.map((item) => {
                      const Icon = item.icon
                      const active = isNavActive(item)
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? 'bg-sky-50 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                          {item.label}
                          {active && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                          )}
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-100 lg:hidden"
            >
              <div className="flex flex-col gap-1 py-4">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Menu
                </p>
                {visibleNavItems.map((item) => {
                  const Icon = item.icon
                  const active = isNavActive(item)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                        active
                          ? 'nav-gradient-active text-white'
                          : 'text-slate-600 hover:bg-sky-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}

                <div className="my-2 border-t border-slate-100" />

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-sky-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout ({userLabel})
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-gradient flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white"
                    >
                      <UserPlus className="h-4 w-4" />
                      Register
                    </Link>
                  </div>
                )}

                <div className="px-2 pt-2">
                  <a
                    href={SCHOOL_FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SCHOOL_FACEBOOK_LABEL}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#166fe5]"
                  >
                    <FacebookIcon className="h-5 w-5" />
                    Facebook
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
