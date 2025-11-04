# Social Sports Map — Prototype (Frontend only)

This is a small mobile-focused single-page web prototype demonstrating interactive behaviors for a social sports app. It uses plain HTML/CSS/JS and stores state in `localStorage` so testers can interact with the app (add games, join, post to feed, log stats, take photos via the device camera input).

How to run

- Option A — Quick local file (works in most browsers): open `index.html` in a mobile browser or desktop browser. Some camera features may require a secure context (served over http/https).
- Option B — Serve with a tiny HTTP server (recommended):

  PowerShell example (Windows):

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
