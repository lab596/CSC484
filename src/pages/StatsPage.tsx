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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Modal
} from '@mui/material'
import { keyframes } from '@mui/system'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import type { SelectChangeEvent } from '@mui/material/Select'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useApp } from '../context/AppContext'
import { Stats } from '../types'
import { IconButton } from '@mui/material'

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
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'minutesPlayed', label: 'Minutes Played', type: 'number', min: 0 },
    { id: 'positionPlayed', label: 'Position / Role', type: 'text' },
    { id: 'points', label: 'Points', type: 'number', min: 0 },
    { id: 'rebounds', label: 'Rebounds', type: 'number', min: 0 },
    { id: 'assists', label: 'Assists', type: 'number', min: 0 },
    { id: 'steals', label: 'Steals', type: 'number', min: 0 },
    { id: 'blocks', label: 'Blocks', type: 'number', min: 0 },
    { id: 'turnovers', label: 'Turnovers', type: 'number', min: 0 },
    { id: 'threePointers', label: '3 Pointers Made', type: 'number', min: 0 },
    { id: 'threePointersAttempted', label: '3 Pointers Attempted', type: 'number', min: 0 },
    { id: 'freeThrowsMade', label: 'Free Throws Made', type: 'number', min: 0 },
    { id: 'freeThrowsAttempted', label: 'Free Throws Attempted', type: 'number', min: 0 },
    { id: 'plusMinus', label: 'Plus/Minus', type: 'number' }
  ],
  soccer: [
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'minutesPlayed', label: 'Minutes Played', type: 'number', min: 0 },
    { id: 'positionPlayed', label: 'Position / Role', type: 'text' },
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
    { id: 'opponent', label: 'Opponent', type: 'text' },
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
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'positionPlayed', label: 'Position / Role', type: 'text' },
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
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'minutesPlayed', label: 'Minutes Played', type: 'number', min: 0 },
    { id: 'positionPlayed', label: 'Position / Role', type: 'text' },
    { id: 'kills', label: 'Kills', type: 'number', min: 0 },
    { id: 'digs', label: 'Digs', type: 'number', min: 0 },
    { id: 'volleyballBlocks', label: 'Blocks', type: 'number', min: 0 },
    { id: 'acesServe', label: 'Aces', type: 'number', min: 0 },
    { id: 'volleyballAssists', label: 'Assists', type: 'number', min: 0 },
    { id: 'receptionErrors', label: 'Reception Errors', type: 'number', min: 0 }
  ],
  badminton: [
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'minutesPlayed', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'pointsScored', label: 'Points Scored', type: 'number', min: 0 },
    { id: 'winners', label: 'Winners', type: 'number', min: 0 },
    { id: 'unforcedErrors', label: 'Unforced Errors', type: 'number', min: 0 },
    { id: 'gamesWon', label: 'Games Won', type: 'number', min: 0 },
    { id: 'gamesLost', label: 'Games Lost', type: 'number', min: 0 }
  ],
  boxing: [
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'roundsCompleted', label: 'Rounds Completed', type: 'number', min: 0 },
    { id: 'punchesThrown', label: 'Punches Thrown', type: 'number', min: 0 },
    { id: 'punchesConnected', label: 'Punches Connected', type: 'number', min: 0 },
    { id: 'knockdowns', label: 'Knockdowns', type: 'number', min: 0 },
    { id: 'focusMitts', label: 'Focus Mitts (rounds)', type: 'number', min: 0 }
  ],
  climbing: [
    { id: 'routesDone', label: 'Routes Completed', type: 'number', min: 0 },
    { id: 'routesFailed', label: 'Routes Failed', type: 'number', min: 0 },
    { id: 'maxGrade', label: 'Max Grade Attempted', type: 'text', helperText: 'e.g., 5.10a' },
    { id: 'durationMinutes', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'prHeight', label: 'Personal Record Height (m)', type: 'number', min: 0, step: 0.1 }
  ],
  cricket: [
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'runsScored', label: 'Runs Scored', type: 'number', min: 0 },
    { id: 'ballsFaced', label: 'Balls Faced', type: 'number', min: 0 },
    { id: 'wicketsTaken', label: 'Wickets Taken', type: 'number', min: 0 },
    { id: 'runsConceded', label: 'Runs Conceded', type: 'number', min: 0 },
    { id: 'overbowled', label: 'Overs Bowled', type: 'number', min: 0, step: 0.1 }
  ],
  cycling: [
    { id: 'distance', label: 'Distance (km)', type: 'number', min: 0, step: 0.1 },
    { id: 'duration', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'averageSpeed', label: 'Average Speed (km/h)', type: 'number', min: 0, step: 0.1 },
    { id: 'elevationGain', label: 'Elevation Gain (m)', type: 'number', min: 0 },
    { id: 'maxSpeed', label: 'Max Speed (km/h)', type: 'number', min: 0, step: 0.1 }
  ],
  fitness: [
    { id: 'workoutType', label: 'Workout Type', type: 'text', helperText: 'e.g., Strength, Cardio, HIIT' },
    { id: 'duration', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'caloriesBurned', label: 'Calories Burned', type: 'number', min: 0 },
    { id: 'exerciseCount', label: 'Exercises Completed', type: 'number', min: 0 },
    { id: 'maxWeight', label: 'Max Weight Lifted (kg)', type: 'number', min: 0, step: 0.1 }
  ],
  football: [
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'minutesPlayed', label: 'Minutes Played', type: 'number', min: 0 },
    { id: 'positionPlayed', label: 'Position / Role', type: 'text' },
    { id: 'touchdowns', label: 'Touchdowns', type: 'number', min: 0 },
    { id: 'passingYards', label: 'Passing Yards', type: 'number', min: 0 },
    { id: 'rushingYards', label: 'Rushing Yards', type: 'number', min: 0 },
    { id: 'tackles', label: 'Tackles', type: 'number', min: 0 }
  ],
  frisbee: [
    { id: 'opponent', label: 'Opponent / Team', type: 'text' },
    { id: 'pointsScored', label: 'Points Scored', type: 'number', min: 0 },
    { id: 'pointsAllowed', label: 'Points Allowed', type: 'number', min: 0 },
    { id: 'breaksCompleted', label: 'Breaks Completed', type: 'number', min: 0 },
    { id: 'turnovers', label: 'Turnovers', type: 'number', min: 0 }
  ],
  golf: [
    { id: 'opponent', label: 'Course / Opponent', type: 'text' },
    { id: 'score', label: 'Score', type: 'number' },
    { id: 'holesCompleted', label: 'Holes Completed', type: 'number', min: 0, max: 18 },
    { id: 'birdies', label: 'Birdies', type: 'number', min: 0 },
    { id: 'eagles', label: 'Eagles', type: 'number', min: 0 },
    { id: 'bogeys', label: 'Bogeys', type: 'number', min: 0 }
  ],
  hockey: [
    { id: 'opponent', label: 'Opponent', type: 'text' },
    { id: 'minutesPlayed', label: 'Minutes Played', type: 'number', min: 0 },
    { id: 'goals', label: 'Goals', type: 'number', min: 0 },
    { id: 'assists', label: 'Assists', type: 'number', min: 0 },
    { id: 'shots', label: 'Shots', type: 'number', min: 0 },
    { id: 'hitsReceived', label: 'Hits Received', type: 'number', min: 0 }
  ],
  pilates: [
    { id: 'duration', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'exerciseCount', label: 'Exercises Completed', type: 'number', min: 0 },
    { id: 'difficulty', label: 'Difficulty Level', type: 'text', helperText: 'e.g., Beginner, Intermediate, Advanced' },
    { id: 'coreExercises', label: 'Core Exercises', type: 'number', min: 0 },
    { id: 'flexibility', label: 'Flexibility Focus (Yes/No)', type: 'text' }
  ],
  skating: [
    { id: 'type', label: 'Skating Type', type: 'text', helperText: 'e.g., Ice, Roller, Inline' },
    { id: 'distance', label: 'Distance (km)', type: 'number', min: 0, step: 0.1 },
    { id: 'duration', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'tricksAttempted', label: 'Tricks Attempted', type: 'number', min: 0 },
    { id: 'tricksLanded', label: 'Tricks Landed', type: 'number', min: 0 }
  ],
  swimming: [
    { id: 'distance', label: 'Distance (meters)', type: 'number', min: 0 },
    { id: 'duration', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'strokeType', label: 'Primary Stroke', type: 'text', helperText: 'e.g., Freestyle, Backstroke, Breaststroke' },
    { id: 'lapsCompleted', label: 'Laps Completed', type: 'number', min: 0 },
    { id: 'poolLength', label: 'Pool Length (meters)', type: 'number', min: 0 }
  ],
  yoga: [
    { id: 'duration', label: 'Duration (minutes)', type: 'number', min: 0 },
    { id: 'styleType', label: 'Yoga Style', type: 'text', helperText: 'e.g., Vinyasa, Hatha, Yin' },
    { id: 'flowCount', label: 'Sun Salutations / Flows', type: 'number', min: 0 },
    { id: 'standingPoses', label: 'Standing Poses', type: 'number', min: 0 },
    { id: 'balancingPoses', label: 'Balancing Poses Held', type: 'number', min: 0 }
  ],
  default: [
    { id: 'statOne', label: 'Custom Stat 1', type: 'number' },
    { id: 'statTwo', label: 'Custom Stat 2', type: 'number' },
    { id: 'highlight', label: 'Highlight', type: 'text', helperText: 'Describe a standout moment' }
  ]
}

