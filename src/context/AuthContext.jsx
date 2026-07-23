import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function loadProfile(userId) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[auth] profile load failed:', error.message)
    return null
  }
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let mounted = true

    const applySession = async (nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      const nextUser = nextSession?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        const nextProfile = await loadProfile(nextUser.id)
        if (mounted) setProfile(nextProfile)
      } else {
        setProfile(null)
      }
      if (mounted) setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
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
    setProfile(null)
    return { error: null }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null)
      return null
    }
    const next = await loadProfile(user.id)
    setProfile(next)
    return next
  }, [user?.id])

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      isConfigured: isSupabaseConfigured,
      isAuthenticated: Boolean(user),
      isTeacher: profile?.role === 'teacher',
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, loading, signUp, signIn, signOut, refreshProfile],
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
