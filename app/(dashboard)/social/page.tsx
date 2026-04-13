'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Search, 
  Check, 
  X, 
  Crown,
  Medal,
  Award,
  Flame,
  ChevronRight,
  UserMinus,
  Globe,
  Lock,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { useSocial, UserProfile, LeaderboardEntry } from '@/hooks/use-social'
import toast from 'react-hot-toast'

type Tab = 'leaderboard' | 'friends' | 'requests'

export default function SocialPage() {
  const { user } = useAuth()
  const { language } = useTranslation()
  const {
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
  } = useSocial()

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendUsername, setFriendUsername] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'friends'>('global')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Search users with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchUsers])

  const handleSendRequest = async () => {
    if (!friendUsername.trim()) return

    const result = await sendFriendRequest(friendUsername.trim())
    if (result.success) {
      toast.success(t.requestSent)
      setFriendUsername('')
      setShowAddFriend(false)
    } else {
      toast.error(result.error || t.error)
    }
  }

  const handleAcceptRequest = async (id: string) => {
    const success = await acceptFriendRequest(id)
    if (success) {
      toast.success(t.friendAdded)
    } else {
      toast.error(t.error)
    }
  }

  const handleRejectRequest = async (id: string) => {
    const success = await rejectFriendRequest(id)
    if (success) {
      toast.success(t.requestRejected)
    }
  }

  const handleRemoveFriend = async (id: string, name: string) => {
    const confirmed = window.confirm(t.confirmRemove.replace('{name}', name))
    if (!confirmed) return

    const success = await removeFriend(id)
    if (success) {
      toast.success(t.friendRemoved)
    }
  }

  const handleTogglePublic = async () => {
    const success = await updateProfile({ is_public: !profile?.is_public })
    if (success) {
      toast.success(profile?.is_public ? t.profilePrivate : t.profilePublic)
    }
  }

  const t = {
    title: language === 'tr' ? 'Sosyal' : 'Social',
    subtitle: language === 'tr' ? 'Arkadaşlarınla yarış' : 'Compete with friends',
    leaderboard: language === 'tr' ? 'Liderboard' : 'Leaderboard',
    friends: language === 'tr' ? 'Arkadaşlar' : 'Friends',
    requests: language === 'tr' ? 'İstekler' : 'Requests',
    addFriend: language === 'tr' ? 'Arkadaş Ekle' : 'Add Friend',
    searchPlaceholder: language === 'tr' ? 'Kullanıcı adı ara...' : 'Search username...',
    usernamePlaceholder: language === 'tr' ? 'Kullanıcı adı gir' : 'Enter username',
    send: language === 'tr' ? 'Gönder' : 'Send',
    cancel: language === 'tr' ? 'İptal' : 'Cancel',
    accept: language === 'tr' ? 'Kabul Et' : 'Accept',
    reject: language === 'tr' ? 'Reddet' : 'Reject',
    remove: language === 'tr' ? 'Çıkar' : 'Remove',
    noFriends: language === 'tr' ? 'Henüz arkadaşın yok' : 'No friends yet',
    noPending: language === 'tr' ? 'Bekleyen istek yok' : 'No pending requests',
    requestSent: language === 'tr' ? 'İstek gönderildi!' : 'Request sent!',
    friendAdded: language === 'tr' ? 'Arkadaş eklendi!' : 'Friend added!',
    requestRejected: language === 'tr' ? 'İstek reddedildi' : 'Request rejected',
    friendRemoved: language === 'tr' ? 'Arkadaş çıkarıldı' : 'Friend removed',
    confirmRemove: language === 'tr' ? '{name} arkadaşlıktan çıkarılsın mı?' : 'Remove {name} from friends?',
    error: language === 'tr' ? 'Bir hata oluştu' : 'An error occurred',
    global: language === 'tr' ? 'Genel' : 'Global',
    friendsOnly: language === 'tr' ? 'Arkadaşlar' : 'Friends',
    yourRank: language === 'tr' ? 'Sıralamanız' : 'Your Rank',
    habits: language === 'tr' ? 'alışkanlık' : 'habits',
    days: language === 'tr' ? 'gün' : 'days',
    streak: language === 'tr' ? 'seri' : 'streak',
    publicProfile: language === 'tr' ? 'Profil Herkese Açık' : 'Public Profile',
    privateProfile: language === 'tr' ? 'Profil Gizli' : 'Private Profile',
    profilePublic: language === 'tr' ? 'Profilin artık herkese açık' : 'Profile is now public',
    profilePrivate: language === 'tr' ? 'Profilin artık gizli' : 'Profile is now private',
    you: language === 'tr' ? '(Sen)' : '(You)',
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 text-center text-sm font-medium text-muted-foreground">{rank}</span>
  }

  const currentLeaderboard = leaderboardType === 'friends' ? friendsLeaderboard : leaderboard

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePublic}
            className={cn(
              profile?.is_public ? 'text-green-600' : 'text-muted-foreground'
            )}
          >
            {profile?.is_public ? <Globe className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
            {profile?.is_public ? t.publicProfile : t.privateProfile}
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 bg-secondary rounded-xl p-1"
      >
        {(['leaderboard', 'friends', 'requests'] as Tab[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 relative',
              activeTab === tab && 'bg-primary'
            )}
          >
            {tab === 'leaderboard' && <Trophy className="w-4 h-4 mr-1" />}
            {tab === 'friends' && <Users className="w-4 h-4 mr-1" />}
            {tab === 'requests' && <UserPlus className="w-4 h-4 mr-1" />}
            {tab === 'leaderboard' && t.leaderboard}
            {tab === 'friends' && t.friends}
            {tab === 'requests' && t.requests}
            {tab === 'requests' && pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </Button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Leaderboard type toggle */}
            <div className="flex gap-2">
              <Button
                variant={leaderboardType === 'global' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLeaderboardType('global')}
              >
                <Globe className="w-4 h-4 mr-1" />
                {t.global}
              </Button>
              <Button
                variant={leaderboardType === 'friends' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLeaderboardType('friends')}
                disabled={friends.length === 0}
              >
                <Users className="w-4 h-4 mr-1" />
                {t.friendsOnly}
              </Button>
            </div>

            {/* Your rank card */}
            {myRank && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRankIcon(myRank)}
                      <div>
                        <p className="font-medium">{t.yourRank}</p>
                        <p className="text-2xl font-bold">#{myRank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t.streak}</p>
                      <p className="font-bold flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {profile?.total_streak || 0} {t.days}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard list */}
            <Card>
              <CardContent className="pt-4 divide-y">
                {currentLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {leaderboardType === 'friends' ? t.noFriends : 'No data'}
                  </p>
                ) : (
                  currentLeaderboard.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={cn(
                        'flex items-center gap-3 py-3',
                        entry.id === user?.id && 'bg-primary/5 -mx-4 px-4 rounded-lg'
                      )}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(entry.rank || idx + 1)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold">
                        {entry.display_name?.[0]?.toUpperCase() || entry.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {entry.display_name || entry.username || 'Anonymous'}
                          {entry.id === user?.id && (
                            <span className="text-primary text-sm ml-1">{t.you}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{entry.username || 'user'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.completed_habits}</p>
                        <p className="text-xs text-muted-foreground">{t.habits}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {entry.current_streak}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.streak}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Add friend button/form */}
            <Card>
              <CardContent className="pt-4">
                {!showAddFriend ? (
                  <Button 
                    className="w-full" 
                    onClick={() => setShowAddFriend(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t.addFriend}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-3 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                                {result.display_name?.[0] || result.username?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{result.display_name || result.username}</p>
                                <p className="text-xs text-muted-foreground">@{result.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={async () => {
                                const res = await sendFriendRequest(result.username!)
                                if (res.success) {
                                  toast.success(t.requestSent)
                                  setSearchQuery('')
                                  setSearchResults([])
                                } else {
                                  toast.error(res.error || t.error)
                                }
                              }}
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Manual username input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder={t.usernamePlaceholder}
                        value={friendUsername}
                        onChange={(e) => setFriendUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                      />
                      <Button onClick={handleSendRequest}>{t.send}</Button>
                      <Button variant="ghost" onClick={() => {
                        setShowAddFriend(false)
                        setFriendUsername('')
                        setSearchQuery('')
                        setSearchResults([])
                      }}>
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Friends list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t.friends} ({friends.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {friends.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t.noFriends}
                  </p>
                ) : (
                  friends.map((friendship) => (
                    <div
                      key={friendship.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold">
                          {friendship.friend_profile?.display_name?.[0] || 
                           friendship.friend_profile?.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {friendship.friend_profile?.display_name || 
                             friendship.friend_profile?.username || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{friendship.friend_profile?.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {friendship.friend_profile?.total_streak || 0}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFriend(
                            friendship.id, 
                            friendship.friend_profile?.display_name || 'User'
                          )}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  {t.requests} ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t.noPending}
                  </p>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold">
                          {request.friend_profile?.display_name?.[0] || 
                           request.friend_profile?.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.friend_profile?.display_name || 
                             request.friend_profile?.username || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{request.friend_profile?.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
