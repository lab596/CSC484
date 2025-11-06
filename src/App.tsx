import React, { useState } from 'react'
import {
  Container,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
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
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <Paper sx={{ display: 'flex', gap: 2, p: 2, borderBottom: '1px solid #e0e0e0' }} elevation={0}>
        <BottomNavigation
          value={currentPage}
          onChange={(e, value) => setCurrentPage(value as PageType)}
          showLabels={false}
          sx={{ 
            width: 'auto',
            backgroundColor: 'transparent'
          }}
        >
          <BottomNavigationAction label="Map" value="map" icon={<HomeIcon />} />
          <BottomNavigationAction label="Games" value="games" icon={<SportsSoccerIcon />} />
          <BottomNavigationAction label="Stats" value="stats" icon={<BarChartIcon />} />
          <BottomNavigationAction label="Friends" value="social" icon={<PeopleIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {renderPage()}
      </Box>
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
