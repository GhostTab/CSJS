import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    if (!supabase) {
      return { error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.' }
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    return { data, error: null }
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) {
      return { error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.' }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { data, error: null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      isAuthenticated: Boolean(user),
      signUp,
      signIn,
      signOut,
    }),
    [session, user, loading, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
