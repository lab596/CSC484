import React, { useState } from 'react'
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
  Typography
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useApp } from '../context/AppContext'
import { Stats } from '../types'

export default function StatsPage() {
  const { games, stats, initialized, addStat, profile } = useApp()
  const [selectedGameId, setSelectedGameId] = useState('')
  const [note, setNote] = useState('')

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>
  }

  const handleSaveStats = () => {
    if (!selectedGameId || !note.trim()) {
      alert('Select a game and enter stats/notes')
      return
    }

    const game = games.find(g => g.id === selectedGameId)
    const stat: Stats = {
      id: 's' + Date.now(),
      gameId: selectedGameId,
      gameTitle: game?.title || '(unknown)',
      note: note.trim(),
      time: Date.now()
    }

    addStat(stat)
    setSelectedGameId('')
    setNote('')
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Stats Composer */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Log Stats
          </Typography>
          <TextField
            select
            fullWidth
            label="Select Game"
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            sx={{ mb: 2 }}
          >
            {games.map(game => (
              <MenuItem key={game.id} value={game.id}>
                {game.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Score/Notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            endIcon={<SaveIcon />}
            onClick={handleSaveStats}
            disabled={!selectedGameId || !note.trim()}
            fullWidth
          >
            Save Stats
          </Button>
        </CardContent>
      </Card>

      {/* Stats History */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Stats History
      </Typography>
      <List>
        {stats.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            No stats logged yet
          </Typography>
        ) : (
          stats.map(stat => (
            <ListItem key={stat.id} divider>
              <ListItemText
                primary={stat.gameTitle}
                secondary={
                  <>
                    <Typography variant="caption">
                      {new Date(stat.time).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {stat.note}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  )
}
