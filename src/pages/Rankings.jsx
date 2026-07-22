import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy,
  BookOpen,
  Sparkles,
  RefreshCw,
  LogIn,
  Medal,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { fetchOverallRankings } from '../utils/quizRanking'

export default function Rankings() {
  const { user, isAuthenticated, isConfigured } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRankings = useCallback(async () => {
    if (!isConfigured) {
      setError('Supabase is not configured. Add credentials to .env.')
      setLoading(false)
      return
    }
    if (!isAuthenticated) {
      setRows([])
      setError('')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    const { data, error: fetchError } = await fetchOverallRankings(supabase)
    if (fetchError) {
      setError(fetchError)
      setRows([])
    } else {
      setRows(data)
    }
    setLoading(false)
  }, [isAuthenticated, isConfigured])

  useEffect(() => {
    loadRankings()
  }, [loadRankings])

  const myRow = user ? rows.find((row) => row.userId === user.id) : null

  return (
    <div className="min-h-screen px-4 py-8 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-3">
            <div className="icon-gradient flex h-12 w-12 items-center justify-center rounded-xl text-white">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Student Rankings</h1>
              <p className="text-slate-600">Overall points from lesson quizzes</p>
            </div>
          </div>
        </motion.div>

        {/* Quiz type clarity */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
            <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-900">
              <BookOpen className="h-5 w-5" />
              Lesson Quizzes
            </div>
            <p className="text-sm text-emerald-800">
              Count toward ranking. Finish a quiz at the end of a lesson to earn points
              (score × 5). Your best score per lesson is kept.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
            <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
              <Sparkles className="h-5 w-5" />
              Practice Quizzes
            </div>
            <p className="text-sm text-slate-600">
              Practice only — do <strong>not</strong> count toward ranking. Use Activities
              to train without affecting the leaderboard.
            </p>
          </div>
        </div>

        {!isConfigured && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Connect Supabase via <code className="font-mono">.env</code> to enable rankings.
          </div>
        )}

        {isConfigured && !isAuthenticated && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-blue-900">
              Log in to view the leaderboard and to have your lesson quiz scores counted.
            </p>
            <Link
              to="/login"
              className="btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800">Overall leaderboard</h2>
              <button
                type="button"
                onClick={loadRankings}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {myRow && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-3">
                <Medal className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-slate-800">
                  Your rank: <strong>#{myRow.rank}</strong> · {myRow.totalPoints} points ·{' '}
                  {myRow.quizzesCompleted} lesson quiz{myRow.quizzesCompleted === 1 ? '' : 'zes'}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <p className="p-8 text-center text-slate-500">Loading rankings…</p>
              ) : rows.length === 0 ? (
                <p className="p-8 text-center text-slate-500">
                  No lesson quiz scores yet. Complete a lesson quiz to appear here.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Rank</th>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Quizzes</th>
                      <th className="px-4 py-3 font-semibold">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const isMe = user?.id === row.userId
                      return (
                        <tr
                          key={row.userId}
                          className={`border-b border-slate-50 ${isMe ? 'bg-blue-50/70' : ''}`}
                        >
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {row.rank <= 3 ? (
                              <span
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white ${
                                  row.rank === 1
                                    ? 'bg-amber-500'
                                    : row.rank === 2
                                      ? 'bg-slate-400'
                                      : 'bg-amber-700'
                                }`}
                              >
                                {row.rank}
                              </span>
                            ) : (
                              `#${row.rank}`
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {row.displayName}
                            {isMe && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                You
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{row.quizzesCompleted}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{row.totalPoints}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
