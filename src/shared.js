// Shared utilities used across page modules
export const LS_KEYS = {
  GAMES: 'ssma_games',
  FRIENDS: 'ssma_friends',
  FEED: 'ssma_feed',
  STATS: 'ssma_stats',
  PROFILE: 'ssma_profile'
}

export function read(key, fallback){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):fallback }catch(e){return fallback} }
export function write(key, val){ localStorage.setItem(key, JSON.stringify(val)) }
export function todayOffset(n){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10) }
