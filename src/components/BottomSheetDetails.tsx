import React, { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Paper
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventIcon from '@mui/icons-material/Event'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
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
    <Drawer
      anchor="bottom"
      open={true}
      onClose={onClose}
      sx={{
        zIndex: 999,
        '& .MuiDrawer-paper': {
          maxHeight: isMinimized ? 60 : '70vh',
          transition: 'max-height 0.3s ease-in-out'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 2,
          overflow: 'auto'
        }}
      >
        {/* Header with minimize button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="h6">{game.title}</Typography>
          <Stack direction="row" gap={1}>
            <Button
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
              variant="outlined"
            >
              {isMinimized ? 'Expand' : 'Minimize'}
            </Button>
            <Button size="small" onClick={onClose} variant="text">
              Close
            </Button>
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
    </Drawer>
  )
}
