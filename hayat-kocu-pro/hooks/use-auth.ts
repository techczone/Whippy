'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

type Profile = Tables<'profiles'>
type Subscription = Tables<'subscriptions'>

interface AuthState {
  user: User | null
  profile: Profile | null
  subscription: Subscription | null
  session: Session | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    subscription: null,
    session: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  // Fetch profile and subscription
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).single(),
      ])

      return {
        profile: profileRes.data,
        subscription: subRes.data,
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return { profile: null, subscription: null }
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (session?.user) {
          const { profile, subscription } = await fetchUserData(session.user.id)
          setState({
            user: session.user,
            profile,
            subscription,
            session,
            loading: false,
            error: null,
          })
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }))
      }
    }

    initAuth()

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { profile, subscription: sub } = await fetchUserData(session.user.id)
          setState({
            user: session.user,
            profile,
            subscription: sub,
            session,
            loading: false,
            error: null,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            subscription: null,
            session: null,
            loading: false,
            error: null,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserData])

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
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

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single()

    if (error) throw error

    setState(prev => ({ ...prev, profile: data }))
    return data
  }, [supabase, state.user])

  // Check feature access based on subscription
  const hasFeature = useCallback((feature: keyof typeof FEATURE_ACCESS) => {
    const tier = state.subscription?.tier || 'free'
    return FEATURE_ACCESS[feature].includes(tier)
  }, [state.subscription])

  return {
    ...state,
    signInWithOAuth,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    hasFeature,
    isAuthenticated: !!state.user,
    isPro: state.subscription?.tier === 'pro' || state.subscription?.tier === 'elite',
    isElite: state.subscription?.tier === 'elite',
  }
}

// Feature access by tier
const FEATURE_ACCESS = {
  brutalMode: ['pro', 'elite'],
  predictions: ['pro', 'elite'],
  reports: ['pro', 'elite'],
  integrations: ['pro', 'elite'],
  unlimitedHabits: ['elite'],
  unlimitedGoals: ['elite'],
  prioritySupport: ['elite'],
} as const
