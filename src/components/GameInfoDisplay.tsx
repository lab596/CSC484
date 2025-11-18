import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventIcon from '@mui/icons-material/Event'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SportsIcon from '@mui/icons-material/Sports'
import { Game } from '../types'
import { capitalize, formatTimeTo12 } from '../utils'

interface GameInfoDisplayProps {
  game: Game
  compact?: boolean
  hideLocation?: boolean
}

export default function GameInfoDisplay({ game, compact = false, hideLocation = false }: GameInfoDisplayProps) {
  return (
    <Stack spacing={compact ? 0.5 : 0.8}>
      {/* Sport */}
      {game.sport && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <SportsIcon sx={{ fontSize: compact ? 16 : 18, color: '#1976d2', minWidth: compact ? 16 : 18 }} />
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', fontSize: compact ? '0.9rem' : '1rem' }}>
            <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: 500 }}>
              Sport:
            </Typography>
            <Typography variant={compact ? 'caption' : 'body2'}>
              {capitalize(game.sport)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Date */}
      {game.date && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <EventIcon sx={{ fontSize: compact ? 16 : 18, color: '#1976d2', minWidth: compact ? 16 : 18 }} />
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', fontSize: compact ? '0.9rem' : '1rem' }}>
            <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: 500 }}>
              Date:
            </Typography>
            <Typography variant={compact ? 'caption' : 'body2'}>
              {game.date}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Time */}
      {game.time && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <AccessTimeIcon sx={{ fontSize: compact ? 16 : 18, color: '#1976d2', minWidth: compact ? 16 : 18 }} />
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', fontSize: compact ? '0.9rem' : '1rem' }}>
            <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: 500 }}>
              Time:
            </Typography>
            <Typography variant={compact ? 'caption' : 'body2'}>
              {formatTimeTo12(game.time)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Skill Level */}
      {game.skill && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FitnessCenterIcon sx={{ fontSize: compact ? 16 : 18, color: '#1976d2', minWidth: compact ? 16 : 18 }} />
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', fontSize: compact ? '0.9rem' : '1rem' }}>
            <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: 500 }}>
              Skill:
            </Typography>
            <Typography variant={compact ? 'caption' : 'body2'}>
              {capitalize(game.skill)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Host */}
      {game.host && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <PersonIcon sx={{ fontSize: compact ? 16 : 18, color: '#1976d2', minWidth: compact ? 16 : 18 }} />
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', fontSize: compact ? '0.9rem' : '1rem' }}>
            <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: 500 }}>
              Host:
            </Typography>
            <Typography variant={compact ? 'caption' : 'body2'}>
              {capitalize(game.host)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Attendees */}
      {game.attendees !== undefined && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <GroupIcon sx={{ fontSize: compact ? 16 : 18, color: '#1976d2', minWidth: compact ? 16 : 18 }} />
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', fontSize: compact ? '0.9rem' : '1rem' }}>
            <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: 500 }}>
              Attendees:
            </Typography>
            <Typography variant={compact ? 'caption' : 'body2'}>
              {game.attendees}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Location */}
      {game.address && !hideLocation && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <LocationOnIcon sx={{ fontSize: compact ? 16 : 18, color: '#1976d2', minWidth: compact ? 16 : 18, mt: 0.3 }} />
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', fontSize: compact ? '0.9rem' : '1rem' }}>
            <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: 500 }}>
              Location:
            </Typography>
            <Typography variant={compact ? 'caption' : 'body2'}>
              {game.address}
            </Typography>
          </Box>
        </Box>
      )}
    </Stack>
  )
}
