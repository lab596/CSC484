// Core data types for the sports map app

export interface Game {
  id: string
  title: string
  sport: string
  address: string
  lat: number
  lng: number
  date?: string
  host?: string
  skill?: string
  type: 'game' | 'field'
  attendees: number
  friendHost?: boolean
  reservedByMe?: boolean
  // Field reservations - when a user reserves a time on a field
  reservations?: FieldReservation[]
}

export interface FieldReservation {
  id: string
  userId: string
  userName: string
  date: string
  time: string
  notes?: string
}

export interface Friend {
  id: string
  name: string
  mutual?: boolean
}

export interface FeedPost {
  id: string
  author?: string
  text?: string
  photo?: string
  time: number
}

export interface Stats {
  id: string
  gameId: string
  gameTitle: string
  sport?: string
  result?: 'W' | 'L' | 'D'
  performanceRating?: number
  note: string
  time: number
  rebounds?: number
  threePointers?: number
  saves?: number
  opponent?: string
  venueType?: 'Home' | 'Away' | 'Neutral'
  minutesPlayed?: number
  position?: string
  energyLevel?: number
  mood?: 'Great' | 'Good' | 'Okay' | 'Tired' | 'Injured'
  weather?: string
  extraMetrics?: Record<string, string | number>
}

export interface Profile {
  id: string
  name: string
  avatar?: string | null
}

export interface LatLng {
  lat: number
  lng: number
}

export interface AddressSuggestion {
  display: string
  lat: number
  lng: number
  source: 'local' | 'nominatim'
}
