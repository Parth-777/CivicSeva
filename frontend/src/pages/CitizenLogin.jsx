import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import InnerNav from '../components/ui/InnerNav'
import { useApp } from '../context/AppContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100'

// Mumbai — matches the citizen-services context. Swap if you want a
// different default city, or wire this up to the user's geolocation.
const MAP_CENTER = [19.076, 72.8777]

// ---------------------------------------------------------------------------
// Real, interactive Leaflet map used as a full-page background.
// Loads Leaflet from a CDN at runtime (no npm install required), so this
// component is a drop-in. If your project already has `leaflet` installed,
// you can swap the dynamic loader below for a normal `import L from 'leaflet'`
// + `import 'leaflet/dist/leaflet.css'` instead.
// ---------------------------------------------------------------------------
function LeafletBackgroundMap() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    function loadLeaflet() {
      return new Promise((resolve, reject) => {
        if (window.L) {
          resolve(window.L)
          return
        }

        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        const existingScript = document.getElementById('leaflet-js')
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.L))
          existingScript.addEventListener('error', reject)
          return
        }

        const script = document.createElement('script')
        script.id = 'leaflet-js'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = () => resolve(window.L)
        script.onerror = reject
        document.body.appendChild(script)
      })
    }

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current, {
          center: MAP_CENTER,
          zoom: 12,
          minZoom: 4,
          maxZoom: 18,
          zoomControl: false, // custom-positioned control added below
          attributionControl: true,
          dragging: true, // pannable / "movable"
          // --- zoom in / out interactions, all enabled ---
          scrollWheelZoom: true, // mouse wheel zoom
          doubleClickZoom: true, // double-click to zoom in
          touchZoom: true, // pinch-to-zoom on touch devices
          boxZoom: true, // shift-drag to zoom into an area
          keyboard: true, // +/- and arrow keys once map is focused
          zoomSnap: 0.5, // finer zoom increments
          zoomDelta: 0.5,
          wheelPxPerZoomLevel: 90, // smoother wheel zoom
          zoomAnimation: true,
          markerZoomAnimation: true,
        })

        // Clean, light basemap so the login card stays legible on top.
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
          }
        ).addTo(map)

        // Zoom in/out buttons, bottom-right so they don't collide with the card.
        L.control.zoom({ position: 'bottomright' }).addTo(map)

        // Pulsing "you are here" marker.
        const pulseIcon = L.divIcon({
          className: '',
          html: `
            <div class="citizenmap-pin">
              <span class="citizenmap-pin-ring"></span>
              <span class="citizenmap-pin-ring citizenmap-pin-ring--delay"></span>
              <span class="citizenmap-pin-core"></span>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        })
        L.marker(MAP_CENTER, { icon: pulseIcon, interactive: false }).addTo(map)

        // Gentle intro: ease in (zoom + pan together) from a wider view.
        map.setView(
          [MAP_CENTER[0] + 0.06, MAP_CENTER[1] - 0.06],
          9.5,
          { animate: false }
        )
        setTimeout(() => {
          if (!cancelled) map.flyTo(MAP_CENTER, 12, { duration: 1.8 })
        }, 150)

        mapRef.current = map

        const handleResize = () => map.invalidateSize()
        window.addEventListener('resize', handleResize)
        map.__handleResize = handleResize
      })
      .catch(() => {
        // Fail quietly — background map is decorative, not critical path.
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        window.removeEventListener('resize', mapRef.current.__handleResize)
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
      }}
    >
      <style>{`
        .citizenmap-pin {
          position: relative;
          width: 18px;
          height: 18px;
        }
        .citizenmap-pin-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid var(--primary);
          animation: citizenmap-pulse 2.6s ease-out infinite;
        }
        .citizenmap-pin-ring--delay {
          animation-delay: 1.3s;
        }
        .citizenmap-pin-core {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 25%, transparent);
        }
        @keyframes citizenmap-pulse {
          0%   { transform: scale(0.3); opacity: 0.9; }
          70%  { opacity: 0; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        .leaflet-control-attribution {
          font-size: 0.65rem !important;
          opacity: 0.7;
        }
        .leaflet-control-zoom a {
          color: var(--fg) !important;
          background: color-mix(in srgb, var(--card) 92%, transparent) !important;
          backdrop-filter: blur(6px);
        }
        .leaflet-control-zoom a:hover {
          background: var(--card) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .citizenmap-pin-ring { animation: none !important; }
        }
      `}</style>

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Soft scrim so the floating card stays readable over the map */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 45%, transparent 0%, color-mix(in srgb, var(--bg) 55%, transparent) 65%, var(--bg) 100%)',
        }}
      />
    </div>
  )
}

export default function CitizenLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useApp()

  // If the user was redirected here by ProtectedRoute,
  // send them back to the page they originally wanted.
  // Otherwise go to categories.
  const from = location.state?.from || '/categories'

  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const sendOtp = async () => {
    setError('')
    setMessage('')

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',

        // IMPORTANT:
        // Allows browser to send/receive the backend session cookie.
        credentials: 'include',

        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to send OTP.')
        return
      }

      setOtpSent(true)
      setCountdown(60)
      setMessage('OTP sent successfully to your mobile number.')
    } catch (err) {
      console.error('Send OTP error:', err)
      setError('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setError('')
    setMessage('')

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit OTP.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',

        // IMPORTANT:
        // This allows the browser to receive/store
        // the civicseva_session cookie from localhost:3100.
        credentials: 'include',

        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Invalid or expired OTP.')
        return
      }

      console.log('Login successful:', data)

      setMessage('Login successful!')

      // --------------------------------------------------
      // Update frontend authentication state
      // --------------------------------------------------

      login({
        mobileNumber,
        ...(data.user || {}),
        token: data.token || null,
      })

      // Give browser a moment to store the cookie
      // before navigating to the protected page.
      setTimeout(() => {
        navigate(from)
      }, 700)
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (countdown > 0) return

    await sendOtp()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <LeafletBackgroundMap />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <InnerNav backTo="/" />

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              animation: 'fadeIn 0.5s ease-out forwards',
            }}
          >
            <div className="text-center mb-8">
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.875rem',
                  fontWeight: 1000,
                  
                }}
              >
                Citizen Login
              </h2>

              <p
                style={{
                  color: 'var(--muted)',
                  marginTop: '0.5rem',
                }}
              >
               
              </p>
            </div>

            <div
              style={{
                background: 'color-mix(in srgb, var(--card) 88%, transparent)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1.5px solid var(--border)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 12px 40px rgba(14,17,23,0.16)',
                
              }}
            >
              {!otpSent ? (
                <>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Mobile Number
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.85rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.65rem',
                        background: 'var(--bg)',
                        fontWeight: 600,
                      }}
                    >
                      +91
                    </div>

                    <input
                      type="tel"
                      maxLength="10"
                      value={mobileNumber}
                      onChange={(e) =>
                        setMobileNumber(
                          e.target.value.replace(/\D/g, '')
                        )
                      }
                      placeholder="Enter mobile number"
                      style={{
                        flex: 1,
                        padding: '0.85rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.65rem',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  {error && (
                    <div
                      style={{
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      border: 'none',
                      borderRadius: '0.7rem',
                      background: 'var(--fg)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>

                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '1.5rem',
                      color: 'var(--muted)',
                      fontSize: '0.9rem',
                    }}
                  >
                   {' '}
                    
                     
                    
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p
                      style={{
                        color: 'var(--muted)',
                        fontSize: '0.9rem',
                      }}
                    >
                      We sent a 6-digit OTP to
                    </p>

                    <strong>
                      +91 {mobileNumber}
                    </strong>
                  </div>

                  <label
                    style={{
                      display: 'block',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Enter OTP
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="Enter 6-digit OTP"
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.65rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: '1.2rem',
                      textAlign: 'center',
                      letterSpacing: '0.4rem',
                      marginBottom: '1rem',
                    }}
                  />

                  {error && (
                    <div
                      style={{
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {message && (
                    <div
                      style={{
                        color: '#16a34a',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      {message}
                    </div>
                  )}

                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      border: 'none',
                      borderRadius: '0.7rem',
                      background: 'var(--fg)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '1rem',
                    }}
                  >
                    {countdown > 0 ? (
                      <span
                        style={{
                          color: 'var(--muted)',
                          fontSize: '0.9rem',
                        }}
                      >
                        Resend OTP in {countdown}s
                      </span>
                    ) : (
                      <button
                        onClick={resendOtp}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '1rem',
                    }}
                  >
                    <button
                      onClick={() => {
                        setOtpSent(false)
                        setOtp('')
                        setError('')
                        setMessage('')
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Change mobile number
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}