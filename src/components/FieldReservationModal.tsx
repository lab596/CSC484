import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Snackbar,
  Alert,
  Typography
} from '@mui/material'
import { useApp } from '../context/AppContext'
import { Game, FieldReservation } from '../types'
import { todayOffset } from '../utils'

interface FieldReservationModalProps {
  open: boolean
  onClose: () => void
  field: Game | null
}

export default function FieldReservationModal({ open, onClose, field }: FieldReservationModalProps) {
  const { profile, updateGame } = useApp()
  const [date, setDate] = useState(todayOffset(0))
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Check if user has existing reservation
  const existingReservation = field?.reservations?.find(
    res => res.userName === (profile?.name || '')
  )

  const handleClose = () => {
    setDate(existingReservation?.date || todayOffset(0))
    setTime(existingReservation?.time || '10:00')
    setNotes(existingReservation?.notes || '')
    onClose()
  }

  // Initialize with existing reservation data if editing
  React.useEffect(() => {
    if (open && existingReservation) {
      setDate(existingReservation.date)
      setTime(existingReservation.time)
      setNotes(existingReservation.notes || '')
    } else if (open) {
      setDate(todayOffset(0))
      setTime('10:00')
      setNotes('')
    }
  }, [open, existingReservation])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  const handleSubmit = async () => {
    if (!date || !time) {
      showToast('Please specify date and time', 'error')
      return
    }

    if (!field) {
      showToast('Field information missing', 'error')
      return
    }

    setLoading(true)
    try {
      let updatedReservations: FieldReservation[] = field.reservations || []

      if (existingReservation) {
        // Update existing reservation
        updatedReservations = updatedReservations.map(res =>
          res.id === existingReservation.id
            ? {
                ...res,
                date,
                time,
                notes: notes || undefined
              }
            : res
        )
        showToast('Reservation updated successfully!', 'success')
      } else {
        // Create new reservation
        const newReservation: FieldReservation = {
          id: 'res' + Date.now(),
          userId: profile?.id || 'user_unknown',
          userName: profile?.name || 'Unknown User',
          date,
          time,
          notes: notes || undefined
        }
        updatedReservations = [...updatedReservations, newReservation]
        showToast('Reserved time slot successfully!', 'success')
      }

      updateGame(field.id, {
        reservations: updatedReservations,
        reservedByMe: true,
        attendees: (field.attendees || 0) + (existingReservation ? 0 : 1)
      })

      handleClose()
    } catch (error) {
      console.error('Error saving reservation:', error)
      showToast('Error saving reservation. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!field) return null

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {existingReservation ? 'Edit Reservation' : 'Reserve Time'} at {field.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {existingReservation 
                ? 'Update your reservation date and time.'
                : 'When do you plan to go? Your reservation will appear on your calendar.'}
            </Typography>

            <TextField
              type="date"
              fullWidth
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="time"
              fullWidth
              label="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Notes (optional)"
              placeholder="e.g., Bringing friends, solo visit, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
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
            disabled={!date || !time || loading}
          >
            {loading ? (existingReservation ? 'Updating...' : 'Reserving...') : (existingReservation ? 'Update Reservation' : 'Reserve Time')}
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
