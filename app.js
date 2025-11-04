import { read, write, LS_KEYS, todayOffset } from './src/shared.js'
import { initMapModule } from './src/pages/map.js'

// --- Sample initial data ---
// default center: San Luis Obispo, CA
const DEFAULT_CENTER = { lat: 35.2828, lng: -120.6596 }

// small built-in address lookup for demo addresses in San Luis Obispo
const ADDRESS_LOOKUP = {
  'spike arena': { lat: 35.2821, lng: -120.6600 },
  'dana adobe': { lat: 35.3089, lng: -120.6592 },
  'city park': { lat: 35.2836, lng: -120.6607 },
  'college baseball field': { lat: 35.2741, lng: -120.6602 }
}

// sample games stored with human addresses (and lat/lng for rendering)
const sampleGames = [
  {id: 'g1', title: 'Pickup Soccer - City Park', sport: 'soccer', address: 'City Park, SLO', lat: ADDRESS_LOOKUP['city park'].lat, lng: ADDRESS_LOOKUP['city park'].lng, date: todayOffset(0), host: 'alex', skill: 'intermediate', type: 'game', attendees:5},
  {id: 'g2', title: 'Hoops at Spike', sport: 'basketball', address: 'Spike Arena, SLO', lat: ADDRESS_LOOKUP['spike arena'].lat, lng: ADDRESS_LOOKUP['spike arena'].lng, date: todayOffset(0), host: 'maria', skill: 'all', type: 'game', attendees:3, friendHost:true},
  {id: 'g3', title: 'Tennis Meetup', sport: 'tennis', address: 'Dana Adobe Park, SLO', lat: ADDRESS_LOOKUP['dana adobe'].lat, lng: ADDRESS_LOOKUP['dana adobe'].lng, date: todayOffset(1), host: 'Jam', skill: 'beginner', type: 'game', attendees:2},
  {id: 'f1', title: 'Baywood Field (public)', sport: 'multi', address: 'College Baseball Field, SLO', lat: ADDRESS_LOOKUP['college baseball field'].lat, lng: ADDRESS_LOOKUP['college baseball field'].lng, type: 'field'}
]

const sampleFriends = [
  {id:'friend_jam', name:'Jam', mutual:true},
  {id:'maria', name:'Maria', mutual:true}
]

function initStorage(){
  if(!read(LS_KEYS.GAMES)) write(LS_KEYS.GAMES, sampleGames)
  if(!read(LS_KEYS.FRIENDS)) write(LS_KEYS.FRIENDS, sampleFriends)
  if(!read(LS_KEYS.FEED)) write(LS_KEYS.FEED, [{id:'f0', text:'Welcome to Social Sports Map!', time:Date.now()}])
  if(!read(LS_KEYS.STATS)) write(LS_KEYS.STATS, [])
  if(!read(LS_KEYS.PROFILE)) write(LS_KEYS.PROFILE, {id:'me', name:'You', avatar:null})
}

