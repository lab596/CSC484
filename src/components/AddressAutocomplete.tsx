import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  TextField,
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
  Portal
} from '@mui/material'
import { fetchAddressSuggestions, AddressSuggestion } from '../utils'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (lat: number, lng: number) => void
  disabled?: boolean
  error?: boolean
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), wait)
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  disabled = false,
  error = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const textFieldRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const results = await fetchAddressSuggestions(query)
        setSuggestions(results)
        setShowSuggestions(true)
        setActiveIndex(-1)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    fetchSuggestions(newValue)
    
    // Update position for dropdown
    if (textFieldRef.current) {
      const rect = textFieldRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display)
    onSelect(suggestion.lat, suggestion.lng)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) {
          handleSelectSuggestion(suggestions[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setSuggestions([])
        setShowSuggestions(false)
        break
      default:
        break
    }
  }

  return (
    <>
      <Box ref={textFieldRef} sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          disabled={disabled}
          label="Address"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g., City Park, SLO"
          autoComplete="off"
          error={error}
          helperText={disabled ? 'Cannot change location when editing' : (error ? 'Required field' : '')}
          required
          InputLabelProps={{ 
            sx: { '&.MuiInputLabel-asterisk': { color: '#d32f2f' } }
          }}
        />
      </Box>

      {showSuggestions && suggestions.length > 0 && (
        <Portal>
          <Paper
            sx={{
              position: 'fixed',
              top: `${position.top + 8}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 9999,
              maxHeight: 300,
              overflow: 'auto',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {suggestions.map((suggestion, idx) => (
                  <ListItemButton
                    key={idx}
                    selected={activeIndex === idx}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    sx={{ py: 1, px: 2 }}
                  >
                    <ListItemText
                      primary={suggestion.display}
                      secondary={
                        <Typography variant="caption" color="textSecondary">
                          {suggestion.source === 'local' ? 'Local' : 'OpenStreetMap'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Portal>
      )}
    </>
  )
}
