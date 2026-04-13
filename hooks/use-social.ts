'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_public: boolean
  total_streak: number
  longest_streak: number
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  friend_profile?: UserProfile
}

export interface LeaderboardEntry {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  active_days: number
  completed_habits: number
  current_streak: number
  rank?: number
}

export function useSocial() {
  const { user } = useAuth()
  const userId = user?.id

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [friends, setFriends] = useState<Friendship[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  const supabase = useMemo(() => createClient(), [])

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!userId) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const newProfile = {
        id: userId,
        username: user?.email?.split('@')[0] || null,
        display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || null,
        avatar_url: user?.user_metadata?.avatar_url || null,
        bio: null,
        is_public: true,
        total_streak: 0,
        longest_streak: 0,
      }

      const { data: created, error: createError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single()

      if (!createError && created) {
        setProfile(created)
        return created
      }
    } else if (data) {
      setProfile(data)
      return data
    }
    return null
  }, [userId, user, supabase])

  // Fetch friends
  const fetchFriends = useCallback(async () => {
    if (!userId) return

    // Get accepted friendships where user is either user_id or friend_id
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted')

    if (friendships) {
      // Get friend profiles
      const friendIds = friendships.map(f => 
        f.user_id === userId ? f.friend_id : f.user_id
      )

      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', friendIds)

        const friendsWithProfiles = friendships.map(f => {
          const friendId = f.user_id === userId ? f.friend_id : f.user_id
          return {
            ...f,
            friend_profile: profiles?.find(p => p.id === friendId),
          }
        })

        setFriends(friendsWithProfiles)
      } else {
        setFriends([])
      }
    }
  }, [userId, supabase])

  // Fetch pending friend requests
  const fetchPendingRequests = useCallback(async () => {
    if (!userId) return

    const { data: requests } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', userId)
      .eq('status', 'pending')

    if (requests) {
      const senderIds = requests.map(r => r.user_id)

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', senderIds)

        const requestsWithProfiles = requests.map(r => ({
          ...r,
          friend_profile: profiles?.find(p => p.id === r.user_id),
        }))

        setPendingRequests(requestsWithProfiles)
      } else {
        setPendingRequests([])
      }
    }
  }, [userId, supabase])

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .limit(50)

    if (data) {
      const ranked = data.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }))
      setLeaderboard(ranked)
    }
  }, [supabase])

  // Initial fetch
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([
        fetchProfile(),
        fetchFriends(),
        fetchPendingRequests(),
        fetchLeaderboard(),
      ])
      setLoading(false)
    }

    fetchAll()
  }, [userId, fetchProfile, fetchFriends, fetchPendingRequests, fetchLeaderboard])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return false

    const { error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      return true
    }
    return false
  }, [userId, supabase])

  // Send friend request
  const sendFriendRequest = useCallback(async (friendUsername: string) => {
    if (!userId) return { success: false, error: 'Not logged in' }

    // Find user by username
    const { data: friendProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', friendUsername)
      .single()

    if (!friendProfile) {
      return { success: false, error: 'User not found' }
    }

    if (friendProfile.id === userId) {
      return { success: false, error: 'Cannot add yourself' }
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${userId})`)
      .single()

    if (existing) {
      if (existing.status === 'accepted') {
        return { success: false, error: 'Already friends' }
      }
      if (existing.status === 'pending') {
        return { success: false, error: 'Request already sent' }
      }
    }

    // Create friendship request
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendProfile.id,
        status: 'pending',
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  }, [userId, supabase])

  // Accept friend request
  const acceptFriendRequest = useCallback(async (friendshipId: string) => {
    if (!userId) return false

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', friendshipId)

    if (!error) {
      await fetchFriends()
      await fetchPendingRequests()
      return true
    }
    return false
  }, [userId, supabase, fetchFriends, fetchPendingRequests])

  // Reject friend request
  const rejectFriendRequest = useCallback(async (friendshipId: string) => {
    if (!userId) return false

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (!error) {
      await fetchPendingRequests()
      return true
    }
    return false
  }, [userId, supabase, fetchPendingRequests])

  // Remove friend
  const removeFriend = useCallback(async (friendshipId: string) => {
    if (!userId) return false

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (!error) {
      await fetchFriends()
      return true
    }
    return false
  }, [userId, supabase, fetchFriends])

  // Search users
  const searchUsers = useCallback(async (query: string): Promise<UserProfile[]> => {
    if (!query || query.length < 2) return []

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_public', true)
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('id', userId)
      .limit(10)

    return data || []
  }, [userId, supabase])

  // Get user's rank
  const myRank = useMemo(() => {
    if (!userId || !leaderboard.length) return null
    const entry = leaderboard.find(e => e.id === userId)
    return entry?.rank || null
  }, [userId, leaderboard])

  // Friends leaderboard
  const friendsLeaderboard = useMemo((): LeaderboardEntry[] => {
    const friendIds = friends.map(f => 
      f.user_id === userId ? f.friend_id : f.user_id
    )
    
    return leaderboard
      .filter(e => friendIds.includes(e.id) || e.id === userId)
      .map((e, idx) => ({ ...e, rank: idx + 1 }))
  }, [friends, leaderboard, userId])

  return {
    loading,
    profile,
    friends,
    pendingRequests,
    leaderboard,
    friendsLeaderboard,
    myRank,
    updateProfile,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    refreshFriends: fetchFriends,
    refreshLeaderboard: fetchLeaderboard,
  }
}
