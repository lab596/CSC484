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
  Chip
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {renderPage()}
      </Box>

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
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Stack direction="column" alignItems="flex-end" spacing={0.25}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                @player_one
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Level 12
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
