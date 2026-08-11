import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PRIORITY_MAP, PRIORITY_COLORS } from '../data/reportStore'
import StatusBadge from '../components/ui/StatusBadge'

// ── Leaflet is loaded via CDN in index.html (or injected below dynamically)
// Add these to your index.html <head>:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

// Geocode a text address → [lat, lng] using Nominatim (free, no key needed)
async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch (_) {}
  return null
}

// Fetch walking/driving route from OSRM (free, no key needed)
async function fetchRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
      const dist = (data.routes[0].distance / 1000).toFixed(1)
      const dur = Math.round(data.routes[0].duration / 60)
      return { coords, dist, dur }
    }
  } catch (_) {}
  return null
}

// Parse "lat, lng" string or geocode text address
async function resolveLocation(locString) {
  if (!locString) return null
  const coordMatch = locString.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
  if (coordMatch) return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])]
  return geocodeAddress(locString)
}

function LiveMap({ location, reportId }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const leafletLoadedRef = useRef(false)
  const [userCoords, setUserCoords] = useState(null)
  const [issueCoords, setIssueCoords] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [mapStatus, setMapStatus] = useState('loading') // loading | ready | no-location
  const [geoStatus, setGeoStatus] = useState('idle') // idle | locating | found | denied | error
  const routeLayerRef = useRef(null)
  const markersRef = useRef([])

  // Dynamically load Leaflet CSS + JS if not present
  useEffect(() => {
    const cssId = 'leaflet-css'
    const jsId = 'leaflet-js'
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!document.getElementById(jsId)) {
      const script = document.createElement('script')
      script.id = jsId
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => { leafletLoadedRef.current = true; initMap() }
      document.head.appendChild(script)
    } else if (window.L) {
      leafletLoadedRef.current = true
      initMap()
    } else {
      document.getElementById(jsId).addEventListener('load', () => {
        leafletLoadedRef.current = true; initMap()
      })
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  async function initMap() {
    if (!mapRef.current || mapInstanceRef.current || !window.L) return
    const L = window.L

    // Fix default marker icons for webpack/vite
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map
    setMapStatus('ready')

    // Resolve issue location
    const coords = await resolveLocation(location)
    if (coords) {
      setIssueCoords(coords)
      map.setView(coords, 15)

      // Custom issue marker (red pin)
      const issueIcon = L.divIcon({
        html: `<div style="
          width:36px;height:44px;position:relative;
        ">
          <div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:linear-gradient(135deg,#e04b4b,#c0392b);
            transform:rotate(-45deg);
            box-shadow:0 4px 16px rgba(224,75,75,0.5);
            border:3px solid #fff;
          "></div>
          <div style="
            position:absolute;top:8px;left:8px;
            width:20px;height:20px;
            border-radius:50%;background:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:10px;
          ">⚠️</div>
        </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
        className: '',
      })

      const issueMarker = L.marker(coords, { icon: issueIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Sora',sans-serif;padding:4px 2px;min-width:160px">
            <div style="font-weight:800;font-size:0.9rem;color:#0e1117;margin-bottom:4px">Issue Location</div>
            <div style="font-size:0.75rem;color:#7a8799">${location}</div>
          </div>
        `)
      markersRef.current.push(issueMarker)
    } else {
      setMapStatus('no-location')
    }
  }

  async function handleGetLocation() {
    if (!mapInstanceRef.current || !window.L) return
    const L = window.L
    const map = mapInstanceRef.current
    setGeoStatus('locating')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const coords = [latitude, longitude]
        setUserCoords(coords)
        setGeoStatus('found')

        // Remove old user marker
        markersRef.current.forEach((m) => {
          if (m._isUserMarker) map.removeLayer(m)
        })

        // Custom user location marker (teal pulsing)
        const userIcon = L.divIcon({
          html: `<div style="position:relative;width:20px;height:20px;">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:rgba(26,158,143,0.25);
              animation:pulse-ring 1.5s infinite;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;
              width:14px;height:14px;border-radius:50%;
              background:#1a9e8f;border:2.5px solid #fff;
              transform:translate(-50%,-50%);
              box-shadow:0 2px 8px rgba(26,158,143,0.6);
            "></div>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: '',
        })

        // Add pulse animation style once
        if (!document.getElementById('pulse-style')) {
          const style = document.createElement('style')
          style.id = 'pulse-style'
          style.textContent = `
            @keyframes pulse-ring {
              0% { transform: scale(0.8); opacity: 1; }
              100% { transform: scale(2.5); opacity: 0; }
            }
          `
          document.head.appendChild(style)
        }

        const userMarker = L.marker(coords, { icon: userIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:'Sora',sans-serif;font-weight:700;font-size:0.85rem">📍 You are here</div>`)
        userMarker._isUserMarker = true
        markersRef.current.push(userMarker)

        // If we have both user + issue coords, draw route
        if (issueCoords) {
          await drawRoute(coords, issueCoords, map)
          // Fit map to show both
          const group = L.featureGroup(markersRef.current)
          map.fitBounds(group.getBounds().pad(0.2))
        }
      },
      (err) => {
        if (err.code === 1) setGeoStatus('denied')
        else setGeoStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  async function drawRoute(from, to, map) {
    if (!window.L) return
    const L = window.L

    // Remove existing route layer
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current)

    const route = await fetchRoute(from, to)
    if (route) {
      setRouteInfo(route)
      const polyline = L.polyline(route.coords, {
        color: '#1a9e8f',
        weight: 5,
        opacity: 0.85,
        dashArray: null,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map)
      routeLayerRef.current = polyline
    }
  }

  const geoButtonLabel = {
    idle: '📍 Show My Location & Route',
    locating: '⏳ Locating…',
    found: '✅ Location Found — Re-center',
    denied: '⚠️ Permission Denied',
    error: '⚠️ Could Not Locate',
  }[geoStatus]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* No-location overlay */}
      {mapStatus === 'no-location' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', color: 'var(--primary)',
          background: 'linear-gradient(135deg,#e8f4f2,#d1ece8)',
        }}>
          <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>No location provided</span>
        </div>
      )}

      {/* Route/location control panel — bottom left */}
      {mapStatus === 'ready' && issueCoords && (
        <div style={{
          position: 'absolute', bottom: '5rem', left: '1rem', zIndex: 800,
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          maxWidth: 260,
        }}>
          <button
            onClick={handleGetLocation}
            disabled={geoStatus === 'locating'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: geoStatus === 'found' ? 'rgba(26,158,143,0.95)' : 'rgba(14,17,23,0.92)',
              color: '#fff',
              border: 'none', borderRadius: '2rem',
              fontFamily: "'Sora',sans-serif", fontSize: '0.78rem', fontWeight: 700,
              cursor: geoStatus === 'locating' ? 'not-allowed' : 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={() => document.body.classList.add('cursor-hover')}
            onMouseLeave={() => document.body.classList.remove('cursor-hover')}
          >
            {geoButtonLabel}
          </button>

          {/* Route info card */}
          {routeInfo && (
            <div style={{
              background: 'rgba(255,255,255,0.96)',
              borderRadius: '1rem',
              padding: '0.75rem 1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(12px)',
              display: 'flex', gap: '1.25rem',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#1a9e8f' }}>
                  {routeInfo.dist} km
                </div>
                <div style={{ fontSize: '0.65rem', color: '#7a8799', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</div>
              </div>
              <div style={{ width: 1, background: '#dde1e7' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#0e1117' }}>
                  {routeInfo.dur} min
                </div>
                <div style={{ fontSize: '0.65rem', color: '#7a8799', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drive Time</div>
              </div>
              <div style={{ width: 1, background: '#dde1e7' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#f0792a' }}>🚗</div>
                <div style={{ fontSize: '0.65rem', color: '#7a8799', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</div>
              </div>
            </div>
          )}

          {geoStatus === 'denied' && (
            <div style={{ background: 'rgba(224,75,75,0.92)', color: '#fff', borderRadius: '0.75rem', padding: '0.55rem 0.9rem', fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Sora',sans-serif", boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
              Location permission denied. Please enable it in your browser settings.
            </div>
          )}
        </div>
      )}

      {/* Map legend — bottom right */}
      <div style={{
        position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 800,
        background: 'rgba(255,255,255,0.95)', borderRadius: '0.75rem',
        padding: '0.75rem 1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.65rem', fontWeight: 700, color: '#7a8799', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Map Legend
        </div>
        {[
          { color: '#e04b4b', label: 'Issue Location' },
          { color: '#1a9e8f', label: 'Your Location' },
          { color: '#1a9e8f', label: 'Route', dashed: true },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#0e1117', marginBottom: '0.18rem' }}>
            {l.dashed ? (
              <div style={{ width: 12, height: 3, background: l.color, borderRadius: 2 }} />
            ) : (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
            )}
            {l.label}
          </div>
        ))}
      </div>

      {/* Open in Google Maps link */}
      {issueCoords && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 800 }}>
          <button
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${issueCoords[0]},${issueCoords[1]}`, '_blank')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              background: 'rgba(255,255,255,0.95)',
              border: '1.5px solid #dde1e7', borderRadius: '9999px',
              fontFamily: "'Sora',sans-serif", fontSize: '0.72rem', fontWeight: 700,
              color: '#0e1117', cursor: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a9e8f'; e.currentTarget.style.color = '#1a9e8f'; document.body.classList.add('cursor-hover') }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dde1e7'; e.currentTarget.style.color = '#0e1117'; document.body.classList.remove('cursor-hover') }}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Google Maps
          </button>
        </div>
      )}
    </div>
  )
}

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { reports, updateReportStatus, activeDept } = useApp()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const r = reports.find((x) => x.id === Number(id))
  if (!r) {
    navigate('/login')
    return null
  }

  const priority = PRIORITY_MAP[r.categoryId] || 'Medium'
  const priColor = PRIORITY_COLORS[priority]
  const deptKey = (activeDept || '').toLowerCase()
  const backTo = activeDept ? `/dashboard/${deptKey}` : '/login'

  const LogoIcon = () => (
    <div style={{ width: '2rem', height: '2rem', background: 'var(--fg)', borderRadius: '0.5rem' }} className="flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <circle cx="12" cy="8" r="3" /><circle cx="6" cy="14" r="2.5" /><circle cx="18" cy="14" r="2.5" />
        <path d="M12 11v3M8.8 12.6L6 14M15.2 12.6L18 14" />
      </svg>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--card)', borderBottom: '1.5px solid var(--border)', padding: '1rem 1.75rem', position: 'sticky', top: 0, zIndex: 20 }} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)' }}>CitySync</span>
        </div>
        <button
          onClick={() => navigate(backTo)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', border: '1.5px solid var(--border)', borderRadius: '9999px', fontFamily: "'Sora',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', background: 'var(--card)', cursor: 'none', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.color = 'var(--fg)'; hov(true) }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; hov(false) }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Split body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }} className="det-body">
        {/* Left panel */}
        <div style={{ overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg)' }}>
          {/* Complaint ID + status */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2" style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
              # CMP-2025-{String(r.id).padStart(4, '0')}
            </div>
            <StatusBadge status={r.status} />
          </div>

          {/* Title block */}
          <div className="flex items-center gap-3">
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(26,158,143,.12)', fontSize: '1.4rem', flexShrink: 0 }} className="flex items-center justify-center">
              {r.icon}
            </div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.35rem', fontWeight: 800, color: 'var(--fg)', lineHeight: 1.2 }}>{r.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Reported on {r.date} · {r.channel} · #{r.id}</div>
              <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
                Priority{' '}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.18rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", background: `${priColor}20`, color: priColor, border: `1px solid ${priColor}40`, marginLeft: '0.25rem' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: priColor, display: 'inline-block' }} />
                  {priority}
                </span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🏛️', bg: 'rgba(74,144,217,.1)', label: 'Department', val: r.department, valStyle: { fontSize: '0.82rem' } },
              {
                icon: r.status === 'Resolved' ? '✅' : r.status === 'In Progress' ? '🔵' : '🟠',
                bg: 'rgba(26,158,143,.1)', label: 'Status', val: r.status,
                valStyle: { color: r.status === 'Resolved' ? '#166534' : r.status === 'In Progress' ? '#1e40af' : '#854d0e' }
              },
            ].map((card) => (
              <div key={card.label} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '0.6rem', background: card.bg, fontSize: '1.1rem', flexShrink: 0 }} className="flex items-center justify-center">{card.icon}</div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, fontFamily: "'Sora',sans-serif", marginBottom: '0.15rem', letterSpacing: '0.04em' }}>{card.label}</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.88rem', fontWeight: 700, color: 'var(--fg)', ...card.valStyle }}>{card.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.6rem' }}>Description</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--fg)', lineHeight: 1.7 }}>{r.description}</p>
          </div>

          {/* Location */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div className="flex items-start gap-3">
              <div style={{ width: '2.2rem', height: '2.2rem', background: 'rgba(26,158,143,.1)', borderRadius: '0.5rem', fontSize: '1rem', flexShrink: 0 }} className="flex items-center justify-center">📍</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, fontFamily: "'Sora',sans-serif", marginBottom: '0.25rem', letterSpacing: '0.04em' }}>LOCATION</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--fg)' }}>{r.location || 'Not provided'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.1rem' }}>Mumbai, Maharashtra</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.location)}`, '_blank')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', border: '1.5px solid var(--border)', borderRadius: '9999px', background: 'var(--card)', fontFamily: "'Sora',sans-serif", fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg)', cursor: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; hov(true) }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg)'; hov(false) }}
                  >
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Open in Maps
                  </button>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.location)}`, '_blank')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', border: '1.5px solid var(--primary)', borderRadius: '9999px', background: 'rgba(26,158,143,0.08)', fontFamily: "'Sora',sans-serif", fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', cursor: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={() => hov(true)}
                    onMouseLeave={() => hov(false)}
                  >
                    🗺️ Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Phone */}
          {r.phone && (
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.6rem' }}>Reporter Contact</div>
              <div className="flex items-center gap-2">
                <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '50%', background: 'var(--bg2)', fontSize: '0.85rem' }} className="flex items-center justify-center">📞</div>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{r.phone}</span>
              </div>
            </div>
          )}

          {/* Media */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.75rem' }}>Media</div>
            {r.photo ? (
              <div className="grid grid-cols-3 gap-2">
                <div style={{ borderRadius: '0.5rem', overflow: 'hidden', aspectRatio: '4/3', background: '#eee' }}>
                  <img src={r.photo} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {[0, 1].map((i) => (
                  <div key={i} style={{ borderRadius: '0.5rem', background: 'var(--bg2)', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                    No more photos
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', background: 'var(--bg2)', borderRadius: '0.5rem' }}>
                No photos uploaded for this report
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.75rem' }}>Actions</div>
            <div className="flex gap-2 flex-wrap">
              {['Pending', 'In Progress', 'Resolved'].filter((s) => s !== r.status).map((s) => (
                <button
                  key={s}
                  onClick={() => updateReportStatus(r.id, s)}
                  style={{ padding: '0.5rem 1.1rem', border: '1.5px solid var(--primary)', borderRadius: '0.5rem', background: 'transparent', color: 'var(--primary)', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,158,143,.08)'; hov(true) }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; hov(false) }}
                >
                  Mark as: {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — LIVE MAP */}
        <div style={{ position: 'sticky', top: 64, height: 'calc(100vh - 64px)', background: '#e8eef0', overflow: 'hidden' }}>
          <LiveMap location={r.location} reportId={r.id} />
        </div>
      </div>

      {/* Bottom actions bar */}
      <div style={{ padding: '0.85rem 1.5rem', background: 'var(--card)', borderTop: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {[
          { icon: '↑', label: 'Share' },
          { icon: '↓', label: 'Download' },
          { icon: '•••', label: 'More ▾' },
        ].map((btn) => (
          <button
            key={btn.label}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', border: '1.5px solid var(--border)', borderRadius: '9999px', background: 'var(--card)', fontFamily: "'Sora',sans-serif", fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', cursor: 'none', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.color = 'var(--fg)'; hov(true) }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; hov(false) }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
