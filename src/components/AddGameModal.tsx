import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Stack,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material'
import { useApp } from '../context/AppContext'
import { Game } from '../types'
import { geocodeAddress, todayOffset, COMMON_SPORTS } from '../utils'
import AddressAutocomplete from './AddressAutocomplete'

interface AddGameModalProps {
  open: boolean
  onClose: () => void
  editingGame?: Game | null
  onGameCreated?: (gameId: string) => void
}

export default function AddGameModal({ open, onClose, editingGame, onGameCreated }: AddGameModalProps) {
  const { addGame, profile, updateGame } = useApp()
  const [itemType, setItemType] = useState<'game' | 'field'>('game')
  const [title, setTitle] = useState('')
  const [sport, setSport] = useState('')
  const [date, setDate] = useState(todayOffset(0))
  const [time, setTime] = useState('10:00')
  const [skill, setSkill] = useState('Intermediate')
  const [address, setAddress] = useState('')
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Initialize form with editing game data
  React.useEffect(() => {
    if (editingGame) {
      setItemType(editingGame.type)
      setTitle(editingGame.title)
      setSport(editingGame.sport)
      setDate(editingGame.date || todayOffset(0))
      setTime(editingGame.time || '10:00')
      setSkill(editingGame.skill || 'Intermediate')
      setAddress(editingGame.address)
      setSelectedLat(editingGame.lat)
      setSelectedLng(editingGame.lng)
    } else {
      // Reset form for new game
      setItemType('game')
      setTitle('')
      setSport('')
      setDate(todayOffset(0))
      setTime('10:00')
      setSkill('Intermediate')
      setAddress('')
      setSelectedLat(null)
      setSelectedLng(null)
    }
    setIsDirty(false)
  }, [editingGame, open])

  const handleAddressSelect = (lat: number, lng: number) => {
    setSelectedLat(lat)
    setSelectedLng(lng)
    setIsDirty(true)
  }

  const handleClose = () => {
    setItemType('game')
    setTitle('')
    setSport('')
    setDate(todayOffset(0))
    setTime('10:00')
    setSkill('Intermediate')
    setAddress('')
    setSelectedLat(null)
    setSelectedLng(null)
    setIsDirty(false)
    setShowValidation(false)
    setToast(null)
    onClose()
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const handleSubmit = async () => {
    if (!title || !address || !sport) {
      setShowValidation(true)
      showToast('Please fill in all required fields', 'error')
      return
    }

    // For fields, date and skill are optional
    if (itemType === 'game' && !date) {
      setShowValidation(true)
      showToast('Please select a date for the game', 'error')
      return
    }

    setLoading(true)
    try {
      let lat = selectedLat
      let lng = selectedLng

      if (!lat || !lng) {
        const pos = await geocodeAddress(address)
        if (!pos) {
          showToast('Could not resolve address. Try a different address.', 'error')
          setLoading(false)
          return
        }
        lat = pos.lat
        lng = pos.lng
      }

      const newGame: Game = {
        id: editingGame?.id || ('g' + Date.now()),
        title,
        sport: editingGame?.sport || sport, // Keep original sport if editing
        address: editingGame?.address || address, // Keep original address if editing
        lat: editingGame?.lat || lat,
        lng: editingGame?.lng || lng,
        date: itemType === 'game' ? date : undefined,
        time: itemType === 'game' ? time : undefined,
        skill: itemType === 'game' ? skill : undefined,
        host: editingGame?.host || profile?.name || 'You',
        type: itemType,
        attendees: editingGame?.attendees || (itemType === 'game' ? 1 : 0),
        reservedByMe: editingGame?.reservedByMe ?? (itemType === 'game'),
        friendHost: editingGame?.friendHost,
        reservations: editingGame?.reservations
      }

      if (editingGame) {
        // Update existing game
        updateGame(editingGame.id, newGame)
        showToast(`${itemType === 'game' ? 'Game' : 'Field'} updated successfully!`, 'success')
      } else {
        // Create new game
        addGame(newGame)
        showToast(`${itemType === 'game' ? 'Game' : 'Field'} created successfully!`, 'success')
        // Notify parent component about the new game
        if (onGameCreated) {
          onGameCreated(newGame.id)
        }
      }
      handleClose()
    } catch (error) {
      console.error('Error creating game:', error)
      showToast('Error creating game. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingGame ? 'Edit' : 'Create'} {itemType === 'game' ? 'Game' : 'Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Type"
              value={itemType}
              onChange={(e) => {
                setItemType(e.target.value as 'game' | 'field')
                setIsDirty(true)
              }}
            >
              <MenuItem value="game">Game</MenuItem>
              <MenuItem value="field">Field/Venue</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label={<span>{itemType === 'game' ? 'Game Title' : 'Field Name'} <span style={{ color: '#d32f2f' }}>*</span></span>}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setIsDirty(true)
              }}
              placeholder={itemType === 'game' ? 'e.g., Pickup Soccer at City Park' : 'e.g., Downtown Basketball Court'}
              error={showValidation && !title}
              helperText={showValidation && !title ? 'Required field' : ''}
              InputLabelProps={{ 
                sx: { whiteSpace: 'normal' }
              }}
            />

            <Autocomplete
              freeSolo
              disabled={!!editingGame}
              options={COMMON_SPORTS}
              value={sport || ''}
              onChange={(e, value) => {
                setSport(value || '')
                setIsDirty(true)
              }}
              onInputChange={(e, value) => {
                setSport(value)
                setIsDirty(true)
              }}
              inputValue={sport}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={<span>Sport <span style={{ color: '#d32f2f' }}>*</span></span>}
                  placeholder="e.g., Soccer, Basketball, Custom Sport..."
                  helperText={editingGame ? 'Cannot change sport when editing' : (showValidation && !sport ? 'Required field' : '')}
                  error={showValidation && !sport}
                  InputLabelProps={{ 
                    sx: { whiteSpace: 'normal' }
                  }}
                />
              )}
            />

            {itemType === 'game' && (
              <>
                <TextField
                  type="date"
                  fullWidth
                  label="Date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setIsDirty(true)
                  }}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  type="time"
                  fullWidth
                  label="Time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value)
                    setIsDirty(true)
                  }}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  select
                  fullWidth
                  label="Skill Level"
                  value={skill}
                  onChange={(e) => {
                    setSkill(e.target.value)
                    setIsDirty(true)
                  }}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="All">All Levels</MenuItem>
                </TextField>
              </>
            )}

            <AddressAutocomplete
              value={address}
              onChange={(newAddress: string) => {
                setAddress(newAddress)
                setIsDirty(true)
              }}
              onSelect={handleAddressSelect}
              disabled={!!editingGame}
              error={showValidation && !address}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!title || !address || !sport || loading}
            sx={{
              cursor: (!title || !address || !sport || loading) ? 'not-allowed' : 'pointer',
              '&:disabled': {
                cursor: 'not-allowed'
              }
            }}
          >
            {loading ? (editingGame ? 'Updating...' : 'Creating...') : `${editingGame ? 'Edit' : 'Create'} ${itemType === 'game' ? 'Game' : 'Field'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={!!toast}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToast(null)} 
          severity={toast?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  )
}
