import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Box, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../context/AppContext'
import { Game } from '../types'
import MapComponent from '../components/MapComponent'
import AddGameModal from '../components/AddGameModal'
import BottomSheetDetails from '../components/BottomSheetDetails'
import FilterPanel, { Filters } from '../components/FilterPanel'

export default function MapPage() {
  const { games, friends, profile, initialized } = useApp()
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [editGameModalOpen, setEditGameModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    sports: [],
    friendsOnly: false,
    selectedFriendFilters: new Set()
  })

  // Get friend names for the filter panel
  const friendNames = useMemo(() => friends.map(f => f.name), [friends])

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setEditGameModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditGameModalOpen(false)
    setEditingGame(null)
  }

  // Apply filters to games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Type filter
      if (filters.type !== 'all') {
        if (filters.type === 'games' && game.type !== 'game') return false
        if (filters.type === 'fields' && game.type !== 'field') return false
        if (filters.type === 'friends') {
          const hostName = game.host || ''
          if (!friends.some(f => f.name === hostName)) {
            return false
          }
        }
      }

      // Sports filter (case-insensitive)
      if (filters.sports.length > 0) {
        const gameSport = game.sport?.toLowerCase() || ''
        const matchesSport = filters.sports.some(s => s.toLowerCase() === gameSport)
        if (!matchesSport) {
          return false
        }
      }

      // Friends only filter
      if (filters.friendsOnly) {
        const hostName = game.host || ''
        if (!friends.some(f => f.name === hostName)) {
          return false
        }
      }

      // Specific friends filter (when not using friendsOnly toggle)
      if (filters.selectedFriendFilters.size > 0 && !filters.friendsOnly) {
        const hostName = game.host || ''
        if (!filters.selectedFriendFilters.has(hostName)) {
          return false
        }
      }

      return true
    })
  }, [games, friends, filters])

  const selectedGame = games.find(g => g.id === selectedGameId)

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Map Component - fills entire space */}
      <Box sx={{ flex: 1, position: 'relative', width: '100%' }}>
        <MapComponent 
          games={filteredGames}
          selectedGameId={selectedGameId}
          onSelectGame={setSelectedGameId}
        />
      </Box>

      {/* Filter Panel - Top Left */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        friendNames={friendNames}
      />

      {/* Add Activity Button - Top Right */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 500,
          pointerEvents: 'auto'
        }}
      >
        <Button 
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddModal(true)}
          sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
        >
          Add Activity
        </Button>
      </Box>

      {/* Add Activity Modal */}
      <AddGameModal 
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
      />

      {/* Edit Game Modal */}
      <AddGameModal
        open={editGameModalOpen}
        onClose={handleCloseEditModal}
        editingGame={editingGame || undefined}
      />

      {/* Bottom Sheet - Game Details */}
      {selectedGame && (
        <BottomSheetDetails 
          game={selectedGame}
          onClose={() => setSelectedGameId(null)}
          onEditGame={handleEditGame}
        />
      )}
    </Box>
  )
}