const humanize = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const rotatingBorder = keyframes`
  0% {
    border-top-color: rgba(0, 217, 255, 0.8);
    border-right-color: rgba(0, 217, 255, 0.2);
    border-bottom-color: rgba(0, 217, 255, 0.2);
    border-left-color: rgba(0, 217, 255, 0.2);
  }
  25% {
    border-top-color: rgba(0, 217, 255, 0.2);
    border-right-color: rgba(0, 217, 255, 0.8);
    border-bottom-color: rgba(0, 217, 255, 0.2);
    border-left-color: rgba(0, 217, 255, 0.2);
  }
  50% {
    border-top-color: rgba(0, 217, 255, 0.2);
    border-right-color: rgba(0, 217, 255, 0.2);
    border-bottom-color: rgba(0, 217, 255, 0.8);
    border-left-color: rgba(0, 217, 255, 0.2);
  }
  75% {
    border-top-color: rgba(0, 217, 255, 0.2);
    border-right-color: rgba(0, 217, 255, 0.2);
    border-bottom-color: rgba(0, 217, 255, 0.2);
    border-left-color: rgba(0, 217, 255, 0.8);
  }
  100% {
    border-top-color: rgba(0, 217, 255, 0.8);
    border-right-color: rgba(0, 217, 255, 0.2);
    border-bottom-color: rgba(0, 217, 255, 0.2);
    border-left-color: rgba(0, 217, 255, 0.2);
  }
`

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
  const { games, stats, initialized, addStat, deleteStat, profile } = useApp()
  const [tabValue, setTabValue] = useState(0)
  const [selectedGameId, setSelectedGameId] = useState('')
  const [note, setNote] = useState('')
  const [result, setResult] = useState<'W' | 'L' | 'D' | ''>('')
  const [performanceRating, setPerformanceRating] = useState<number>(7)
  const [energyLevel, setEnergyLevel] = useState<number>(6)
  const [extraMetrics, setExtraMetrics] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statToDelete, setStatToDelete] = useState<Stats | null>(null)
  const [selectedSportStats, setSelectedSportStats] = useState<typeof sportInsights[0] | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [statToEdit, setStatToEdit] = useState<Stats | null>(null)
  const [editedMetrics, setEditedMetrics] = useState<Record<string, string>>({})
  const [readoutDialogOpen, setReadoutDialogOpen] = useState(false)
  const [statToReadout, setStatToReadout] = useState<Stats | null>(null)

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

  const handleDeleteClick = (stat: Stats) => {
    setStatToDelete(stat)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (statToDelete) {
      deleteStat(statToDelete.id)
      setDeleteDialogOpen(false)
      setStatToDelete(null)
    }
  }

  const handleEditClick = (stat: Stats) => {
    setStatToEdit(stat)
    const metrics: Record<string, string> = {}
    if (stat.performanceRating) metrics.performanceRating = String(stat.performanceRating)
    if (stat.energyLevel) metrics.energyLevel = String(stat.energyLevel)
    if (stat.note) metrics.note = stat.note
    if (stat.extraMetrics) {
      Object.entries(stat.extraMetrics).forEach(([key, value]) => {
        metrics[key] = String(value)
      })
    }
    setEditedMetrics(metrics)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!statToEdit) return

    const updated: Stats = {
      ...statToEdit,
      performanceRating: editedMetrics.performanceRating ? Number(editedMetrics.performanceRating) : statToEdit.performanceRating,
      energyLevel: editedMetrics.energyLevel ? Number(editedMetrics.energyLevel) : statToEdit.energyLevel,
      note: editedMetrics.note || statToEdit.note,
      extraMetrics: statToEdit.extraMetrics
    }

    // Rebuild extraMetrics from edited values (only sport-specific metrics)
    const newExtraMetrics: Record<string, string | number> = {}
    Object.entries(editedMetrics).forEach(([key, value]) => {
      if (!['performanceRating', 'energyLevel', 'note'].includes(key) && value) {
        newExtraMetrics[key] = Number.isNaN(Number(value)) ? value : Number(value)
      }
    })
    updated.extraMetrics = Object.keys(newExtraMetrics).length > 0 ? newExtraMetrics : undefined

    // Update the stat
    const statIndex = stats.findIndex(s => s.id === statToEdit.id)
    if (statIndex >= 0) {
      const newStats = [...stats]
      newStats[statIndex] = updated
      // Note: This assumes there's an updateStat method in AppContext
      // For now, we'll delete and re-add
      deleteStat(statToEdit.id)
      addStat(updated)
    }

    setEditDialogOpen(false)
    setStatToEdit(null)
    setEditedMetrics({})
  }

  const handleReadoutClick = (stat: Stats) => {
    setStatToReadout(stat)
    setReadoutDialogOpen(true)
  }

  const handleResetForm = () => {
    setSelectedGameId('')
    setNote('')
    setResult('')
    setPerformanceRating(7)
    setEnergyLevel(6)
    setExtraMetrics({})
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

    return true
  }

  const handleSaveStats = () => {
    if (!selectedGame || !note.trim()) {
      alert('Select a game you attended and enter notes.')
      return
    }

    if (performanceRating < 1 || performanceRating > 10) {
      alert('Performance rating must be between 1 and 10.')
      return
    }

    if (!validateMetricInputs()) {
      return
    }

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
      result: (result as 'W' | 'L' | 'D' | undefined) || undefined,
      performanceRating,
      note: note.trim(),
      time: Date.now(),
      rebounds: typeof metricsToPersist.rebounds === 'number' ? metricsToPersist.rebounds : undefined,
      threePointers: typeof metricsToPersist.threePointers === 'number' ? metricsToPersist.threePointers : undefined,
      saves: typeof metricsToPersist.saves === 'number' ? metricsToPersist.saves : undefined,
      opponent: (extraMetrics.opponent as string)?.trim() || undefined,
      venueType: (extraMetrics.venueType as 'Home' | 'Away' | 'Neutral') || undefined,
      minutesPlayed: extraMetrics.minutesPlayed ? Number(extraMetrics.minutesPlayed) : undefined,
      position: (extraMetrics.positionPlayed as string)?.trim() || undefined,
      energyLevel,
      mood: (extraMetrics.mood as 'Great' | 'Good' | 'Okay' | 'Tired' | 'Injured') || undefined,
      weather: (extraMetrics.weather as string)?.trim() || undefined,
      extraMetrics: Object.keys(metricsToPersist).length > 0 ? metricsToPersist : undefined
    }

    addStat(stat)
    handleResetForm()
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

  const isCompetitiveSport = (sport: string) => {
    return ['basketball', 'soccer', 'tennis', 'baseball', 'volleyball'].includes(sport)
  }

  const StatCharacterWindow = ({ sportData }: { sportData: typeof sportInsights[0] }) => {
    const winRate = sportData.count > 0 
      ? ((sportData.wins / sportData.count) * 100).toFixed(1)
      : 0

    return (
      <Modal
        open={!!sportData}
        onClose={() => setSelectedSportStats(null)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card sx={{ width: '90%', maxWidth: 600 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {sportData.sport === 'other' ? 'Other Sports' : humanize(sportData.sport)}
              </Typography>
              <Button
                onClick={() => setSelectedSportStats(null)}
                variant="text"
                size="small"
                sx={{ minWidth: 'auto' }}
              >
                ✕
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      AVERAGE RATING
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 0.5 }}>
                      {sportData.averageRating ? `${sportData.averageRating.toFixed(1)}/10` : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      SESSIONS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {sportData.count}
                    </Typography>
                  </Box>
                </Grid>

                {isCompetitiveSport(sportData.sport) && (
                  <>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                          WIN RATE
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                          {winRate}%
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                          RECORD
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={`W ${sportData.wins}`} 
                            sx={{ 
                              backgroundColor: sportData.wins > sportData.losses && sportData.wins > sportData.draws ? '#4caf50' : 'transparent',
                              color: sportData.wins > sportData.losses && sportData.wins > sportData.draws ? '#fff' : 'inherit',
                              border: sportData.wins > sportData.losses && sportData.wins > sportData.draws ? 'none' : '1px solid #ccc'
                            }}
                          />
                          <Chip 
                            label={`L ${sportData.losses}`} 
                            sx={{ 
                              backgroundColor: sportData.losses > sportData.wins && sportData.losses > sportData.draws ? '#f44336' : 'transparent',
                              color: sportData.losses > sportData.wins && sportData.losses > sportData.draws ? '#fff' : 'inherit',
                              border: sportData.losses > sportData.wins && sportData.losses > sportData.draws ? 'none' : '1px solid #ccc'
                            }}
                          />
                          <Chip 
                            label={`D ${sportData.draws}`} 
                            sx={{ 
                              backgroundColor: sportData.draws > sportData.wins && sportData.draws > sportData.losses ? '#2196f3' : 'transparent',
                              color: sportData.draws > sportData.wins && sportData.draws > sportData.losses ? '#fff' : 'inherit',
                              border: sportData.draws > sportData.wins && sportData.draws > sportData.losses ? 'none' : '1px solid #ccc'
                            }}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>

              {sportData.metrics.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Performance Metrics
                    </Typography>
                    <Stack spacing={1.5}>
                      {sportData.metrics.slice(0, 8).map(metric => {
                        const avgVal = metric.count > 0 ? metric.total / metric.count : 0
                        const maxPossible = Math.max(100, metric.total)
                        const percentage = (avgVal / maxPossible) * 100
                        
                        return (
                          <Box key={metric.id}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="body2">{metric.label}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {metric.count > 1 ? `${avgVal.toFixed(1)} avg` : metric.total}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(percentage, 100)}
                              sx={{ height: 6, borderRadius: '4px' }}
                            />
                          </Box>
                        )
                      })}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Modal>
    )
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
      <Paper sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Log Stats" id="stats-tab-0" aria-controls="stats-tabpanel-0" />
          <Tab label="Insights" id="stats-tab-1" aria-controls="stats-tabpanel-1" />
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#f5f5f5' }}>
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
                  {['basketball', 'soccer', 'tennis', 'baseball', 'volleyball'].includes(sportKey) && (
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
                  )}

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

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  endIcon={<SaveIcon />}
                  onClick={handleSaveStats}
                  disabled={!selectedGame || !note.trim() || (isCompetitiveSport(selectedGame?.sport || '') && !result)}
                  fullWidth
                >
                  Save Stats Entry
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UndoIcon />}
                  onClick={handleResetForm}
                  color="error"
                  size="small"
                >
                  Clear
                </Button>
              </Stack>
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
                <ListItem 
                  key={stat.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: 2,
                    marginBottom: 1,
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <ListItemText
                    primary={stat.gameTitle}
                    primaryTypographyProps={{
                      sx: {
                        paddingBottom: 1,
                        borderBottom: '2px solid #1976d2',
                        width: 'calc(100% + 100px)',
                        marginRight: '-100px',
                        paddingRight: '100px'
                      }
                    }}
                    secondary={
                      <>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.5, mt: 1 }}>
                          {typeof stat.performanceRating === 'number' && (
                            <Chip label={`Performance: ${stat.performanceRating}/10`} size="small" variant="outlined" />
                          )}
                          {typeof stat.energyLevel === 'number' && (
                            <Chip label={`Energy: ${stat.energyLevel}/10`} size="small" variant="outlined" />
                          )}
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
                  <Stack direction="row" spacing={0} sx={{ ml: 'auto', flexShrink: 0 }}>
                    <IconButton
                      edge="end"
                      aria-label="view"
                      onClick={() => handleReadoutClick(stat)}
                      color="info"
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditClick(stat)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(stat)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
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
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Snapshot
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip label={`Entries: ${overallMetrics?.totalEntries ?? stats.length}`} color="primary" variant="outlined" />
                    <Chip label={`Sports Logged: ${overallMetrics?.gamesLogged ?? '-'}`} color="primary" variant="outlined" />
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
                  </Stack>
                </CardContent>
              </Card>

              {sportInsights.map(summary => (
                <Card 
                  key={summary.sport}
                  sx={{
                    position: 'relative'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {summary.sport === 'other' ? 'Other Sports' : humanize(summary.sport)}
                        </Typography>
                        {isCompetitiveSport(summary.sport) && (
                          <Stack direction="row" spacing={0.5}>
                            <Chip 
                              label={`W${summary.wins}`} 
                              size="small" 
                              sx={{ 
                                backgroundColor: summary.wins > summary.losses && summary.wins > summary.draws ? '#4caf50' : 'transparent',
                                color: summary.wins > summary.losses && summary.wins > summary.draws ? '#fff' : 'inherit',
                                border: summary.wins > summary.losses && summary.wins > summary.draws ? 'none' : '1px solid #ccc',
                                height: '24px'
                              }}
                            />
                            <Chip 
                              label={`L${summary.losses}`} 
                              size="small" 
                              sx={{ 
                                backgroundColor: summary.losses > summary.wins && summary.losses > summary.draws ? '#f44336' : 'transparent',
                                color: summary.losses > summary.wins && summary.losses > summary.draws ? '#fff' : 'inherit',
                                border: summary.losses > summary.wins && summary.losses > summary.draws ? 'none' : '1px solid #ccc',
                                height: '24px'
                              }}
                            />
                            <Chip 
                              label={`D${summary.draws}`} 
                              size="small" 
                              sx={{ 
                                backgroundColor: summary.draws > summary.wins && summary.draws > summary.losses ? '#2196f3' : 'transparent',
                                color: summary.draws > summary.wins && summary.draws > summary.losses ? '#fff' : 'inherit',
                                border: summary.draws > summary.wins && summary.draws > summary.losses ? 'none' : '1px solid #ccc',
                                height: '24px'
                              }}
                            />
                          </Stack>
                        )}
                      </Stack>
                      <Button
                        onClick={() => setSelectedSportStats(summary)}
                        variant="outlined"
                        size="small"
                        startIcon={<SportsEsportsIcon />}
                      >
                        View
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={`${summary.count} log${summary.count > 1 ? 's' : ''}`} color="primary" variant="outlined" />
                      {summary.averageRating !== null && (
                        <Chip label={`Avg Rating ${summary.averageRating.toFixed(1)}/10`} variant="outlined" />
                      )}
                      {(() => {
                        const energyMetric = summary.metrics.find(m => m.id === 'energyLevel')
                        if (!energyMetric) return null
                        const avgEnergy = energyMetric.count > 0 ? energyMetric.total / energyMetric.count : 0
                        return <Chip label={`Avg Energy ${avgEnergy.toFixed(1)}/10`} variant="outlined" />
                      })()}
                    </Stack>
                    {summary.metrics.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {summary.metrics.map(metric => (
                          <Chip
                            key={metric.id}
                            label={`${metric.label}: ${metric.total}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              ))}

              {recentHighlights.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                    Recent Highlights
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                    {recentHighlights.map(stat => (
                      <Box
                        key={stat.id}
                        sx={{
                          flex: '1 1 calc(33.333% - 12px)',
                          minWidth: '140px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: 1.5,
                          backgroundColor: '#fafafa',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          },
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, mr: 1 }}>
                            {stat.gameTitle}
                          </Typography>
                          {typeof stat.performanceRating === 'number' && (
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1976d2', whiteSpace: 'nowrap' }}>
                              {stat.performanceRating}/10
                            </Typography>
                          )}
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', mb: 0.5, gap: 0.5 }}>
                          {stat.result && (
                            <Chip
                              label={stat.result === 'W' ? 'W' : stat.result === 'L' ? 'L' : 'D'}
                              size="small"
                              color={stat.result === 'W' ? 'success' : stat.result === 'L' ? 'error' : 'default'}
                              sx={{ height: '20px' }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#999', mb: 0.5 }}>
                          {new Date(stat.time).toLocaleDateString()} {new Date(stat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999' }} display="block">
                          {humanize(stat.sport || 'Other')}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
          </Box>
        </TabPanel>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setStatToDelete(null)
        }}
      >
        <DialogTitle>Delete Stat Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{statToDelete?.gameTitle}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setStatToDelete(null)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setStatToEdit(null)
          setEditedMetrics({})
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Stat Entry - {statToEdit?.gameTitle}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {/* Required Fields */}
            <Box>
              <Typography variant="caption" color="textSecondary">
                Performance Rating (1-10) *
              </Typography>
              <Slider
                value={Number(editedMetrics.performanceRating) || statToEdit?.performanceRating || 7}
                onChange={(_, value) => setEditedMetrics({ ...editedMetrics, performanceRating: String(value) })}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">
                Energy Level (1-10) *
              </Typography>
              <Slider
                value={Number(editedMetrics.energyLevel) || statToEdit?.energyLevel || 6}
                onChange={(_, value) => setEditedMetrics({ ...editedMetrics, energyLevel: String(value) })}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes *"
              value={editedMetrics.note || ''}
              onChange={(e) => setEditedMetrics({ ...editedMetrics, note: e.target.value })}
              required
            />

            {/* Sport-Specific Optional Metrics */}
            {statToEdit?.sport && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Sport-Specific Metrics (Optional)
                </Typography>
                {SPORT_METRICS[normalizeSportKey(statToEdit.sport)]?.map(def => {
                  const value = editedMetrics[def.id] ?? ''
                  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
                    setEditedMetrics({ ...editedMetrics, [def.id]: e.target.value })
                  }

                  if (def.type === 'select' && def.options) {
                    return (
                      <TextField
                        key={def.id}
                        select
                        fullWidth
                        label={def.label}
                        value={value}
                        onChange={handleChange}
                      >
                        <MenuItem value="">None</MenuItem>
                        {def.options.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )
                  }

                  const numberProps = def.type === 'number'
                    ? { type: 'number', inputProps: { min: def.min, max: def.max, step: def.step ?? 1 } }
                    : { type: 'text' as const }

                  return (
                    <TextField
                      key={def.id}
                      fullWidth
                      label={def.label}
                      value={value}
                      onChange={handleChange}
                      helperText={def.helperText}
                      {...numberProps}
                    />
                  )
                })}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDialogOpen(false)
              setStatToEdit(null)
              setEditedMetrics({})
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            color="primary"
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={readoutDialogOpen}
        onClose={() => {
          setReadoutDialogOpen(false)
          setStatToReadout(null)
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Stat Details
          <IconButton
            onClick={() => {
              setReadoutDialogOpen(false)
              setStatToReadout(null)
            }}
            sx={{ marginRight: -1 }}
          >
            ×
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {statToReadout && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  GAME
                </Typography>
                <Typography variant="body1">{statToReadout.gameTitle}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  SPORT
                </Typography>
                <Typography variant="body1">{humanize(statToReadout.sport || 'N/A')}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  DATE & TIME
                </Typography>
                <Typography variant="body1">{new Date(statToReadout.time).toLocaleString()}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  PERFORMANCE RATING
                </Typography>
                <Typography variant="body1">{statToReadout.performanceRating || 'N/A'}/10</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  ENERGY LEVEL
                </Typography>
                <Typography variant="body1">{statToReadout.energyLevel || 'N/A'}/10</Typography>
              </Box>

              {statToReadout.result && (
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                    RESULT
                  </Typography>
                  <Typography variant="body1">
                    {statToReadout.result === 'W' ? 'Win' : statToReadout.result === 'L' ? 'Loss' : 'Draw'}
                  </Typography>
                </Box>
              )}

              {statToReadout.extraMetrics && Object.keys(statToReadout.extraMetrics).length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                      SPORT METRICS
                    </Typography>
                    <Stack spacing={1}>
                      {Object.entries(statToReadout.extraMetrics).map(([key, value]) => (
                        <Stack key={key} direction="row" justifyContent="space-between">
                          <Typography variant="body2">{formatMetricLabel(key)}:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}

              {statToReadout.note && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      NOTES
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {statToReadout.note}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {selectedSportStats && <StatCharacterWindow sportData={selectedSportStats} />}
    </Box>
  )
}
