import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import schoolLogo from '../assets/CSJS.png'

const heroImageModules = import.meta.glob('../assets/school-hero.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const schoolHeroImage = Object.values(heroImageModules)[0] || null

export default function Login() {
  const { signIn, isAuthenticated, loading, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div
      className={`hero-mesh relative min-h-screen overflow-hidden px-4 pb-16 pt-24 md:px-8 md:pt-28 ${
        schoolHeroImage ? 'hero-with-photo' : 'auth-shell'
      }`}
      style={
        schoolHeroImage
          ? { '--hero-photo': `url(${schoolHeroImage})` }
          : undefined
      }
    >
      {!schoolHeroImage && (
        <>
          <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <img
            src={schoolLogo}
            alt="Colegio de San Juan Samar"
            className="mx-auto h-16 w-auto object-contain drop-shadow-sm"
          />
          <p className="mt-3 text-sm font-medium tracking-wide text-slate-500">
            Colegio de San Juan Samar
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.35)] backdrop-blur-xl">
          <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 px-8 py-6 text-white">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Log in</h1>
            <p className="mt-1.5 text-sm text-white/85">
              Sign in to sync quiz scores and appear on the rankings.
            </p>
          </div>

          <div className="px-8 py-8">
            {!isConfigured && (
              <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                Supabase is not configured yet. Add credentials to{' '}
                <code className="font-mono text-xs">.env</code>.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !isConfigured}
                className="btn-gradient group flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? (
                  'Signing in…'
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Log in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              No account yet?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
