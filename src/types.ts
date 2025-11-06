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
  note: string
  time: number
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
