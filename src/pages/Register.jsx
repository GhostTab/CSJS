import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp, isAuthenticated, loading, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    const result = await signUp(email.trim(), password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.data?.session) {
      navigate('/dashboard')
      return
    }
    setInfo('Account created. Check your email to confirm, then log in.')
  }

  return (
    <div className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md"
      >
        <div className="surface-card rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-gradient flex h-11 w-11 items-center justify-center rounded-xl text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Register</h1>
              <p className="text-sm text-slate-600">Create an account with email and password.</p>
            </div>
          </div>

          {!isConfigured && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Supabase is not configured yet. Add credentials to <code className="font-mono">.env</code>.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-500/30 focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-blue-500/30 focus:ring-2"
              />
              <p className="mt-1 text-xs text-slate-500">At least 6 characters.</p>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !isConfigured}
              className="btn-gradient w-full rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
