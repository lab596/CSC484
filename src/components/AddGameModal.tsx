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
  Autocomplete
} from '@mui/material'
import { useApp } from '../context/AppContext'
import { Game } from '../types'
import { geocodeAddress, todayOffset, COMMON_SPORTS } from '../utils'
import AddressAutocomplete from './AddressAutocomplete'

interface AddGameModalProps {
  open: boolean
  onClose: () => void
}

export default function AddGameModal({ open, onClose }: AddGameModalProps) {
  const { addGame, profile } = useApp()
  const [itemType, setItemType] = useState<'game' | 'field'>('game')
  const [title, setTitle] = useState('')
  const [sport, setSport] = useState('')
  const [date, setDate] = useState(todayOffset(0))
  const [skill, setSkill] = useState('intermediate')
  const [address, setAddress] = useState('')
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAddressSelect = (lat: number, lng: number) => {
    setSelectedLat(lat)
    setSelectedLng(lng)
  }

  const handleClose = () => {
    setItemType('game')
    setTitle('')
    setSport('')
    setDate(todayOffset(0))
    setSkill('intermediate')
    setAddress('')
    setSelectedLat(null)
    setSelectedLng(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!title || !address || !sport) {
      alert('Please fill in all required fields')
      return
    }

    // For fields, date and skill are optional
    if (itemType === 'game' && !date) {
      alert('Please select a date for the game')
      return
    }

    setLoading(true)
    try {
      let lat = selectedLat
      let lng = selectedLng

      if (!lat || !lng) {
        const pos = await geocodeAddress(address)
        if (!pos) {
          alert('Could not resolve address. Try a different address.')
          setLoading(false)
          return
        }
        lat = pos.lat
        lng = pos.lng
      }

      const newGame: Game = {
        id: 'g' + Date.now(),
        title,
        sport,
        address,
        lat,
        lng,
        date: itemType === 'game' ? date : undefined,
        skill: itemType === 'game' ? skill : undefined,
        host: profile?.name || 'You',
        type: itemType,
        attendees: itemType === 'game' ? 1 : 0,
        reservedByMe: itemType === 'game'
      }

      addGame(newGame)
      handleClose()
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Error creating game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add {itemType === 'game' ? 'Game' : 'Field'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select
            fullWidth
            label="Type"
            value={itemType}
            onChange={(e) => setItemType(e.target.value as 'game' | 'field')}
          >
            <MenuItem value="game">Game</MenuItem>
            <MenuItem value="field">Field/Venue</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label={itemType === 'game' ? 'Game Title' : 'Field Name'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={itemType === 'game' ? 'e.g., Pickup Soccer at City Park' : 'e.g., Downtown Basketball Court'}
          />

          <Autocomplete
            freeSolo
            options={COMMON_SPORTS}
            value={sport || ''}
            onChange={(e, value) => setSport(value || '')}
            onInputChange={(e, value) => setSport(value)}
            inputValue={sport}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sport"
                placeholder="e.g., Soccer, Basketball, Custom Sport..."
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
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                fullWidth
                label="Skill Level"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="all">All Levels</MenuItem>
              </TextField>
            </>
          )}

          <AddressAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={handleAddressSelect}
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
        >
          {loading ? 'Creating...' : `Create ${itemType === 'game' ? 'Game' : 'Field'}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
