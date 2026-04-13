'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  // Stable supabase client
  const supabase = useMemo(() => createClient(), [])

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        setState({
          user: session?.user || null,
          session: session,
          loading: false,
        })
      } catch (error) {
        console.error('Auth init error:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    initAuth()

    // Listen to ALL auth changes including token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        
        setState({
          user: session?.user || null,
          session: session,
          loading: false,
        })
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Sign in with email
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }, [supabase])

  // Sign up with email
  const signUpWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [supabase])

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!state.user,
  }
}
