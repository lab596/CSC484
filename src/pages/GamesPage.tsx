import React, { useState, useMemo } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Tab,
  Tabs,
  Paper,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EventIcon from '@mui/icons-material/Event'
import PersonIcon from '@mui/icons-material/Person'
import { useApp } from '../context/AppContext'
import { Game } from '../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`game-tabpanel-${index}`}
      aria-labelledby={`game-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}

export default function GamesPage() {
  const { games, profile, initialized, deleteGame } = useApp()
  const [tabValue, setTabValue] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)

  // Games hosted by me
  const hostedGames = useMemo(
    () => games.filter(g => g.host === profile?.name),
    [games, profile?.name]
  )

  // Games I'm attending (either reserved by me, or hosted by someone else)
  const attendingGames = useMemo(
    () => games.filter(g => g.reservedByMe || g.host !== profile?.name),
    [games, profile?.name]
  )

  // Group games by date for calendar view
  const gamesByDate = useMemo(() => {
    const grouped: { [date: string]: Game[] } = {}
    attendingGames.forEach(game => {
      const date = game.date || 'No Date'
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(game)
    })
    
    // Add field reservations to the calendar
    games.forEach(field => {
      if (field.type === 'field' && field.reservations) {
        field.reservations.forEach(res => {
          if (res.userName === profile?.name) {
            if (!grouped[res.date]) {
              grouped[res.date] = []
            }
            // Create a reservation entry that looks like a game
            const reservationEntry: Game = {
              id: res.id,
              title: `${field.title} at ${res.time}`,
              sport: field.sport,
              address: field.address,
              lat: field.lat,
              lng: field.lng,
              date: res.date,
              host: field.host,
              type: 'field',
              attendees: 1,
              reservedByMe: true
            }
            grouped[res.date].push(reservationEntry)
          }
        })
      }
    })
    
    // Sort by date
    return Object.entries(grouped).sort((a, b) => {
      if (a[0] === 'No Date') return 1
      if (b[0] === 'No Date') return -1
      return a[0].localeCompare(b[0])
    })
  }, [attendingGames, games, profile?.name])

  const handleDeleteClick = (game: Game) => {
    setGameToDelete(game)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (gameToDelete) {
      deleteGame(gameToDelete.id)
      setDeleteDialogOpen(false)
      setGameToDelete(null)
    }
  }

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Hosting" id="game-tab-0" aria-controls="game-tabpanel-0" />
          <Tab label="Attending" id="game-tab-1" aria-controls="game-tabpanel-1" />
        </Tabs>
      </Paper>

      {/* Hosting Tab */}
      <TabPanel value={tabValue} index={0}>
        {hostedGames.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">You're not hosting any games yet</Typography>
          </Box>
        ) : (
          <List>
            {hostedGames.map(game => (
              <Card key={game.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {game.title}
                      </Typography>
                      <Stack direction="row" gap={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<EventIcon />}
                          label={game.date || 'No date'}
                          size="small"
                          variant="outlined"
                        />
                        <Chip label={game.sport} size="small" color="primary" />
                        <Chip label={`${game.attendees} attendees`} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="textSecondary">
                        {game.address}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(game)}
                  >
                    Cancel Game
                  </Button>
                </CardActions>
              </Card>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Attending Calendar Tab */}
      <TabPanel value={tabValue} index={1}>
        {attendingGames.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">No games to attend yet</Typography>
          </Box>
        ) : (
          <Box>
            {gamesByDate.map(([date, dateGames]) => (
              <Box key={date} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1976d2',
                    mb: 1.5,
                    pl: 1,
                    borderLeft: '4px solid #1976d2'
                  }}
                >
                  {date === 'No Date' ? 'No Date Set' : date}
                </Typography>

                <Stack gap={1.5} sx={{ pl: 1 }}>
                  {dateGames.map(game => (
                    <Card key={game.id} sx={{ backgroundColor: '#fff' }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 0.5 }}>
                              {game.title}
                            </Typography>
                            <Stack direction="row" gap={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                              <Chip label={game.sport} size="small" color="primary" variant="outlined" />
                              {game.skill && (
                                <Chip label={`Level: ${game.skill}`} size="small" variant="outlined" />
                              )}
                            </Stack>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 0.5 }}>
                              <PersonIcon sx={{ fontSize: 16, color: 'textSecondary' }} />
                              <Typography variant="body2" color="textSecondary">
                                Hosted by {game.host}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {game.address}
                            </Typography>
                          </Box>
                          {game.reservedByMe && (
                            <Chip
                              label="Attending"
                              color="success"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Cancel Game</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to cancel "{gameToDelete?.title}"? This will remove it from the map and all players will be notified.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Keep Game</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Cancel Game
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

