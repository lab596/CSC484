import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Paper,
  Stack,
  Chip,
  Divider,
  Slider,
  Grid
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import SaveIcon from '@mui/icons-material/Save'
import { useApp } from '../context/AppContext'
import { Stats } from '../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

type MetricInputType = 'number' | 'select' | 'text'

interface MetricDefinition {
  id: string
  label: string
  type: MetricInputType
  options?: Array<{ label: string; value: string }>
  min?: number
  max?: number
  step?: number
  helperText?: string
}

interface MetricAggregate {
  label: string
  total: number
  count: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}

const VENUE_OPTIONS: Array<{ label: string; value: 'Home' | 'Away' | 'Neutral' }> = [
  { label: 'Home', value: 'Home' },
  { label: 'Away', value: 'Away' },
  { label: 'Neutral', value: 'Neutral' }
]

const MOOD_OPTIONS: Array<{ label: string; value: 'Great' | 'Good' | 'Okay' | 'Tired' | 'Injured' }> = [
  { label: 'Great', value: 'Great' },
  { label: 'Good', value: 'Good' },
  { label: 'Okay', value: 'Okay' },
  { label: 'Tired', value: 'Tired' },
  { label: 'Injured', value: 'Injured' }
]

const METRIC_LABELS: Record<string, string> = {
  points: 'Points',
  rebounds: 'Rebounds',
  assists: 'Assists',
  steals: 'Steals',
  blocks: 'Blocks',
  turnovers: 'Turnovers',
  fieldGoalsMade: 'FGM',
  fieldGoalsAttempted: 'FGA',
  threePointers: '3PM',
  threePointersAttempted: '3PA',
  freeThrowsMade: 'FTM',
  freeThrowsAttempted: 'FTA',
  plusMinus: '+/-',
  goals: 'Goals',
  soccerAssists: 'Assists',
  shotsOnTarget: 'Shots on Target',
  chancesCreated: 'Chances Created',
  passesCompleted: 'Passes Completed',
  tackles: 'Tackles',
  interceptions: 'Interceptions',
  saves: 'Saves',
  distanceCovered: 'Distance (km)',
  cleanSheet: 'Clean Sheet',
  setsWon: 'Sets Won',
  setsLost: 'Sets Lost',
  aces: 'Aces',
  doubleFaults: 'Double Faults',
  winners: 'Winners',
  unforcedErrors: 'Unforced Errors',
  breakPointsWon: 'Break Points Won',
  breakPointsFaced: 'Break Points Faced',
  firstServePct: '1st Serve %',
  hits: 'Hits',
  runs: 'Runs',
  rbis: 'RBIs',
  strikeouts: 'Strikeouts',
  homeRuns: 'Home Runs',
  inningsPitched: 'Innings Pitched',
  pitchesThrown: 'Pitches Thrown',
  walks: 'Walks',
  distance: 'Distance (km)',
  duration: 'Duration (min)',
  averagePace: 'Avg Pace',
  heartRate: 'Avg Heart Rate',
  elevationGain: 'Elevation Gain (m)',
  kills: 'Kills',
  digs: 'Digs',
  volleyballBlocks: 'Blocks',
  acesServe: 'Aces',
  volleyballAssists: 'Assists',
  receptionErrors: 'Reception Errors'
}

