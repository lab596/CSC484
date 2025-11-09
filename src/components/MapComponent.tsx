import React, { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Game } from '../types'
import { getSportColor } from '../utils'

interface MapComponentProps {
  games: Game[]
  selectedGameId: string | null
  onSelectGame: (id: string) => void
}

// Fix Leaflet's default icon path
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

const DEFAULT_CENTER = [35.2828, -120.6596] as [number, number]

export default function MapComponent({ games, selectedGameId, onSelectGame }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = L.map(mapContainer.current).setView(DEFAULT_CENTER, 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.current)

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when games change
  useEffect(() => {
    if (!map.current) return

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => {
      map.current?.removeLayer(marker)
    })
    markersRef.current = {}

    // Add new markers
    games.forEach(game => {
      if (!game.lat || !game.lng) return

      const svgString = createSvgPin(game)
      const svgIcon = L.divIcon({
        html: svgString,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
        className: 'custom-marker'
      })

      const marker = L.marker([game.lat, game.lng], { icon: svgIcon })
        .bindPopup(game.title)
        .on('click', () => onSelectGame(game.id))
        .addTo(map.current)

      markersRef.current[game.id] = marker

      // Highlight selected marker
      if (game.id === selectedGameId) {
        marker.openPopup()
      }
    })
  }, [games, selectedGameId, onSelectGame])

  return (
    <Box
      ref={mapContainer}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 400,
        '& .leaflet-container': {
          fontFamily: 'inherit'
        }
      }}
    />
  )
}

// Sport emoji mapping
function getSportEmoji(sport: string): string {
  const emojiMap: { [key: string]: string } = {
    soccer: '⚽',
    football: '🏈',
    basketball: '🏀',
    baseball: '⚾',
    tennis: '🎾',
    volleyball: '🏐',
    badminton: '🏸',
    cricket: '🏏',
    hockey: '🏒',
    golf: '⛳',
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊',
    boxing: '🥊',
    yoga: '🧘',
    pilates: '🤸',
    fitness: '💪',
    climbing: '🧗',
    skating: '🛹',
    frisbee: '🥏'
  }
  return emojiMap[sport.toLowerCase()] || '⚽'
}

// Create SVG pin with sport emoji
function createSvgPin(game: Game): string {
  const color = getSportColor(game.sport)
  const emoji = getSportEmoji(game.sport)

  return `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pinGradient-${game.id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkenColor(color, 0.2)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M16 0C9.37 0 4 5.37 4 12c0 8 12 28 12 28s12-20 12-28c0-6.63-5.37-12-12-12z" 
            fill="url(#pinGradient-${game.id})" 
            stroke="white" 
            stroke-width="1"/>
      <circle cx="16" cy="12" r="7" fill="white" opacity="0.9"/>
      <text x="16" y="15" text-anchor="middle" font-size="14" dominant-baseline="middle">
        ${emoji}
      </text>
    </svg>
  `
}

function darkenColor(color: string, amount: number): string {
  const c = parseInt(color.slice(1), 16)
  const r = Math.max(0, (c >> 16) - 50)
  const g = Math.max(0, ((c >> 8) & 0xff) - 50)
  const b = Math.max(0, (c & 0xff) - 50)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
}
