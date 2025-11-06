# Social Sports Map - React + TypeScript + Material-UI

A mobile-first interactive prototype for finding and joining pickup sports games in your area.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Features

### Core Functionality
- **Interactive Map** - View sports games on an OpenStreetMap-based Leaflet map with custom SVG pin markers
- **Game Management** - Add new games, view details, reserve spots with real-time attendee tracking
- **Address Autocomplete** - Find addresses with local lookup + Nominatim fallback (OpenStreetMap geocoding)
- **Filters** - Filter games by sport (Soccer, Basketball, Tennis, Multi-Sport)
- **Social Feed** - Post updates, share photos, follow friends
- **Stats Logging** - Record game results and stats
- **Persistent State** - All data saved to localStorage (no backend required)

### Mobile-First Design
- Optimized for phone screens (viewport optimized)
- Bottom navigation for easy thumb access
- Material-UI components for polished, native-app-like UX
- Drawer-based bottom sheet for game details
- Responsive layout

## 🏗️ Project Structure

```
src/
├── main.tsx                 # React entry point
├── App.tsx                  # Main app component with routing
├── types.ts                 # TypeScript interfaces
├── utils.ts                 # Shared utilities, geocoding, address lookup
├── index.css                # Global styles
├── context/
│   └── AppContext.tsx       # Global state (React Context)
├── pages/
│   ├── MapPage.tsx          # Map view with filters
│   ├── GamesPage.tsx        # Games list view
│   ├── SocialPage.tsx       # Friends & feed
│   └── StatsPage.tsx        # Stats logging & history
└── components/
    ├── MapComponent.tsx     # Leaflet map with SVG pins
    ├── AddGameModal.tsx     # Add game dialog
    ├── AddressAutocomplete.tsx  # Address suggestions
    └── BottomSheetDetails.tsx   # Game details drawer
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool & dev server
- **Material-UI (MUI) 5** - Component library & theming
- **Leaflet** - Map rendering (OpenStreetMap)
- **Nominatim** - Public geocoding API (address → lat/lng)

## 🗺️ Sample Data

The app comes with sample games in **San Luis Obispo, CA**:
- Pickup Soccer at City Park
- Hoops at Spike Arena
- Tennis at Dana Adobe Park
- Baywood Field (public)

Built-in address lookup includes these locations. For addresses outside SLO, the app uses Nominatim (OpenStreetMap) for geocoding.

## 🔄 State Management

Uses **React Context API** for global state:
- Games, Friends, Feed, Stats, Profile
- All synced to localStorage automatically
- No external state library needed (lightweight!)

## 🎨 Material Design 3 Theme

- Primary color: #1976d2 (Material Blue)
- Secondary color: #03a9f4
- Roboto font family
- Material Icons for navigation and actions

## 📝 Development Notes

### Address Autocomplete
- Local lookup in `ADDRESS_LOOKUP` object first (fast)
- Falls back to Nominatim API if not found
- Debounced input (300ms) for better performance
- Keyboard navigation: arrow keys, Enter to select, Escape to close

### Map Pins
- SVG-based markers with sport letter
- Color-coded by sport (soccer=green, basketball=orange, tennis=pink, multi=blue)
- Click to view game details
- Leaf let dynamic loader handles CDN issues gracefully

### Reserve Flow
- Click a pin → Bottom sheet slides up with details
- Click "Reserve Spot" to join the game (updates attendee count)
- Click "Cancel Reservation" to leave
- Changes post to social feed automatically

## 🧪 Testing Checklist

- [ ] Map loads and displays pins
- [ ] Click pin to show bottom sheet details
- [ ] Reserve/Cancel updates attendee count
- [ ] Add game modal opens and creates new game
- [ ] Address autocomplete shows suggestions
- [ ] Filters (sport dropdown) update pins
- [ ] Social feed posts appear and persist
- [ ] Stats logging works and displays history
- [ ] Page refresh preserves all data (localStorage)
- [ ] Mobile viewport behaves well

## 🚀 Deployment

Build for production:
```bash
npm run build
```

This creates a `dist/` folder ready for deployment to:
- Netlify (drag & drop)
- Vercel (git push)
- GitHub Pages
- Any static host

## 📚 Further Enhancements

- [ ] Attendee chips showing who's going
- [ ] Swipe-to-dismiss bottom sheet
- [ ] User profiles with avatars
- [ ] Camera photo capture for feed
- [ ] Marker clustering for performance
- [ ] Directions/routing to game location
- [ ] Real backend API + user authentication
- [ ] Location sharing & live updates via WebSocket

## 📄 License

MIT

  ```powershell
  # from inside the project folder C:\CodingProjects\UX
  python -m http.server 8000
  # then open http://localhost:8000 in your browser
  ```

What to demo

Prepare to demonstrate three tasks during demo day. Suggested tasks:

1. Find and join a nearby game on the Map
   - Use the Map tab, tap a pin, open details, press Join → observe a feed post is created.
2. Host a game
   - Tap the + (Add) button, fill the form (location X/Y), submit → the game appears on the Map and in Games list.
3. Post to feed and attach a photo / Log stats
   - Social tab: type a post and use camera input to attach an image (mobile browsers only). Save stats in Stats tab to see logs.

Notes

- State is stored only locally with `localStorage` and will be reset if you clear storage or press Reset.
- This is a prototype; advanced features (login, real maps) are stubbed or represented with placeholders. The UI is intentionally mobile-first.

Files

- `index.html` — SPA layout and markup
- `styles.css` — mobile-focused styling
- `app.js` — all interaction logic and local persistence

Next steps (optional)

- Replace the placeholder map with a real map (Leaflet/OpenStreetMap) if you add a map provider key.
- Add simple unit tests or an automated demo script that simulates interactions.
