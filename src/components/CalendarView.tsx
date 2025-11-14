import React, { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Game, FieldReservation } from '../types'
import { useApp } from '../context/AppContext'
import { getSportColor, getSportIconSVG, capitalize } from '../utils'
import { formatTimeTo12 } from '../utils'
import FieldReservationModal from './FieldReservationModal'

interface CalendarViewProps {
  games: Game[]
  profile: any
}

interface CalendarEvent {
  game: Game
  isHosting: boolean
}

export default function CalendarView({ games, profile }: CalendarViewProps) {
  const { updateGame } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  // weekBaseDate controls which week is shown in the smaller week strip below the month.
  const [weekBaseDate, setWeekBaseDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false)
  const [dayDetailsDate, setDayDetailsDate] = useState<string | null>(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<FieldReservation | null>(null)

  // Get current week (Sunday to Saturday)
  const getCurrentWeek = (base = new Date()) => {
    const now = new Date(base)
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek
    const weekStart = new Date(now.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)

    const weekDays: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  // weekDays follow weekBaseDate so week navigation is independent of month navigation
  const weekDays = getCurrentWeek(weekBaseDate)

  // Responsive breakpoints
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('sm')) // <600
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'md')) // 600-959

  // Get games for current week (or arbitrary provided days)
  const buildEventsMapForDays = (days: Date[]) => {
    const map: { [key: string]: CalendarEvent[] } = {}
    const start = new Date(days[0])
    const end = new Date(days[days.length - 1])
    end.setHours(23, 59, 59, 999)

    games.forEach(game => {
      // For games with dates, check if they're in range
      if (game.date) {
        const gameDate = new Date(game.date + 'T00:00:00')
        if (gameDate >= start && gameDate <= end) {
          const isHosting = game.host === profile?.name
          const isAttending = game.reservedByMe && !isHosting
          if (isHosting || isAttending) {
            const dateStr = game.date
            if (!map[dateStr]) map[dateStr] = []
            map[dateStr].push({ game, isHosting })
          }
        }
      }

      // For fields, check user reservations
      if (game.type === 'field' && game.reservations) {
        game.reservations.forEach(res => {
          if (res.userName === profile?.name) {
            const resDate = new Date(res.date + 'T00:00:00')
            if (resDate >= start && resDate <= end) {
              const dateStr = res.date
              if (!map[dateStr]) map[dateStr] = []
              map[dateStr].push({ game, isHosting: false })
            }
          }
        })
      }
    })
    return map
  }

  const weekGames = useMemo(() => buildEventsMapForDays(weekDays), [games, profile?.name, weekBaseDate])

  // Get all games for calendar month
  const monthGames = useMemo(() => {
    const monthEventMap: { [key: string]: CalendarEvent[] } = {}

    games.forEach(game => {
      // For games with dates
      if (game.date) {
        const gameDate = new Date(game.date + 'T00:00:00')
        const monthYear = `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, '0')}`
        const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

        if (monthYear === currentMonthYear) {
          const isHosting = game.host === profile?.name
          const isAttending = game.reservedByMe && !isHosting

          if (isHosting || isAttending) {
            const dateStr = game.date
            if (!monthEventMap[dateStr]) {
              monthEventMap[dateStr] = []
            }
            monthEventMap[dateStr].push({
              game,
              isHosting
            })
          }
        }
      }

      // For fields, check user reservations
      if (game.type === 'field' && game.reservations) {
        game.reservations.forEach(res => {
          if (res.userName === profile?.name) {
            const resDate = new Date(res.date + 'T00:00:00')
            const monthYear = `${resDate.getFullYear()}-${String(resDate.getMonth() + 1).padStart(2, '0')}`
            const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

            if (monthYear === currentMonthYear) {
              const dateStr = res.date
              if (!monthEventMap[dateStr]) {
                monthEventMap[dateStr] = []
              }
              monthEventMap[dateStr].push({
                game,
                isHosting: false
              })
            }
          }
        })
      }
    })

    return monthEventMap
  }, [games, profile?.name, currentDate])

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }, [currentDate])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDetailsOpen(true)
  }

  const openDayDetails = (dateStr: string) => {
    setDayDetailsDate(dateStr)
    setDayDetailsOpen(true)
  }

  const handleCancelReservation = () => {
    if (selectedEvent?.game) {
      const game = selectedEvent.game
      updateGame(game.id, {
        reservedByMe: false,
        attendees: Math.max(0, (game.attendees || 0) - 1)
      })
      setDetailsOpen(false)
      setSelectedEvent(null)
    }
  }

  const formatDateString = (day: number) => {
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${currentDate.getFullYear()}-${month}-${dayStr}`
  }

  const getDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }

  // Helper to render pill content (sport icon + time/place)
  const renderPill = (ev: CalendarEvent) => {
    const color = getSportColor(ev.game.sport || '')
    const fullWidth = isSm
    
    // For field reservations, get the time from the first matching reservation
    let displayTime = (ev.game as any).time
    if (ev.game.type === 'field' && !displayTime && ev.game.reservations) {
      const userRes = ev.game.reservations.find(res => res.userName === profile?.name)
      if (userRes) {
        displayTime = userRes.time
      }
    }
        const formattedTime = displayTime ? formatTimeTo12(displayTime) : ''
    
    return (
      <Button
        key={ev.game.id}
        size={isSm ? 'medium' : 'small'}
        fullWidth={fullWidth}
        variant="contained"
        sx={{
          backgroundColor: ev.isHosting ? '#ffffffff' : '#1976D2',
          border: ev.isHosting ? `0.5px solid #1976D2` : 'none',
          color: ev.isHosting ? '#000' : '#fff',
          textTransform: 'none',
          fontSize: isSm ? '0.95rem' : '0.95rem',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          whiteSpace: 'normal',
          textAlign: 'left',
          py: isSm ? 1 : 0.5,
          '&:hover': {
            backgroundColor: ev.isHosting ? '#ffffffff' : '#1976D2'
          }
        }}
        onClick={() => handleEventClick(ev)}
      >
        {/* sport icon from SVG */}
        <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center' }}>
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(getSportIconSVG(ev.game.sport || ''))}`}
            alt={ev.game.sport}
            style={{ width: 28, height: 28, borderRadius: 4 }}
          />
        </Box>
        <Box sx={{ textAlign: 'left', ml: 1, flex: 1 }}>
          <div style={{ fontSize: isSm ? '0.95rem' : '0.75rem', fontWeight: isSm ? 600 : 500, color: ev.isHosting ? '#000' : '#fff'}}>{capitalize(ev.game.sport || '')}</div>
          {/* Show time if available, otherwise date */}
              {formattedTime ? (
                <div style={{ fontSize: isSm ? '0.85rem' : '0.65rem', color: ev.isHosting ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }}>{formattedTime}</div>
              ) : (
                ev.game.date && <div style={{ fontSize: isSm ? '0.85rem' : '0.65rem', color: ev.isHosting ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }}>{ev.game.date}</div>
              )}
        </Box>
      </Button>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>

      {/* Calendar View - responsive: month (large), 2-week (md), 1-week stacked (sm) */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {/* Unified Month and Week Navigation Header */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {/* Month Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => {
                const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                setCurrentDate(newDate)
                // Also update weekBaseDate to fall within the new month (first day of month)
                setWeekBaseDate(newDate)
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '200px', textAlign: 'center' }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                setCurrentDate(newDate)
                // Also update weekBaseDate to fall within the new month (first day of month)
                setWeekBaseDate(newDate)
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

         
        </Stack>

        {/* Responsive grid */}
        {isSm ? (
          /* Mobile: stacked week list (responsive to week navigation) */
          <Stack spacing={1}>
            {weekDays.map((day, idx) => {
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
              const dayEvents = weekGames[dateStr] || []
              const evDate = day ? new Date(day.toDateString()) : null
              const isPast = evDate ? evDate < new Date(new Date().toDateString()) : false
              return (
                <Paper key={idx} sx={{ p: 1, opacity: isPast ? 0.6 : 1, backgroundColor: isPast ? '#fafafa' : '#fff' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: isPast ? '#999' : '#000' }}>{getDayName(day)} - {day.toLocaleDateString()}</Typography>
                  {dayEvents.slice(0, 2).map(ev => (
                    <Box key={ev.game.id} sx={{ mt: 1 }}>{renderPill(ev)}</Box>
                  ))}
                  {dayEvents.length > 2 && (
                    <Button size="small" onClick={() => openDayDetails(dateStr)}>+{dayEvents.length - 2} more</Button>
                  )}
                </Paper>
              )
            })}
          </Stack>
        ) : isMd ? (
          /* Medium: two-week grid */
          (() => {
            const start = new Date(weekDays[0])
            const twoWeek: Date[] = []
            for (let i = 0; i < 14; i++) {
              const d = new Date(start)
              d.setDate(start.getDate() + i)
              twoWeek.push(d)
            }
            const twoWeekMap = buildEventsMapForDays(twoWeek)
            return (
              <Grid container spacing={0.5}>
                {twoWeek.map((day, idx) => {
                  const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
                  const dayEvents = twoWeekMap[dateStr] || []
                  return (
                    <Grid item xs={12 / 7} key={idx}>
                      <Paper sx={{ aspectRatio: '1', p: 0.5, overflow: 'auto' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{day.getDate()}</Typography>
                        <Stack spacing={0.3} sx={{ mt: 0.5 }}>
                          {dayEvents.slice(0, 3).map(ev => renderPill(ev))}
                          {dayEvents.length > 3 && <Button size="small" onClick={() => openDayDetails(dateStr)}>+{dayEvents.length - 3} more</Button>}
                        </Stack>
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            )
          })()
        ) : (
          /* Large: month grid */
          <>
            {/* Day Headers */}
            <Grid container spacing={0.5} sx={{ mb: 1 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Grid item xs={12 / 7} key={day}>
                  <Box sx={{ textAlign: 'center', fontWeight: 'bold', py: 1 }}>
                    {day}
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={0.5}>
              {calendarDays.map((day, idx) => {
                const dateStr = day ? formatDateString(day) : null
                const dayEvents = dateStr ? monthGames[dateStr] || [] : []

                return (
                  <Grid item xs={12 / 7} key={idx}>
                    <Paper
                      sx={{
                        aspectRatio: '1',
                        p: 0.5,
                        backgroundColor: day ? '#fff' : '#f5f5f5',
                        border: '0.5px solid #e0e0e0',
                        overflow: 'auto',
                        maxHeight: '150px'
                      }}
                    >
                      {day && (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 'bold',
                              mb: 0.5,
                              color: new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() ? '#1976d2' : '#000'
                            }}
                          >
                            {day}
                          </Typography>

                          <Stack spacing={0.3} sx={{ flex: 1, overflow: 'auto' }}>
                            {dayEvents.map((event, eventIdx) => {
                              const evDate = event.game.date ? new Date(event.game.date + 'T00:00:00') : null
                              const isPast = evDate ? evDate < new Date(new Date().toDateString()) : false
                              return (
                                <Box key={eventIdx} sx={{ opacity: isPast ? 0.5 : 1, mt: 0.4 }}>
                                  {renderPill(event)}
                                </Box>
                              )
                            })}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          </>
        )}
      </Paper>

      {/* Day Details Modal (list of events for a day) */}
      <Dialog open={dayDetailsOpen} onClose={() => setDayDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Events on {dayDetailsDate}</DialogTitle>
        <DialogContent>
          {dayDetailsDate && ((monthGames[dayDetailsDate] || weekGames[dayDetailsDate]) || []).map(ev => (
            <Box key={ev.game.id} sx={{ mb: 1 }}>
              {renderPill(ev)}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDayDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent?.isHosting ? 'Hosting' : 'Attending'}: {selectedEvent?.game.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedEvent?.game && (
            <Stack spacing={2}>
              {/* Sport */}
              <Box>
                <Chip
                  label={`Sport: ${capitalize(selectedEvent.game.sport || '')}`}
                  size="small"
                  color="primary"
                  
                />
              </Box>

              {/* Date */}
              {selectedEvent.game.date && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" color="primary" />
                  <Typography variant="body2">{selectedEvent.game.date}</Typography>
                </Box>
              )}

              {selectedEvent.game.time && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" color="primary" />
                  <Typography variant="body2">{formatTimeTo12(selectedEvent.game.time)}</Typography>
                </Box>
              )}

              {/* Location */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <LocationOnIcon fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Location
                  </Typography>
                  <Typography variant="body2">{selectedEvent.game.address}</Typography>
                </Box>
              </Box>

              {/* Host */}
              {selectedEvent.game.host && (
                <Typography variant="body2">
                  <strong>Host:</strong> {selectedEvent.game.host}
                </Typography>
              )}

              {/* Attendees */}
              {selectedEvent.game.attendees !== undefined && (
                <Typography variant="body2">
                  <strong>Attendees:</strong> {selectedEvent.game.attendees}
                </Typography>
              )}

              {selectedEvent.game.skill && (
                <Typography variant="body2">
                  <strong>Level:</strong> {selectedEvent.game.skill}
                </Typography>
              )}

              {/* Show Field Reservations */}
              {selectedEvent.game.type === 'field' && selectedEvent.game.reservations && selectedEvent.game.reservations.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Reservations
                  </Typography>
                  <List sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}>
                    {selectedEvent.game.reservations.map(res => (
                      <ListItem key={res.id} dense>
                        <ListItemText
                          primary={`${res.date} at ${res.time}`}
                          secondary={`${res.userName}${res.notes ? ` - ${res.notes}` : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedEvent?.game.type === 'field' && (
            <>
              {selectedEvent.game.reservations?.some(res => res.userName === profile?.name) ? (
                <Button
                  onClick={() => {
                    const userRes = selectedEvent.game.reservations?.find(res => res.userName === profile?.name)
                    if (userRes) {
                      setSelectedReservation(userRes)
                      setShowReservationModal(true)
                    }
                  }}
                  color="primary"
                  variant="contained"
                >
                  Edit Reservation
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setSelectedReservation(null)
                    setShowReservationModal(true)
                  }}
                  color="primary"
                  variant="contained"
                >
                  Reserve Time
                </Button>
              )}
            </>
          )}
         
        </DialogActions>
      </Dialog>

      {/* Field Reservation Modal */}
      {selectedEvent?.game && (
        <FieldReservationModal
          open={showReservationModal}
          onClose={() => {
            setShowReservationModal(false)
            setSelectedReservation(null)
          }}
          field={selectedEvent.game}
        />
      )}
    </Box>
  )
}