const SPORT_METRICS: Record<string, MetricDefinition[]> = {
  basketball: [
    { id: 'points', label: 'Points', type: 'number', min: 0 },
    { id: 'rebounds', label: 'Rebounds', type: 'number', min: 0 },
    { id: 'assists', label: 'Assists', type: 'number', min: 0 },
    { id: 'steals', label: 'Steals', type: 'number', min: 0 },
    { id: 'blocks', label: 'Blocks', type: 'number', min: 0 },
    { id: 'turnovers', label: 'Turnovers', type: 'number', min: 0 },
    { id: 'fieldGoalsMade', label: 'Field Goals Made', type: 'number', min: 0 },
    { id: 'fieldGoalsAttempted', label: 'Field Goals Attempted', type: 'number', min: 0 },
    { id: 'threePointers', label: '3 Pointers Made', type: 'number', min: 0 },
    { id: 'threePointersAttempted', label: '3 Pointers Attempted', type: 'number', min: 0 },
    { id: 'freeThrowsMade', label: 'Free Throws Made', type: 'number', min: 0 },
    { id: 'freeThrowsAttempted', label: 'Free Throws Attempted', type: 'number', min: 0 },
    { id: 'plusMinus', label: 'Plus/Minus', type: 'number' }
  ],
  soccer: [
    { id: 'goals', label: 'Goals', type: 'number', min: 0 },
    { id: 'soccerAssists', label: 'Assists', type: 'number', min: 0 },
    { id: 'shotsOnTarget', label: 'Shots on Target', type: 'number', min: 0 },
    { id: 'chancesCreated', label: 'Chances Created', type: 'number', min: 0 },
    { id: 'passesCompleted', label: 'Passes Completed', type: 'number', min: 0 },
    { id: 'tackles', label: 'Tackles', type: 'number', min: 0 },
    { id: 'interceptions', label: 'Interceptions', type: 'number', min: 0 },
    { id: 'saves', label: 'Saves', type: 'number', min: 0 },
    { id: 'distanceCovered', label: 'Distance Covered (km)', type: 'number', min: 0, step: 0.1 },
    {
      id: 'cleanSheet',
      label: 'Clean Sheet',
      type: 'select',
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
      ]
    }
  ],
  tennis: [
    { id: 'setsWon', label: 'Sets Won', type: 'number', min: 0 },
    { id: 'setsLost', label: 'Sets Lost', type: 'number', min: 0 },
    { id: 'aces', label: 'Aces', type: 'number', min: 0 },
    { id: 'doubleFaults', label: 'Double Faults', type: 'number', min: 0 },
    { id: 'winners', label: 'Winners', type: 'number', min: 0 },
    { id: 'unforcedErrors', label: 'Unforced Errors', type: 'number', min: 0 },
    { id: 'breakPointsWon', label: 'Break Points Won', type: 'number', min: 0 },
    { id: 'breakPointsFaced', label: 'Break Points Faced', type: 'number', min: 0 },
    { id: 'firstServePct', label: 'First Serve Percentage', type: 'number', min: 0, max: 100 }
  ],
  baseball: [
    { id: 'hits', label: 'Hits', type: 'number', min: 0 },
    { id: 'runs', label: 'Runs', type: 'number', min: 0 },
    { id: 'rbis', label: 'RBIs', type: 'number', min: 0 },
    { id: 'strikeouts', label: 'Strikeouts', type: 'number', min: 0 },
    { id: 'homeRuns', label: 'Home Runs', type: 'number', min: 0 },
    { id: 'inningsPitched', label: 'Innings Pitched', type: 'number', min: 0, step: 0.1 },
    { id: 'pitchesThrown', label: 'Pitches Thrown', type: 'number', min: 0 },
    { id: 'walks', label: 'Walks', type: 'number', min: 0 }
  ],
  running: [
    { id: 'distance', label: 'Distance (km)', type: 'number', min: 0, step: 0.1 },
    { id: 'duration', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'averagePace', label: 'Average Pace (min/km)', type: 'number', min: 0, step: 0.01 },
    { id: 'heartRate', label: 'Average Heart Rate', type: 'number', min: 0 },
    { id: 'elevationGain', label: 'Elevation Gain (meters)', type: 'number', min: 0 }
  ],
  volleyball: [
    { id: 'kills', label: 'Kills', type: 'number', min: 0 },
    { id: 'digs', label: 'Digs', type: 'number', min: 0 },
    { id: 'volleyballBlocks', label: 'Blocks', type: 'number', min: 0 },
    { id: 'acesServe', label: 'Aces', type: 'number', min: 0 },
    { id: 'volleyballAssists', label: 'Assists', type: 'number', min: 0 },
    { id: 'receptionErrors', label: 'Reception Errors', type: 'number', min: 0 }
  ],
  default: [
    { id: 'statOne', label: 'Custom Stat 1', type: 'number' },
    { id: 'statTwo', label: 'Custom Stat 2', type: 'number' },
    { id: 'highlight', label: 'Highlight', type: 'text', helperText: 'Describe a standout moment' }
  ]
}

const humanize = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const normalizeSportKey = (sport?: string) => {
  if (!sport) return 'other'
  return sport.toLowerCase()
}

