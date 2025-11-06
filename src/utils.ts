// Shared utilities and localStorage management

import { 
  Game, 
  Friend, 
  FeedPost, 
  Stats, 
  Profile, 
  LatLng
} from './types'

export interface AddressSuggestion {
  display: string
  lat: number
  lng: number
  source: 'local' | 'nominatim'
}

export const LS_KEYS = {
  GAMES: 'ssma_games',
  FRIENDS: 'ssma_friends',
  FEED: 'ssma_feed',
  STATS: 'ssma_stats',
  PROFILE: 'ssma_profile'
}

export function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch (e) {
    return fallback
  }
}

export function write(key: string, val: unknown): void {
  localStorage.setItem(key, JSON.stringify(val))
}

export function todayOffset(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function readFileAsDataURL(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(f)
  })
}

export function escapeHtml(s: string | undefined): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Built-in address lookup for San Luis Obispo demo
const ADDRESS_LOOKUP: { [key: string]: LatLng } = {
  'spike arena': { lat: 35.2821, lng: -120.6600 },
  'dana adobe': { lat: 35.3089, lng: -120.6592 },
  'city park': { lat: 35.2836, lng: -120.6607 },
  'college baseball field': { lat: 35.2741, lng: -120.6602 }
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  if (!address) return null
  
  const k = address.trim().toLowerCase()
  if (ADDRESS_LOOKUP[k]) return ADDRESS_LOOKUP[k]
  
  // Try simple normalization match
  for (const key of Object.keys(ADDRESS_LOOKUP)) {
    if (k.includes(key)) return ADDRESS_LOOKUP[key]
  }
  
  // Fallback: query Nominatim (public) - best-effort; may be rate-limited
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address + ', San Luis Obispo, CA'
    )}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    const data = await res.json() as Array<{ lat: string; lon: string }>
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0]
      return { lat: Number(first.lat), lng: Number(first.lon) }
    }
  } catch (e) {
    console.warn('Geocode failed', e)
  }
  return null
}

export async function fetchAddressSuggestions(q: string): Promise<AddressSuggestion[]> {
  if (!q || q.trim().length < 2) return []
  
  const text = q.trim().toLowerCase()
  const results: AddressSuggestion[] = []
  
  // Local lookup first (fuzzy contains)
  for (const key of Object.keys(ADDRESS_LOOKUP)) {
    if (key.includes(text) || text.includes(key)) {
      results.push({
        display: key.replace(/\b\w/g, (c) => c.toUpperCase()) + ', San Luis Obispo, CA',
        lat: ADDRESS_LOOKUP[key].lat,
        lng: ADDRESS_LOOKUP[key].lng,
        source: 'local'
      })
    }
  }
  
  // If we have enough local results, return early
  if (results.length >= 5) return results.slice(0, 5)
  
  // Fallback: Nominatim search bounded to SLO area (best-effort)
  try {
    // viewbox for San Luis Obispo approximate: left,top,right,bottom (lon,lat)
    const viewbox = [-120.72, 35.33, -120.59, 35.24]
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
      q
    )}&viewbox=${viewbox.join(',')}&bounded=1`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>
    if (Array.isArray(data)) {
      for (const it of data) {
        results.push({
          display: it.display_name,
          lat: Number(it.lat),
          lng: Number(it.lon),
          source: 'nominatim'
        })
      }
    }
  } catch (e) {
    console.warn('Suggestion fetch failed', e)
  }
  return results.slice(0, 5)
}

export const DEFAULT_CENTER: LatLng = { lat: 35.2828, lng: -120.6596 }

// Sample initial data
export const SAMPLE_GAMES: Game[] = [
  {
    id: 'g1',
    title: 'Pickup Soccer - City Park',
    sport: 'soccer',
    address: 'City Park, SLO',
    lat: ADDRESS_LOOKUP['city park'].lat,
    lng: ADDRESS_LOOKUP['city park'].lng,
    date: todayOffset(0),
    host: 'alex',
    skill: 'intermediate',
    type: 'game',
    attendees: 5
  },
  {
    id: 'g2',
    title: 'Hoops at Spike',
    sport: 'basketball',
    address: 'Spike Arena, SLO',
    lat: ADDRESS_LOOKUP['spike arena'].lat,
    lng: ADDRESS_LOOKUP['spike arena'].lng,
    date: todayOffset(0),
    host: 'maria',
    skill: 'all',
    type: 'game',
    attendees: 3,
    friendHost: true
  },
  {
    id: 'g3',
    title: 'Tennis Meetup',
    sport: 'tennis',
    address: 'Dana Adobe Park, SLO',
    lat: ADDRESS_LOOKUP['dana adobe'].lat,
    lng: ADDRESS_LOOKUP['dana adobe'].lng,
    date: todayOffset(1),
    host: 'Jam',
    skill: 'beginner',
    type: 'game',
    attendees: 2
  },
  {
    id: 'f1',
    title: 'Baywood Field (public)',
    sport: 'multi',
    address: 'College Baseball Field, SLO',
    lat: ADDRESS_LOOKUP['college baseball field'].lat,
    lng: ADDRESS_LOOKUP['college baseball field'].lng,
    type: 'field',
    attendees: 0
  }
]

export const SAMPLE_FRIENDS: Friend[] = [
  { id: 'friend_jam', name: 'Jam', mutual: true },
  { id: 'maria', name: 'Maria', mutual: true }
]