// geocode address using local lookup first, then Nominatim as a fallback
async function geocodeAddress(address){
  if(!address) return null
  const k = address.trim().toLowerCase()
  if(ADDRESS_LOOKUP[k]) return ADDRESS_LOOKUP[k]
  // try simple normalization match
  for(const key of Object.keys(ADDRESS_LOOKUP)){
    if(k.includes(key)) return ADDRESS_LOOKUP[key]
  }
  // fallback: query Nominatim (public) - best-effort; may be rate-limited
  try{
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', San Luis Obispo, CA')}`
    const res = await fetch(url, {headers: {'Accept':'application/json'}})
    const data = await res.json()
    if(Array.isArray(data) && data.length>0){
      const first = data[0]
      return { lat: Number(first.lat), lng: Number(first.lon) }
    }
  }catch(e){
    console.warn('Geocode failed', e)
  }
  return null
}

// --- DOM refs ---
const pages = document.querySelectorAll('.page')
const navBtns = document.querySelectorAll('.navbtn')
const title = document.getElementById('page-title')
const gamesList = document.getElementById('games-list')
const friendsList = document.getElementById('friends-list')
const feedList = document.getElementById('feed-list')
const statsList = document.getElementById('stats-list')
const statsSelect = document.getElementById('stats-game-select')

// modal and forms
const modalAdd = document.getElementById('modal-add')
const btnAddGame = document.getElementById('btn-add-game')
const formAdd = document.getElementById('form-add-game')
const btnCancelAdd = document.getElementById('cancel-add')

// address input + suggestions
const addressInput = document.getElementById('add-address')
const suggestionsBox = document.getElementById('address-suggestions')

// social composer
const feedText = document.getElementById('feed-text')
const feedPhoto = document.getElementById('feed-photo')
const postFeedBtn = document.getElementById('post-feed')

const btnReset = document.getElementById('btn-reset')

// filters
const selectSport = document.getElementById('filter-sport')

// init storage and page modules
initStorage()
// ensure the add-game modal is hidden on load (fix: sometimes it appears due to browser state)
if(modalAdd){
  modalAdd.classList.add('hidden')
  modalAdd.style.display = 'none'
}
const mapModule = initMapModule()

// --- navigation ---
navBtns.forEach(b=>b.addEventListener('click', ()=>{ setPage(b.dataset.page) }))
function setPage(p){ pages.forEach(s=>s.classList.remove('active')); document.getElementById('page-'+p).classList.add('active'); navBtns.forEach(n=>n.classList.remove('active')); document.querySelector(`[data-page="${p}"]`).classList.add('active'); title.textContent = p=== 'map' ? 'Map' : p.charAt(0).toUpperCase()+p.slice(1); renderAll() }

// --- rendering for non-map pages ---
function renderAll(){ mapModule.renderMap(); renderGamesList(); renderFriends(); renderFeed(); renderStats(); }

function renderGamesList(){ const games = read(LS_KEYS.GAMES,[]); gamesList.innerHTML='';
  games.forEach(g=>{
    const it = document.createElement('div'); it.className='item'; it.innerHTML=`<div><strong>${g.title}</strong><div class="muted">${g.sport} • ${g.date} • ${g.skill}</div></div><div><button class="btn" data-id="${g.id}">Open</button></div>`
    it.querySelector('button').addEventListener('click', ()=>{ setPage('map'); setTimeout(()=> mapModule.showDetails(g.id),200) })
    gamesList.appendChild(it)
  })
}

function renderFriends(){ const friends = read(LS_KEYS.FRIENDS,[]); friendsList.innerHTML='';
  friends.forEach(f=>{ const it=document.createElement('div'); it.className='item'; it.innerHTML=`<div>${f.name}</div><div><button class="btn" data-id="${f.id}">View</button></div>`; friendsList.appendChild(it) })
}

function renderFeed(){ const feed = read(LS_KEYS.FEED,[]); feedList.innerHTML='';
  feed.slice().reverse().forEach(p=>{ const it=document.createElement('div'); it.className='item'; let content = `<div><strong>${p.author||'Someone'}</strong><div class="muted">${new Date(p.time).toLocaleString()}</div></div>`; if(p.text) content += `<div style="margin-left:8px">${escapeHtml(p.text)}</div>`; if(p.photo) content += `<img src="${p.photo}" style="width:100%;border-radius:8px;margin-top:6px"/>`; it.innerHTML = content; feedList.appendChild(it) })
}

function renderStats(){ const stats = read(LS_KEYS.STATS,[]); statsList.innerHTML=''; statsSelect.innerHTML=''; const games = read(LS_KEYS.GAMES,[])
  games.forEach(g=>{ const opt=document.createElement('option'); opt.value=g.id; opt.textContent=g.title; statsSelect.appendChild(opt) })
  stats.forEach(s=>{ const it=document.createElement('div'); it.className='item'; it.innerHTML=`<div><strong>${s.gameTitle}</strong><div class="muted">${new Date(s.time).toLocaleString()}</div><div>${escapeHtml(s.note)}</div></div>`; statsList.appendChild(it) })
}

// --- add game ---
btnAddGame.addEventListener('click', ()=>{
  if(!modalAdd) return
  modalAdd.classList.remove('hidden')
  modalAdd.style.display = 'flex'
})
// cancel hides both the class and inline style (also has an onclick fallback in HTML)
btnCancelAdd.addEventListener('click', ()=>{
  if(!modalAdd) return
  modalAdd.classList.add('hidden')
  modalAdd.style.display = 'none'
  // clear any open suggestions when cancelling
  if(suggestionsBox) clearSuggestions()
})
formAdd.addEventListener('submit', async (e)=>{
  e.preventDefault(); const fd = new FormData(formAdd); const title = fd.get('title'); const sport = fd.get('sport'); const date = fd.get('date')||todayOffset(0); const skill = fd.get('skill'); const address = (fd.get('address')||'').trim()
  const games = read(LS_KEYS.GAMES,[])
  // try to use hidden lat/lng if suggestion already selected
  let lat = fd.get('lat') || ''
  let lng = fd.get('lng') || ''
  let pos = null
  if(lat && lng){ pos = { lat: Number(lat), lng: Number(lng) }
  } else {
    // try to geocode the address (local lookup first)
    pos = await geocodeAddress(address)
  }
  if(!pos){ alert('Could not resolve address. Try a different address or allow network access for geocoding.'); return }
  const id = 'g'+Date.now(); games.push({id,title,sport,address,lat:pos.lat,lng:pos.lng,date,skill,host:read(LS_KEYS.PROFILE).name,attendees:1,type:'game'})
  write(LS_KEYS.GAMES,games)
  modalAdd.classList.add('hidden'); modalAdd.style.display = 'none'; formAdd.reset(); renderAll()
})

// --- address autocomplete / suggestions ---
function debounce(fn, wait=300){ let t=null; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait) }}

async function fetchAddressSuggestions(q){
  if(!q || q.trim().length<2) return []
  const text = q.trim().toLowerCase()
  const results = []
  // local lookup first (fuzzy contains)
  for(const key of Object.keys(ADDRESS_LOOKUP)){
    if(key.includes(text) || text.includes(key)){
      results.push({display: key.replace(/\b\w/g, c=>c.toUpperCase()) + ', San Luis Obispo, CA', lat: ADDRESS_LOOKUP[key].lat, lng: ADDRESS_LOOKUP[key].lng, source:'local'})
    }
  }
  // if we have enough local results, return early
  if(results.length>=5) return results.slice(0,5)

  // fallback: Nominatim search bounded to SLO area (best-effort)
  try{
    // viewbox for San Luis Obispo approximate: left,top,right,bottom (lon,lat)
    const viewbox = [-120.72,35.33,-120.59,35.24]
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}&viewbox=${viewbox.join(',')}&bounded=1`
    const res = await fetch(url, {headers: {'Accept':'application/json'}})
    const data = await res.json()
    if(Array.isArray(data)){
      for(const it of data){
        results.push({display: it.display_name, lat: Number(it.lat), lng: Number(it.lon), source:'nominatim'})
      }
    }
  }catch(e){ console.warn('Suggestion fetch failed', e) }
  return results.slice(0,5)
}

