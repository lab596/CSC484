import React, { useState, useCallback, useEffect } from 'react'
import {
  TextField,
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography
} from '@mui/material'
import { fetchAddressSuggestions, AddressSuggestion } from '../utils'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (lat: number, lng: number) => void
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
  onSelect
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

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
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        label="Address"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="e.g., City Park, SLO"
        autoComplete="off"
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 200,
            overflow: 'auto',
            mt: 0.5
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List>
              {suggestions.map((suggestion, idx) => (
                <ListItemButton
                  key={idx}
                  selected={activeIndex === idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
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
      )}
    </Box>
  )
}
