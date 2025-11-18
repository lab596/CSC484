import React, { useState } from 'react'
import {
  Container,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Avatar,
  Typography,
  Stack,
  Card,
  Chip,
  Dialog,
  TextField,
  Button
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import { AppProvider } from './context/AppContext'
import MapPage from './pages/MapPage'
import GamesPage from './pages/GamesPage'
import SocialPage from './pages/SocialPage'
import StatsPage from './pages/StatsPage'

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#03a9f4'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif'
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  }
})

type PageType = 'map' | 'games' | 'social' | 'stats'

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('map')
  const [profileOpen, setProfileOpen] = useState(false)
  const [displayName, setDisplayName] = useState(() => {
    const saved = localStorage.getItem('displayName')
    return saved || 'Player One'
  })
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem('username')
    return saved || '@ready_player_one'
  })
  const [editingField, setEditingField] = useState<'name' | 'username' | null>(null)
  const [tempValue, setTempValue] = useState('')

  const renderPage = () => {
    switch (currentPage) {
      case 'map':
        return <MapPage />
      case 'games':
        return <GamesPage />
      case 'social':
        return <SocialPage />
      case 'stats':
        return <StatsPage />
      default:
        return <MapPage />
    }
  }

  const handleEditName = () => {
    setTempValue(displayName)
    setEditingField('name')
  }

  const handleEditUsername = () => {
    setTempValue(username)
    setEditingField('username')
  }

  const handleSaveEdit = () => {
    if (editingField === 'name' && tempValue.trim()) {
      setDisplayName(tempValue)
      localStorage.setItem('displayName', tempValue)
    } else if (editingField === 'username' && tempValue.trim()) {
      setUsername(tempValue)
      localStorage.setItem('username', tempValue)
    }
    setEditingField(null)
    setTempValue('')
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {renderPage()}
      </Box>

      {/* Profile Menu Overlay */}
      {profileOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Profile Popup Menu */}
      {profileOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
            animation: 'slideUp 200ms ease-out',
            '@keyframes slideUp': {
              from: {
                opacity: 0,
                transform: 'translateY(10px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Card
            sx={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              minWidth: '220px',
              overflow: 'hidden'
            }}
          >
            {/* Profile Header */}
            <Box sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#e0e0e0'
                  }}
                >
                  <PersonIcon sx={{ color: '#999' }} />
                </Avatar>
                <Stack direction="column" spacing={0.25} sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {username}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack spacing={1} sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
              <Box
                onClick={handleEditName}
                sx={{
                  width: '100%',
                  px: 1.5,
                  py: 0.75,
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  Change Name
                </Typography>
                <EditIcon sx={{ fontSize: 18, color: '#999' }} />
              </Box>
              <Box
                onClick={handleEditUsername}
                sx={{
                  width: '100%',
                  px: 1.5,
                  py: 0.75,
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  Change Username
                </Typography>
                <EditIcon sx={{ fontSize: 18, color: '#999' }} />
              </Box>
            </Stack>
          </Card>
        </Box>
      )}

      {/* Bottom Navigation */}
      <Paper sx={{ borderTop: '1px solid #e0e0e0' }} elevation={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fff'
          }}
        >
          <Box sx={{ pl: 2, py: 1 }}>
            <Chip
              label="PROTOTYPE"
              size="small"
              sx={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24
              }}
            />
          </Box>
          <BottomNavigation
            value={currentPage}
            onChange={(e, value) => setCurrentPage(value as PageType)}
            showLabels={false}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: '#fff',
              flex: 1
            }}
          >
            <BottomNavigationAction label="Map" value="map" icon={<HomeIcon />} />
            <BottomNavigationAction label="Games" value="games" icon={<SportsSoccerIcon />} />
            <BottomNavigationAction label="Stats" value="stats" icon={<BarChartIcon />} />
            <BottomNavigationAction label="Friends" value="social" icon={<PeopleIcon />} />
          </BottomNavigation>

          {/* Profile Section */}
          <Card
            onClick={() => setProfileOpen(!profileOpen)}
            sx={{
              mr: 2,
              my: 1,
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#f9f9f9',
              border: '1.5px solid #d0d0d0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Stack direction="column" alignItems="flex-end" spacing={0.25}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                {displayName}
              </Typography>
            </Stack>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#e0e0e0',
                cursor: 'pointer'
              }}
            >
              <PersonIcon sx={{ color: '#999' }} />
            </Avatar>
          </Card>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editingField !== null}
        onClose={handleCancelEdit}
        PaperProps={{
          sx: { borderRadius: '8px' }
        }}
      >
        <Box sx={{ p: 3, minWidth: '300px' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {editingField === 'name' ? 'Change Display Name' : 'Change Username'}
          </Typography>
          <TextField
            fullWidth
            label={editingField === 'name' ? 'Display Name' : 'Username'}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            autoFocus
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  )
}