let suggestionItems = []
let activeSuggestion = -1

function clearSuggestions(){ suggestionsBox.innerHTML=''; suggestionsBox.classList.add('hidden'); suggestionItems = []; activeSuggestion=-1; addressInput.removeAttribute('aria-activedescendant') }

function renderSuggestions(list){ suggestionsBox.innerHTML=''; if(!list || list.length===0){ clearSuggestions(); return }
  list.forEach((s, idx)=>{
    const el = document.createElement('div'); el.className='suggestion-item'; el.setAttribute('role','option'); el.setAttribute('data-idx', idx); el.tabIndex = -1
  el.id = 'sugg-'+idx
  el.innerHTML = `<div class="s-line">${escapeHtml(s.display)}</div><div class="s-source muted">${s.source}</div>`
    el.addEventListener('click', ()=> selectSuggestion(idx))
    suggestionsBox.appendChild(el)
  })
  suggestionItems = Array.from(suggestionsBox.querySelectorAll('.suggestion-item'))
  suggestionsBox.classList.remove('hidden')
}

async function onAddressInput(e){ const q = e.target.value; if(!q || q.trim().length<1){ clearSuggestions(); return }
  try{
    const list = await fetchAddressSuggestions(q)
    renderSuggestions(list)
    // store the last fetched list for selection
    suggestionsBox._results = list
  }catch(e){ console.warn(e); clearSuggestions() }
}

