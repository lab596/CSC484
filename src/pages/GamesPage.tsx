import React from 'react'
import { Box, List, ListItem, ListItemText, Button } from '@mui/material'
import { useApp } from '../context/AppContext'

export default function GamesPage() {
  const { games, initialized } = useApp()

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>
  }

  return (
    <Box sx={{ p: 2 }}>
      <List>
        {games.map(game => (
          <ListItem key={game.id} divider>
            <ListItemText
              primary={game.title}
              secondary={`${game.sport} • ${game.date} • ${game.skill || 'N/A'}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
