import React, { useState } from 'react'
import {
  Box,
  Paper,
  Button,
  Popover,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  Divider,
  IconButton
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import { COMMON_SPORTS } from '../utils'

export interface Filters {
  type: 'all' | 'games' | 'fields' | 'friends'
  sports: string[]
  friendsOnly: boolean
  selectedFriendFilters: Set<string>
}

interface FilterPanelProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  friendNames: string[]
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  friendNames
}: FilterPanelProps) {
  const [advancedAnchor, setAdvancedAnchor] = useState<HTMLButtonElement | null>(null)
  const advancedOpen = Boolean(advancedAnchor)

  const handleAdvancedOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAdvancedAnchor(e.currentTarget)
  }

  const handleAdvancedClose = () => {
    setAdvancedAnchor(null)
  }

  const handleTypeChange = (newType: 'all' | 'games' | 'fields' | 'friends') => {
    onFiltersChange({
      ...filters,
      type: newType
    })
  }

  const handleSportToggle = (sport: string) => {
    const newSports = filters.sports.includes(sport)
      ? filters.sports.filter(s => s !== sport)
      : [...filters.sports, sport]
    onFiltersChange({ ...filters, sports: newSports })
  }

  const handleFriendToggle = (friendName: string) => {
    const newFriends = new Set(filters.selectedFriendFilters)
    if (newFriends.has(friendName)) {
      newFriends.delete(friendName)
    } else {
      newFriends.add(friendName)
    }
    onFiltersChange({ ...filters, selectedFriendFilters: newFriends })
  }

  const handleFriendsOnlyToggle = () => {
    const newFriendsOnly = !filters.friendsOnly
    let newSelectedFriends = filters.selectedFriendFilters
    
    // If turning ON friends-only, add all friends to selected filter
    if (newFriendsOnly) {
      newSelectedFriends = new Set(friendNames)
    } else {
      // If turning OFF, clear specific friend selections
      newSelectedFriends = new Set()
    }
    
    onFiltersChange({ 
      ...filters, 
      friendsOnly: newFriendsOnly,
      selectedFriendFilters: newSelectedFriends
    })
  }

  const hasAdvancedFilters = filters.sports.length > 0 || filters.friendsOnly || filters.selectedFriendFilters.size > 0

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 16,
        left: 50,
        zIndex: 500,
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', height: 48 }}>
        {/* Main Quick Filter Buttons */}
        <Button
          onClick={() => handleTypeChange('all')}
          variant={filters.type === 'all' ? 'contained' : 'text'}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 0,
            px: 2,
            height: '100%',
            fontWeight: filters.type === 'all' ? 'bold' : 'normal',
            fontSize: '0.9rem'
          }}
        >
          All
        </Button>

        <Button
          onClick={() => handleTypeChange('games')}
          variant={filters.type === 'games' ? 'contained' : 'text'}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 0,
            px: 2,
            height: '100%',
            fontWeight: filters.type === 'games' ? 'bold' : 'normal',
            fontSize: '0.9rem'
          }}
        >
          Games
        </Button>

        <Button
          onClick={() => handleTypeChange('fields')}
          variant={filters.type === 'fields' ? 'contained' : 'text'}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 0,
            px: 2,
            height: '100%',
            fontWeight: filters.type === 'fields' ? 'bold' : 'normal',
            fontSize: '0.9rem'
          }}
        >
          Fields
        </Button>

        <Button
          onClick={() => handleTypeChange('friends')}
          variant={filters.type === 'friends' ? 'contained' : 'text'}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 0,
            px: 2,
            height: '100%',
            fontWeight: filters.type === 'friends' ? 'bold' : 'normal',
            fontSize: '0.9rem'
          }}
        >
          Friends
        </Button>

        {/* Divider */}
        <Divider orientation="vertical" sx={{ height: '60%', my: 'auto' }} />

        {/* Advanced Filter Button */}
        <IconButton
          onClick={handleAdvancedOpen}
          size="small"
          sx={{
            borderRadius: 0,
            px: 1.5,
            height: '100%',
            color: hasAdvancedFilters ? '#1976d2' : 'inherit'
          }}
          title="Advanced filters"
        >
          <TuneIcon sx={{ fontSize: 20 }} />
          {hasAdvancedFilters && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                backgroundColor: '#1976d2',
                borderRadius: '50%'
              }}
            />
          )}
        </IconButton>
      </Box>

      {/* Advanced Filters Popover - Horizontal Layout */}
      <Popover
        open={advancedOpen}
        anchorEl={advancedAnchor}
        onClose={handleAdvancedClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 600, display: 'flex', gap: 3 }}>
          {/* Sports Filter */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Sports
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.5, maxHeight: 250, overflow: 'auto' }}>
              {COMMON_SPORTS.map(sport => (
                <FormControlLabel
                  key={sport}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.sports.includes(sport)}
                      onChange={() => handleSportToggle(sport)}
                    />
                  }
                  label={<Typography variant="body2">{sport}</Typography>}
                  sx={{ m: 0 }}
                />
              ))}
            </Box>
          </Box>

          {/* Friends Filter */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Friends
            </Typography>
            <Stack gap={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={filters.friendsOnly}
                    onChange={handleFriendsOnlyToggle}
                  />
                }
                label={<Typography variant="body2">Only Friends' Activities</Typography>}
              />

              {friendNames.length > 0 && (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'textSecondary', display: 'block', mb: 1 }}>
                    Specific friends:
                  </Typography>
                  <Stack gap={0.5}>
                    {friendNames.map(friend => (
                      <FormControlLabel
                        key={friend}
                        control={
                          <Checkbox
                            size="small"
                            checked={filters.selectedFriendFilters.has(friend)}
                            onChange={() => handleFriendToggle(friend)}
                          />
                        }
                        label={<Typography variant="body2">{friend}</Typography>}
                        sx={{ m: 0 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </Popover>
    </Paper>
  )
}
