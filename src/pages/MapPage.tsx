import React, { useEffect, useRef, useState } from 'react'
import { Box, AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../context/AppContext'
import { Game } from '../types'
import MapComponent from '../components/MapComponent'
import AddGameModal from '../components/AddGameModal'
import BottomSheetDetails from '../components/BottomSheetDetails'

export default function MapPage() {
  const { games, profile, initialized } = useApp()
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [sportFilter, setSportFilter] = useState<string>('all')
  const mapRef = useRef(null)

  const handleReset = () => {
    if (confirm('Reset prototype state? This clears all local data.')) {
      localStorage.clear()
      location.reload()
    }
  }

  // Filter games based on sport
  const filteredGames = sportFilter === 'all' 
    ? games 
    : games.filter(g => g.sport === sportFilter)

  const selectedGame = games.find(g => g.id === selectedGameId)

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top App Bar */}
      <AppBar 
        position="static"
        sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          zIndex: 100
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => setOpenAddModal(true)}
            >
              Add
            </Button>
            <Button 
              color="inherit" 
              startIcon={<RefreshIcon />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>

          {/* Sport Filter Dropdown */}
          <TextField
            select
            size="small"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            sx={{ 
              width: 140,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.8)'
                }
              },
              '& .MuiSvgIcon-root': {
                color: 'white'
              }
            }}
          >
            <MenuItem value="all">All Sports</MenuItem>
            <MenuItem value="soccer">Soccer</MenuItem>
            <MenuItem value="basketball">Basketball</MenuItem>
            <MenuItem value="tennis">Tennis</MenuItem>
            <MenuItem value="multi">Multi-Sport</MenuItem>
          </TextField>
        </Toolbar>
      </AppBar>

      {/* Map Component - takes remaining space */}
      <Box ref={mapRef} sx={{ flex: 1, position: 'relative', minHeight: '500px' }}>
        <MapComponent 
          games={filteredGames}
          selectedGameId={selectedGameId}
          onSelectGame={setSelectedGameId}
        />
      </Box>

      {/* Add Game Modal */}
      <AddGameModal 
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
      />

      {/* Bottom Sheet - Game Details */}
      {selectedGame && (
        <BottomSheetDetails 
          game={selectedGame}
          onClose={() => setSelectedGameId(null)}
        />
      )}
    </Box>
  )
}
