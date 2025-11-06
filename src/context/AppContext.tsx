import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Game, Friend, FeedPost, Stats, Profile } from '../types'
import { LS_KEYS, read, write, SAMPLE_GAMES, SAMPLE_FRIENDS } from '../utils'

interface AppContextType {
  games: Game[]
  setGames: (games: Game[]) => void
  addGame: (game: Game) => void
  updateGame: (id: string, updates: Partial<Game>) => void
  
  friends: Friend[]
  setFriends: (friends: Friend[]) => void
  addFriend: (friend: Friend) => void
  
  feed: FeedPost[]
  setFeed: (feed: FeedPost[]) => void
  addFeedPost: (post: FeedPost) => void
  
  stats: Stats[]
  setStats: (stats: Stats[]) => void
  addStat: (stat: Stats) => void
  
  profile: Profile | null
  setProfile: (profile: Profile) => void
  
  initialized: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [feed, setFeed] = useState<FeedPost[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedGames = read<Game[] | null>(LS_KEYS.GAMES, null)
    const storedFriends = read<Friend[] | null>(LS_KEYS.FRIENDS, null)
    const storedFeed = read<FeedPost[] | null>(LS_KEYS.FEED, null)
    const storedStats = read<Stats[] | null>(LS_KEYS.STATS, null)
    const storedProfile = read<Profile | null>(LS_KEYS.PROFILE, null)

    if (!storedGames) write(LS_KEYS.GAMES, SAMPLE_GAMES)
    if (!storedFriends) write(LS_KEYS.FRIENDS, SAMPLE_FRIENDS)
    if (!storedFeed)
      write(LS_KEYS.FEED, [{ id: 'f0', text: 'Welcome to Social Sports Map!', time: Date.now() }])
    if (!storedStats) write(LS_KEYS.STATS, [])
    if (!storedProfile) write(LS_KEYS.PROFILE, { id: 'me', name: 'You', avatar: null })

    setGames(storedGames || SAMPLE_GAMES)
    setFriends(storedFriends || SAMPLE_FRIENDS)
    setFeed(
      storedFeed || [{ id: 'f0', text: 'Welcome to Social Sports Map!', time: Date.now() }]
    )
    setStats(storedStats || [])
    setProfile(storedProfile || { id: 'me', name: 'You', avatar: null })
    setInitialized(true)
  }, [])

  // Persist games to localStorage whenever they change
  useEffect(() => {
    if (initialized) {
      write(LS_KEYS.GAMES, games)
    }
  }, [games, initialized])

  // Persist friends
  useEffect(() => {
    if (initialized) {
      write(LS_KEYS.FRIENDS, friends)
    }
  }, [friends, initialized])

  // Persist feed
  useEffect(() => {
    if (initialized) {
      write(LS_KEYS.FEED, feed)
    }
  }, [feed, initialized])

  // Persist stats
  useEffect(() => {
    if (initialized) {
      write(LS_KEYS.STATS, stats)
    }
  }, [stats, initialized])

  // Persist profile
  useEffect(() => {
    if (initialized && profile) {
      write(LS_KEYS.PROFILE, profile)
    }
  }, [profile, initialized])

  const addGame = (game: Game) => {
    setGames((prev) => [...prev, game])
  }

  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    )
  }

  const addFriend = (friend: Friend) => {
    setFriends((prev) => [...prev, friend])
  }

  const addFeedPost = (post: FeedPost) => {
    setFeed((prev) => [...prev, post])
  }

  const addStat = (stat: Stats) => {
    setStats((prev) => [...prev, stat])
  }

  const value: AppContextType = {
    games,
    setGames,
    addGame,
    updateGame,
    friends,
    setFriends,
    addFriend,
    feed,
    setFeed,
    addFeedPost,
    stats,
    setStats,
    addStat,
    profile,
    setProfile,
    initialized
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
