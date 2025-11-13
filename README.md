# Social Sports Map - React + TypeScript + Material-UI

An interactive prototype for finding and joining pickup sports games in your area.

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

## Features
### Core Functionality
- **Interactive Map** - View sports games on an OpenStreetMap-based Leaflet map with custom SVG pin markers
- **Game Management** - Add new games, view details, reserve spots with real-time attendee tracking
- **Address Autocomplete** - Find addresses with local lookup + Nominatim fallback (OpenStreetMap geocoding)
- **Filters** - Filter games by sport (Soccer, Basketball, Tennis, Multi-Sport)
- **Social Feed** - Post updates, share photos, follow friends
- **Stats Logging** - Record game results and stats
- **Persistent State** - All data saved to localStorage (no backend required)

## Technology Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool & dev server
- **Material-UI (MUI) 5** - Component library & theming
- **Leaflet** - Map rendering (OpenStreetMap)
- **Nominatim** - Public geocoding API (address → lat/lng)

## Sample Data

The app comes with sample games in **San Luis Obispo, CA**:
- Pickup Soccer at City Park
- Hoops at Spike Arena
- Tennis at Dana Adobe Park
- Baywood Field (public)

Built-in address lookup includes these locations. For addresses outside SLO, the app uses Nominatim (OpenStreetMap) for geocoding.

## Team Contributions
   - Rohan: Initial project setup (wireframe for each of the pages), map page (detail, modals, filters, Leaflet for map w/geocoding api for address completion, games, fields, etc...), connection to games page to serve information inputted