const debouncedAddress = debounce(onAddressInput, 300)
if(addressInput){ addressInput.addEventListener('input', debouncedAddress)
  addressInput.addEventListener('keydown', (ev)=>{
    if(suggestionItems.length===0) return
    if(ev.key==='ArrowDown'){ ev.preventDefault(); activeSuggestion = Math.min(activeSuggestion+1, suggestionItems.length-1); updateActiveSuggestion() }
    else if(ev.key==='ArrowUp'){ ev.preventDefault(); activeSuggestion = Math.max(activeSuggestion-1, 0); updateActiveSuggestion() }
    else if(ev.key==='Enter'){ if(activeSuggestion>=0){ ev.preventDefault(); selectSuggestion(activeSuggestion) } }
    else if(ev.key==='Escape'){ clearSuggestions() }
  })
  // click outside to close
  document.addEventListener('click', (ev)=>{ if(!modalAdd.contains(ev.target)) clearSuggestions() })
}

function updateActiveSuggestion(){ suggestionItems.forEach((it, i)=>{ if(i===activeSuggestion){ it.classList.add('active'); it.setAttribute('aria-selected','true'); addressInput.setAttribute('aria-activedescendant', 'sugg-'+i) } else { it.classList.remove('active'); it.setAttribute('aria-selected','false') } }) }

function selectSuggestion(idx){ const list = suggestionsBox._results || []; const s = list[idx]; if(!s) return; addressInput.value = s.display; // populate hidden lat/lng on the form
  const latInput = formAdd.querySelector('input[name="lat"]'); const lngInput = formAdd.querySelector('input[name="lng"]'); if(latInput && lngInput){ latInput.value = s.lat || ''; lngInput.value = s.lng || '' }
  clearSuggestions()
}

// --- social ---
postFeedBtn.addEventListener('click', async ()=>{
  const text = feedText.value.trim(); const file = feedPhoto.files[0]; let photo = null
  if(file){ photo = await readFileAsDataURL(file) }
  const feed = read(LS_KEYS.FEED,[])
  feed.push({id:'f'+Date.now(), author: read(LS_KEYS.PROFILE).name, text, photo, time: Date.now()})
  write(LS_KEYS.FEED, feed); feedText.value=''; feedPhoto.value=''; renderFeed()
})

// --- stats save ---
document.getElementById('save-stats').addEventListener('click', ()=>{
  const gameId = statsSelect.value; const note = document.getElementById('stats-score').value.trim(); if(!gameId || !note) return alert('Select game and enter a score/notes')
  const games = read(LS_KEYS.GAMES,[]); const g = games.find(x=>x.id===gameId)
  const stats = read(LS_KEYS.STATS,[])
  stats.push({id:'s'+Date.now(), gameId, gameTitle: g? g.title:'(unknown)', note, time: Date.now()})
  write(LS_KEYS.STATS, stats); document.getElementById('stats-score').value=''; renderStats();
})

// reset demo
btnReset.addEventListener('click', ()=>{
  if(!confirm('Reset prototype state? This clears all local data for the prototype.')) return
  localStorage.clear(); location.reload()
})

// util helpers
function readFileAsDataURL(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f) }) }
function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

// simple interactions
selectSport.addEventListener('change', ()=> mapModule.renderMap())

// initialize
setPage('map')