const formatMetricLabel = (id: string) => {
  if (METRIC_LABELS[id]) {
    return METRIC_LABELS[id]
  }
  return humanize(id)
}

export default function StatsPage() {
  const { games, stats, initialized, addStat, profile } = useApp()
  const [tabValue, setTabValue] = useState(0)
  const [selectedGameId, setSelectedGameId] = useState('')
  const [note, setNote] = useState('')
  const [result, setResult] = useState<'W' | 'L' | 'D' | ''>('')
  const [performanceRating, setPerformanceRating] = useState<number>(7)
  const [opponent, setOpponent] = useState('')
  const [venueType, setVenueType] = useState<'Home' | 'Away' | 'Neutral' | ''>('')
  const [minutesPlayed, setMinutesPlayed] = useState('')
  const [positionPlayed, setPositionPlayed] = useState('')
  const [energyLevel, setEnergyLevel] = useState<number>(6)
  const [mood, setMood] = useState<'Great' | 'Good' | 'Okay' | 'Tired' | 'Injured' | ''>('')
  const [weather, setWeather] = useState('')
  const [extraMetrics, setExtraMetrics] = useState<Record<string, string>>({})

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>
  }

  const attendedGames = useMemo(
    () => games.filter(game => game.reservedByMe || game.host === profile?.name),
    [games, profile?.name]
  )

  const selectedGame = useMemo(
    () => attendedGames.find(game => game.id === selectedGameId) || null,
    [attendedGames, selectedGameId]
  )

  const sportKey = selectedGame ? normalizeSportKey(selectedGame.sport) : 'other'
  const metricDefinitions = SPORT_METRICS[sportKey] || SPORT_METRICS.default

  useEffect(() => {
    setResult('')
    setPerformanceRating(7)
    setOpponent('')
    setVenueType('')
    setMinutesPlayed('')
    setPositionPlayed('')
    setEnergyLevel(6)
    setMood('')
    setWeather('')
    setExtraMetrics({})
  }, [selectedGameId])

  const handleMetricChange = (id: string, value: string) => {
    setExtraMetrics(prev => {
      const next = { ...prev }
      if (!value) {
        delete next[id]
      } else {
        next[id] = value
      }
      return next
    })
  }

  const validateMetricInputs = () => {
    for (const def of metricDefinitions) {
      const rawValue = extraMetrics[def.id]
      if (!rawValue) continue
      if (def.type === 'number') {
        const num = Number(rawValue)
        if (Number.isNaN(num)) {
          alert(`Please enter a numeric value for ${def.label}.`)
          return false
        }
        if (typeof def.min === 'number' && num < def.min) {
          alert(`${def.label} cannot be less than ${def.min}.`)
          return false
        }
        if (typeof def.max === 'number' && num > def.max) {
          alert(`${def.label} cannot be greater than ${def.max}.`)
          return false
        }
      }
    }

    if (minutesPlayed) {
      const minutes = Number(minutesPlayed)
      if (Number.isNaN(minutes) || minutes < 0) {
        alert('Minutes played must be a non-negative number.')
        return false
      }
    }

    return true
  }

  const handleSaveStats = () => {
    if (!selectedGame || !note.trim()) {
      alert('Select a game you attended and enter notes.')
      return
    }

    if (!result) {
      alert('Select a result (Win, Loss, or Draw).')
      return
    }

    if (performanceRating < 1 || performanceRating > 10) {
      alert('Performance rating must be between 1 and 10.')
      return
    }

    if (!validateMetricInputs()) {
      return
    }

    const numericMinutes = minutesPlayed ? Number(minutesPlayed) : undefined

    const metricsToPersist: Record<string, string | number> = {}
    metricDefinitions.forEach(def => {
      const rawValue = extraMetrics[def.id]
      if (rawValue === undefined || rawValue === '') return
      if (def.type === 'number') {
        metricsToPersist[def.id] = Number(rawValue)
      } else {
        metricsToPersist[def.id] = rawValue
      }
    })

    const stat: Stats = {
      id: 's' + Date.now(),
      gameId: selectedGame.id,
      gameTitle: selectedGame.title,
      sport: selectedGame.sport,
      result,
      performanceRating,
      note: note.trim(),
      time: Date.now(),
      rebounds: typeof metricsToPersist.rebounds === 'number' ? metricsToPersist.rebounds : undefined,
      threePointers: typeof metricsToPersist.threePointers === 'number' ? metricsToPersist.threePointers : undefined,
      saves: typeof metricsToPersist.saves === 'number' ? metricsToPersist.saves : undefined,
      opponent: opponent.trim() || undefined,
      venueType: venueType || undefined,
      minutesPlayed: numericMinutes,
      position: positionPlayed.trim() || undefined,
      energyLevel,
      mood: mood || undefined,
      weather: weather.trim() || undefined,
      extraMetrics: Object.keys(metricsToPersist).length > 0 ? metricsToPersist : undefined
    }

    addStat(stat)
    setSelectedGameId('')
    setNote('')
    setResult('')
    setPerformanceRating(7)
    setOpponent('')
    setVenueType('')
    setMinutesPlayed('')
    setPositionPlayed('')
    setEnergyLevel(6)
    setMood('')
    setWeather('')
    setExtraMetrics({})
  }

  const latestStatTime = useMemo(() => {
    if (stats.length === 0) {
      return null
    }
    return stats.reduce((latest, stat) => (stat.time > (latest ?? 0) ? stat.time : latest), 0)
  }, [stats])

  const overallMetrics = useMemo(() => {
    if (stats.length === 0) {
      return null
    }

    const uniqueGames = new Set(stats.map(stat => stat.gameId || stat.gameTitle))
    const ratingValues = stats
      .map(stat => (typeof stat.performanceRating === 'number' ? stat.performanceRating : null))
      .filter((value): value is number => value !== null)
    const energyValues = stats
      .map(stat => (typeof stat.energyLevel === 'number' ? stat.energyLevel : null))
      .filter((value): value is number => value !== null)

    const averageRating = ratingValues.length
      ? ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length
      : null
    const averageEnergy = energyValues.length
      ? energyValues.reduce((sum, value) => sum + value, 0) / energyValues.length
      : null

    const record = stats.reduce(
      (acc, stat) => {
        if (stat.result === 'W') acc.wins += 1
        if (stat.result === 'L') acc.losses += 1
        if (stat.result === 'D') acc.draws += 1
        if (stat.mood) {
          acc.moodCounts[stat.mood] = (acc.moodCounts[stat.mood] || 0) + 1
        }
        return acc
      },
      { wins: 0, losses: 0, draws: 0, moodCounts: {} as Record<string, number> }
    )

    const topMood = Object.entries(record.moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    return {
      totalEntries: stats.length,
      gamesLogged: uniqueGames.size,
      averageRating,
      averageEnergy,
      topMood,
      wins: record.wins,
      losses: record.losses,
      draws: record.draws
    }
  }, [stats])

  const sportInsights = useMemo(() => {
    const map = new Map<
      string,
      {
        count: number
        totalRating: number
        ratingCount: number
        wins: number
        losses: number
        draws: number
        metrics: Record<string, MetricAggregate>
      }
    >()

    const accumulate = (
      acc: Record<string, MetricAggregate>,
      id: string,
      label: string,
      value: unknown
    ) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return
      }
      if (!acc[id]) {
        acc[id] = { label, total: 0, count: 0 }
      }
      acc[id].total += value
      acc[id].count += 1
    }

    stats.forEach(stat => {
      const key = normalizeSportKey(stat.sport)
      const entry = map.get(key) || {
        count: 0,
        totalRating: 0,
        ratingCount: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        metrics: {}
      }

      entry.count += 1
      if (typeof stat.performanceRating === 'number') {
        entry.totalRating += stat.performanceRating
        entry.ratingCount += 1
      }
      if (stat.result === 'W') entry.wins += 1
      if (stat.result === 'L') entry.losses += 1
      if (stat.result === 'D') entry.draws += 1

      accumulate(entry.metrics, 'minutesPlayed', 'Minutes Played', stat.minutesPlayed)
      accumulate(entry.metrics, 'energyLevel', 'Energy Level', stat.energyLevel)
      accumulate(entry.metrics, 'rebounds', formatMetricLabel('rebounds'), stat.rebounds)
      accumulate(entry.metrics, 'threePointers', formatMetricLabel('threePointers'), stat.threePointers)
      accumulate(entry.metrics, 'saves', formatMetricLabel('saves'), stat.saves)

      if (stat.extraMetrics) {
        Object.entries(stat.extraMetrics).forEach(([id, value]) => {
          const label = formatMetricLabel(id)
          accumulate(entry.metrics, id, label, value)
        })
      }

      map.set(key, entry)
    })

    return Array.from(map.entries()).map(([sport, data]) => ({
      sport,
      count: data.count,
      averageRating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : null,
      wins: data.wins,
      losses: data.losses,
      draws: data.draws,
      metrics: Object.entries(data.metrics).map(([id, metric]) => ({ id, ...metric }))
    }))
  }, [stats])

  const sortedStats = useMemo(() => [...stats].sort((a, b) => b.time - a.time), [stats])
  const recentHighlights = useMemo(() => sortedStats.slice(0, 3), [sortedStats])

  const renderMetricField = (definition: MetricDefinition) => {
    const value = extraMetrics[definition.id] ?? ''
    const handleChange = (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent<string>
    ) => {
      handleMetricChange(definition.id, event.target.value as string)
    }
    const commonProps = {
      key: definition.id,
      fullWidth: true,
      label: definition.label,
      value,
      onChange: handleChange,
      helperText: definition.helperText || undefined
    }

    if (definition.type === 'select' && definition.options) {
      return (
        <TextField select {...commonProps}>
          {definition.options.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )
    }

    const numberProps = definition.type === 'number'
      ? { type: 'number', inputProps: { min: definition.min, max: definition.max, step: definition.step ?? 1 } }
      : { type: 'text' as const }

    return <TextField {...commonProps} {...numberProps} />
  }

  const renderGeneralInfoChips = (stat: Stats) => {
    const chips: React.ReactNode[] = []
    if (stat.opponent) {
      chips.push(<Chip key="opponent" label={`vs ${stat.opponent}`} size="small" variant="outlined" />)
    }
    if (stat.venueType) {
      chips.push(<Chip key="venue" label={`Venue: ${stat.venueType}`} size="small" variant="outlined" />)
    }
    if (typeof stat.minutesPlayed === 'number') {
      chips.push(<Chip key="minutes" label={`${stat.minutesPlayed} min`} size="small" variant="outlined" />)
    }
    if (stat.position) {
      chips.push(<Chip key="position" label={`Position: ${stat.position}`} size="small" variant="outlined" />)
    }
    if (typeof stat.energyLevel === 'number') {
      chips.push(<Chip key="energy" label={`Energy ${stat.energyLevel}/10`} size="small" variant="outlined" />)
    }
    if (stat.mood) {
      chips.push(<Chip key="mood" label={`Mood: ${stat.mood}`} size="small" variant="outlined" />)
    }
    if (stat.weather) {
      chips.push(<Chip key="weather" label={`Weather: ${stat.weather}`} size="small" variant="outlined" />)
    }
    return chips
  }

  const renderMetricChips = (stat: Stats) => {
    const chips: React.ReactNode[] = []

    if (typeof stat.rebounds === 'number') {
      chips.push(<Chip key="rebounds" label={`Reb: ${stat.rebounds}`} size="small" variant="outlined" />)
    }
    if (typeof stat.threePointers === 'number') {
      chips.push(<Chip key="threePointers" label={`3PM: ${stat.threePointers}`} size="small" variant="outlined" />)
    }
    if (typeof stat.saves === 'number') {
      chips.push(<Chip key="saves" label={`Saves: ${stat.saves}`} size="small" variant="outlined" />)
    }

    if (stat.extraMetrics) {
      Object.entries(stat.extraMetrics).forEach(([id, value]) => {
        if (
          (id === 'rebounds' && typeof stat.rebounds === 'number') ||
          (id === 'threePointers' && typeof stat.threePointers === 'number') ||
          (id === 'saves' && typeof stat.saves === 'number')
        ) {
          return
        }
        const label = formatMetricLabel(id)
        chips.push(
          <Chip
            key={`metric-${id}`}
            label={`${label}: ${value}`}
            size="small"
            variant="outlined"
          />
        )
      })
    }

    return chips
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Log Stats" id="stats-tab-0" aria-controls="stats-tabpanel-0" />
          <Tab label="Insights" id="stats-tab-1" aria-controls="stats-tabpanel-1" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ pb: 10 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Log Stats
              </Typography>
              <TextField
                select
                fullWidth
                label={attendedGames.length === 0 ? 'No attended games available' : 'Select Game'}
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                sx={{ mb: 2 }}
                disabled={attendedGames.length === 0}
              >
                {attendedGames.map(game => (
                  <MenuItem key={game.id} value={game.id}>
                    {game.title} {game.date ? `(${game.date})` : ''}
                  </MenuItem>
                ))}
              </TextField>

              {selectedGame && (
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <TextField
                    select
                    fullWidth
                    label="Result"
                    value={result}
                    onChange={(e) => setResult(e.target.value as 'W' | 'L' | 'D')}
                  >
                    <MenuItem value="W">Win</MenuItem>
                    <MenuItem value="L">Loss</MenuItem>
                    <MenuItem value="D">Draw</MenuItem>
                  </TextField>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Opponent"
                      value={opponent}
                      onChange={(e) => setOpponent(e.target.value)}
                    />
                    <TextField
                      select
                      fullWidth
                      label="Venue"
                      value={venueType}
                      onChange={(e) => setVenueType(e.target.value as 'Home' | 'Away' | 'Neutral' | '')}
                    >
                      <MenuItem value="">
                        <em>Unknown</em>
                      </MenuItem>
                      {VENUE_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      type="number"
                      label="Minutes Played"
                      value={minutesPlayed}
                      onChange={(e) => setMinutesPlayed(e.target.value)}
                      inputProps={{ min: 0 }}
                      fullWidth
                    />
                    <TextField
                      fullWidth
                      label="Position / Role"
                      value={positionPlayed}
                      onChange={(e) => setPositionPlayed(e.target.value)}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Performance Rating (1-10)
                      </Typography>
                      <Slider
                        value={performanceRating}
                        onChange={(_, value) => setPerformanceRating(value as number)}
                        min={1}
                        max={10}
                        step={1}
                        valueLabelDisplay="auto"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Energy Level (1-10)
                      </Typography>
                      <Slider
                        value={energyLevel}
                        onChange={(_, value) => setEnergyLevel(value as number)}
                        min={1}
                        max={10}
                        step={1}
                        valueLabelDisplay="auto"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      select
                      fullWidth
                      label="Mood"
                      value={mood}
                      onChange={(e) => setMood(e.target.value as typeof mood)}
                    >
                      <MenuItem value="">
                        <em>Choose mood</em>
                      </MenuItem>
                      {MOOD_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      label="Weather / Conditions"
                      value={weather}
                      onChange={(e) => setWeather(e.target.value)}
                    />
                  </Stack>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {selectedGame.sport ? `${humanize(selectedGame.sport)} Metrics` : 'Sport Metrics'}
                    </Typography>
                    <Grid container spacing={2}>
                      {metricDefinitions.map(definition => (
                        <Grid item xs={12} sm={6} md={4} key={definition.id}>
                          {renderMetricField(definition)}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Stack>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                placeholder="Capture highlights, takeaways, or areas to improve"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ my: 3 }}
              />

              <Button
                variant="contained"
                endIcon={<SaveIcon />}
                onClick={handleSaveStats}
                disabled={!selectedGame || !note.trim() || !result}
                fullWidth
              >
                Save Stats Entry
              </Button>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Stats History
          </Typography>
          <List>
            {sortedStats.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                No stats logged yet
              </Typography>
            ) : (
              sortedStats.map(stat => (
                <ListItem key={stat.id} divider alignItems="flex-start">
                  <ListItemText
                    primary={stat.gameTitle}
                    secondary={
                      <>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                          {stat.result && (
                            <Chip
                              label={`Result: ${stat.result}`}
                              color={stat.result === 'W' ? 'success' : stat.result === 'L' ? 'error' : 'default'}
                              size="small"
                            />
                          )}
                          {typeof stat.performanceRating === 'number' && (
                            <Chip label={`Rating: ${stat.performanceRating}/10`} size="small" variant="outlined" />
                          )}
                          {renderGeneralInfoChips(stat)}
                          {renderMetricChips(stat)}
                        </Stack>
                        <Typography variant="caption" display="block">
                          {new Date(stat.time).toLocaleString()} {stat.sport ? `• ${humanize(stat.sport)}` : ''}
                        </Typography>
                        {stat.note && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {stat.note}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ pb: 10 }}>
          {stats.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Start logging stats to see insights here
            </Typography>
          ) : (
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Snapshot
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip label={`Entries: ${overallMetrics?.totalEntries ?? stats.length}`} color="primary" variant="outlined" />
                    <Chip label={`Games Logged: ${overallMetrics?.gamesLogged ?? '-'}`} color="primary" variant="outlined" />
                    {latestStatTime && (
                      <Chip
                        label={`Last Update: ${new Date(latestStatTime).toLocaleString()}`}
                        variant="outlined"
                      />
                    )}
                    {(() => {
                      const averageRating = overallMetrics?.averageRating
                      return averageRating !== null && averageRating !== undefined ? (
                      <Chip
                        label={`Avg Rating: ${averageRating.toFixed(1)}/10`}
                        color="success"
                        variant="outlined"
                      />
                      ) : null
                    })()}
                    {(() => {
                      const averageEnergy = overallMetrics?.averageEnergy
                      return averageEnergy !== null && averageEnergy !== undefined ? (
                      <Chip
                        label={`Avg Energy: ${averageEnergy.toFixed(1)}/10`}
                        color="success"
                        variant="outlined"
                      />
                      ) : null
                    })()}
                    <Chip label={`W ${overallMetrics?.wins ?? 0}`} size="small" variant="outlined" />
                    <Chip label={`L ${overallMetrics?.losses ?? 0}`} size="small" variant="outlined" />
                    <Chip label={`D ${overallMetrics?.draws ?? 0}`} size="small" variant="outlined" />
                    {overallMetrics?.topMood && (
                      <Chip label={`Common Mood: ${overallMetrics.topMood}`} size="small" variant="outlined" />
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {sportInsights.map(summary => (
                <Card key={summary.sport}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {summary.sport === 'other' ? 'Other Sports' : humanize(summary.sport)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={`${summary.count} log${summary.count > 1 ? 's' : ''}`} color="success" />
                      {summary.averageRating !== null && (
                        <Chip label={`Avg Rating ${summary.averageRating.toFixed(1)}/10`} variant="outlined" />
                      )}
                      <Chip label={`W ${summary.wins}`} size="small" variant="outlined" />
                      <Chip label={`L ${summary.losses}`} size="small" variant="outlined" />
                      <Chip label={`D ${summary.draws}`} size="small" variant="outlined" />
                    </Stack>
                    {summary.metrics.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {summary.metrics.map(metric => (
                          <Chip
                            key={metric.id}
                            label={`${metric.label}: ${metric.total}${metric.count > 1 ? ` (avg ${(
                              metric.total / metric.count
                            ).toFixed(1)})` : ''}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              ))}

              {recentHighlights.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Recent Highlights
                    </Typography>
                    <Stack spacing={1.5}>
                      {recentHighlights.map(stat => (
                        <Box key={stat.id}>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                            <Chip label={stat.gameTitle} size="small" variant="outlined" />
                            {stat.result && (
                              <Chip
                                label={stat.result === 'W' ? 'Win' : stat.result === 'L' ? 'Loss' : 'Draw'}
                                size="small"
                                color={stat.result === 'W' ? 'success' : stat.result === 'L' ? 'error' : 'default'}
                              />
                            )}
                            {typeof stat.performanceRating === 'number' && (
                              <Chip label={`Rating ${stat.performanceRating}/10`} size="small" variant="outlined" />
                            )}
                            {typeof stat.energyLevel === 'number' && (
                              <Chip label={`Energy ${stat.energyLevel}/10`} size="small" variant="outlined" />
                            )}
                          </Stack>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {new Date(stat.time).toLocaleString()} {stat.sport ? `• ${humanize(stat.sport)}` : ''}
                            {stat.opponent ? ` • vs ${stat.opponent}` : ''}
                          </Typography>
                          {stat.note && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {stat.note}
                            </Typography>
                          )}
                          <Divider sx={{ mt: 1.5 }} />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}
        </Box>
      </TabPanel>
    </Box>
  )
}
