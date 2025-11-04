// Map page module: encapsulates map rendering and homepage-specific interactions
import { read, write, LS_KEYS, todayOffset } from '../shared.js'

export function initMapModule(selectors){
  const mapEl = document.getElementById('map')
  const details = document.getElementById('game-details')
  const detailsBody = document.getElementById('game-details-body')
  const reserveBtn = document.getElementById('reserve-game')
  const minimizeBtn = document.getElementById('minimize-details')
  const sheetGamesBtn = document.getElementById('sheet-games')
  const filterSport = document.getElementById('filter-sport')

  let currentGameId = null
  let map = null
  let markersLayer = null
  const DEFAULT_CENTER = { lat: 35.2828, lng: -120.6596 } // San Luis Obispo

  function ensureMap(){
    if(map) return
    // ensure Leaflet is available; if not, try to load it dynamically and retry
    if(typeof window.L === 'undefined'){
      // show a lightweight loading indicator
      mapEl.innerHTML = '<div style="color:var(--muted);padding:24px">Loading map...</div>'
      if(!document.getElementById('leaflet-js')){
        const s = document.createElement('script')
        s.id = 'leaflet-js'
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        s.onload = ()=>{ try{ renderMap() }catch(e){ console.warn('leaflet load callback error', e) } }
        s.onerror = ()=>{ mapEl.innerHTML = '<div style="color:var(--muted);padding:24px">Failed to load map library. Check network.</div>' }
        document.body.appendChild(s)
      }
      return
    }

    // initialize Leaflet map
    map = L.map(mapEl, { zoomControl:true })
    markersLayer = L.layerGroup().addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // try to center on user location
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        const lat = pos.coords.latitude, lng = pos.coords.longitude
        map.setView([lat,lng], 14)
      }, ()=>{
        map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13)
      }, {timeout:3000})
    } else {
      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13)
    }
  }

  function renderMap(){
    ensureMap()
  // if map isn't ready yet, ensureMap will have attempted load and returned; guard
  if(!map) return
  // sometimes the map container size needs a short delay before tiles render
  map.invalidateSize()
  setTimeout(()=> map.invalidateSize(), 200)
    markersLayer.clearLayers()
    const games = read(LS_KEYS.GAMES,[])
    const sportFilter = (filterSport && filterSport.value) || 'any'
    // determine pill filter (all/friends/fields/games)
    const activePill = document.querySelector('.pill-group .pill.active')?.dataset.filter || 'all'

    // collect active chips from filter panel
    const panel = document.getElementById('filter-panel')
    const activeChips = {}
    if(panel){
      panel.querySelectorAll('.filter-row').forEach(row=>{
        const cat = (row.querySelector('strong')?.textContent||'').replace(':','').trim().toLowerCase()
        const vals = []
        row.querySelectorAll('.chip').forEach(c=>{ if(c.classList.contains('active')) vals.push(c.textContent.trim().toLowerCase()) })
        if(vals.length) activeChips[cat]=vals
      })
    }

    games.forEach(g=>{
      // pill filters
      if(activePill === 'friends' && !g.friendHost) return
      if(activePill === 'fields' && g.type !== 'field') return
      if(activePill === 'games' && g.type && g.type !== 'game') return

      // sport filter from dropdown
      if(sportFilter !== 'any' && g.sport !== sportFilter) return

      // chips filter: sport
      if(activeChips['sport'] && activeChips['sport'].length){
        const gSport = (g.sport||'').toLowerCase()
        if(!activeChips['sport'].includes(gSport)) return
      }
      // chips filter: skill
      if(activeChips['skill'] && activeChips['skill'].length){
        const gSkill = (g.skill||'').toLowerCase()
        if(!activeChips['skill'].includes(gSkill)) return
      }

      if(!g.lat || !g.lng) return
      // create a pin-style SVG icon for better visual affordance
      const colorFill = g.type === 'field' ? '#06b6d4' : '#ef476f'
      const colorAccent = g.type === 'field' ? '#6ee7b7' : '#ffd166'
      const friendRing = g.friendHost ? `<circle cx="12" cy="4" r="6" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="3" />` : ''
      const sportLetter = (g.sport||'?')[0].toUpperCase()
      const svg = `
        <svg width="36" height="48" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gGrad${g.id}" x1="0" x2="1"><stop offset="0" stop-color="${colorAccent}"/><stop offset="1" stop-color="${colorFill}"/></linearGradient>
          </defs>
          <path d="M12 0C7 0 3 4 3 9c0 6.75 9 21 9 21s9-14.25 9-21c0-5-4-9-9-9z" fill="url(#gGrad${g.id})" stroke="#000" stroke-opacity="0.06"/>
          ${friendRing}
          <text x="12" y="12" text-anchor="middle" font-size="8" font-weight="700" fill="#062a2c" style="font-family:Inter,system-ui,sans-serif">${sportLetter}</text>
        </svg>`
      const icon = L.divIcon({ html: svg, className: 'leaflet-pin-icon', iconSize: [24,32], iconAnchor: [12,32] })
      const marker = L.marker([g.lat, g.lng], { icon })
      marker.on('click', ()=> showDetails(g.id))
      marker.addTo(markersLayer)
    })
  }

  function showDetails(id){
    const g = read(LS_KEYS.GAMES,[]).find(x=>x.id===id)
    if(!g) return
    currentGameId = id
    detailsBody.innerHTML = `
      <div class="sheet-header"><strong>${g.title}</strong><div class="muted">${g.sport} • ${g.date} • ${g.skill}</div></div>
      <div class="sheet-body">
        <div style="margin-top:8px">Host: <strong>${g.host}</strong></div>
        <div class="details-attendees"><span class="badge">${g.attendees||0} attendees</span></div>
        <div style="margin-top:8px;color:var(--muted)">${g.address || ''}</div>
      </div>
    `
    // update reserve button text based on reservation state
    if(reserveBtn){ reserveBtn.textContent = g.reservedByMe ? 'Cancel' : 'Reserve' }
    // show animated bottom sheet
    details.classList.remove('hidden')
    details.setAttribute('aria-hidden','false')
    // ensure not minimized when opening
    details.classList.remove('minimized')
    // small timeout to allow CSS transition
    requestAnimationFrame(()=> details.classList.add('open'))
  }
  // minimize / toggle collapse
  if(minimizeBtn) minimizeBtn.addEventListener('click', ()=>{
    if(details.classList.contains('minimized')){
      // expand
      details.classList.remove('minimized')
      requestAnimationFrame(()=> details.classList.add('open'))
    } else {
      // collapse to minimized bar
      details.classList.remove('open')
      details.classList.add('minimized')
    }
  })

  if(sheetGamesBtn) sheetGamesBtn.addEventListener('click', ()=>{ document.querySelector('[data-page="games"]').click() })

  if(reserveBtn) reserveBtn.addEventListener('click', ()=>{
    if(!currentGameId) return
    const games = read(LS_KEYS.GAMES,[])
    const idx = games.findIndex(x=>x.id===currentGameId)
    if(idx===-1) return
    const g = games[idx]
    // toggle reservation by current user (simple prototype state)
    const profile = read(LS_KEYS.PROFILE)
    if(g.reservedByMe){
      // cancel
      g.attendees = Math.max(0, (g.attendees||0) - 1)
      g.reservedByMe = false
      const feed = read(LS_KEYS.FEED,[])
      feed.push({id:'f'+Date.now(), author: profile.name, text:`Canceled reservation for ${g.title}`, time: Date.now()})
      write(LS_KEYS.FEED, feed)
      reserveBtn.textContent = 'Reserve'
    } else {
      g.attendees = (g.attendees||0) + 1
      g.reservedByMe = true
      const feed = read(LS_KEYS.FEED,[])
      feed.push({id:'f'+Date.now(), author: profile.name, text:`Reserved spot at ${g.title}`, time: Date.now()})
      write(LS_KEYS.FEED, feed)
      reserveBtn.textContent = 'Cancel'
      // show reserved overlay
      showReservedOverlay(g)
    }
    games[idx] = g
    write(LS_KEYS.GAMES, games)
    // update UI
    renderMap()
    // update sheet contents to reflect new attendees
    if(currentGameId) showDetails(currentGameId)
  })

  function showReservedOverlay(game){
    const overlay = document.createElement('div'); overlay.className='overlay-modal';
    overlay.innerHTML = `<div class="overlay-card"><h3>Spot reserved!</h3><div class="big-icon">🌐</div><div><strong>${game.title}</strong><div class="muted">${game.date}</div></div><div style="margin-top:12px"><button class="btn primary" id="see-in-calendar">See in Calendar</button></div></div>`
    document.body.appendChild(overlay)
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove() })
    document.getElementById('see-in-calendar').addEventListener('click', ()=>{ overlay.remove(); document.querySelector('[data-page="games"]').click() })
  }

  // wire up pill clicks and more-panel UI
  document.querySelectorAll('.pill-group .pill').forEach(p=>p.addEventListener('click', (e)=>{
    document.querySelectorAll('.pill-group .pill').forEach(x=>x.classList.remove('active'))
    e.currentTarget.classList.add('active')
    renderMap()
  }))

  const filterMore = document.getElementById('filter-more')
  if(filterMore){
    filterMore.addEventListener('click', ()=>{
      const panel = document.getElementById('filter-panel')
      if(!panel) return
      panel.classList.toggle('hidden')
    })
  }

  // chips toggle
  document.querySelectorAll('.filter-panel .chip').forEach(c=> c.addEventListener('click', (ev)=>{ ev.currentTarget.classList.toggle('active'); renderMap() }))

  if(filterSport) filterSport.addEventListener('change', renderMap)

  return { renderMap, showDetails }
}
