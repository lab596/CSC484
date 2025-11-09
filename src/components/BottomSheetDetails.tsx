import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Paper,
  IconButton
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventIcon from '@mui/icons-material/Event'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import CloseIcon from '@mui/icons-material/Close'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Game } from '../types'
import { useApp } from '../context/AppContext'

interface BottomSheetDetailsProps {
  game: Game
  onClose: () => void
}

export default function BottomSheetDetails({ game, onClose }: BottomSheetDetailsProps) {
  const { updateGame } = useApp()
  const [isMinimized, setIsMinimized] = useState(false)

  const handleReserve = () => {
    updateGame(game.id, {
      reservedByMe: !game.reservedByMe,
      attendees: game.attendees + (game.reservedByMe ? -1 : 1)
    })
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: 450,
        zIndex: 999,
        maxHeight: isMinimized ? 60 : '70vh',
        overflow: isMinimized ? 'hidden' : 'auto',
        transition: 'max-height 0.3s ease-in-out',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 2
        }}
      >
        {/* Header with icon buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: isMinimized ? 0 : 2
          }}
        >
          <Typography variant="h6" sx={{ flex: 1 }}>{game.title}</Typography>
          <Stack direction="row" gap={0.5}>
            <IconButton
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
              sx={{ color: '#1976d2' }}
            >
              {isMinimized ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: '#d32f2f' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {!isMinimized && (
          <>
            {/* Game Details */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
              <Stack spacing={1.5}>
                {game.sport && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Sport:
                    </Typography>
                    <Chip
                      label={game.sport}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                )}

                {game.date && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <EventIcon fontSize="small" color="primary" />
                    <Typography variant="body2">{game.date}</Typography>
                  </Box>
                )}

                {game.skill && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FitnessCenterIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Skill: <strong>{game.skill}</strong>
                    </Typography>
                  </Box>
                )}

                {game.host && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Host: <strong>{game.host}</strong>
                    </Typography>
                  </Box>
                )}

                {game.attendees && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <GroupIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Attendees: <strong>{game.attendees}</strong>
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Location */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <LocationOnIcon fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Location
                  </Typography>
                  <Typography variant="body2">{game.address}</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Action Buttons */}
            <Stack direction="row" gap={1}>
              <Button
                variant="contained"
                color={game.reservedByMe ? 'error' : 'success'}
                fullWidth
                onClick={handleReserve}
              >
                {game.reservedByMe ? 'Cancel Reservation' : 'Reserve Spot'}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Paper>
  )
}
