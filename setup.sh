#!/bin/bash
# Setup script for Social Sports Map React project

echo "🎯 Installing dependencies for Social Sports Map..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📱 Project Structure:"
echo "  - src/          React components and pages"
echo "  - src/pages/    Page components (Map, Games, Social, Stats)"
echo "  - src/components/ Reusable components (Map, AddGameModal, AddressAutocomplete, BottomSheet)"
echo "  - src/context/  Global state management"
echo ""
echo "🚀 Ready to run! Execute:"
echo "   npm run dev"
echo ""
echo "The app will open at: http://localhost:5173"
echo ""
echo "📝 Tips:"
echo "  - All data is saved to localStorage"
echo "  - Refresh the page to test persistence"
echo "  - Use the map to view games, add new ones, and reserve spots"
echo "  - Post to the social feed with photos"
echo "  - Log stats for completed games"
