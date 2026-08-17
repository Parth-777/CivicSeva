import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import InnerNav from '../components/ui/InnerNav'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3100'

const MAP_CENTER = [19.076, 72.8777]

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
          link.href =
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        const existingScript =
          document.getElementById('leaflet-js')

        if (existingScript) {
          existingScript.addEventListener('load', () =>
            resolve(window.L)
          )
          existingScript.addEventListener('error', reject)
          return
        }

        const script = document.createElement('script')
        script.id = 'leaflet-js'
        script.src =
          'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = () => resolve(window.L)
        script.onerror = reject
        document.body.appendChild(script)
      })
    }

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current)
          return

        const map = L.map(containerRef.current, {
          center: MAP_CENTER,
          zoom: 12,
          minZoom: 4,
          maxZoom: 18,
          zoomControl: false,
          attributionControl: true,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          boxZoom: true,
          keyboard: true,
          zoomSnap: 0.5,
          zoomDelta: 0.5,
          wheelPxPerZoomLevel: 90,
          zoomAnimation: true,
          markerZoomAnimation: true,
        })

        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
          }
        ).addTo(map)

        L.control.zoom({
          position: 'bottomright',
        }).addTo(map)

        const pulseIcon = L.divIcon({
          className: '',
          html: `
            <div class="govmap-pin">
              <span class="govmap-pin-ring"></span>
              <span class="govmap-pin-ring govmap-pin-ring--delay"></span>
              <span class="govmap-pin-core"></span>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        })

        L.marker(MAP_CENTER, {
          icon: pulseIcon,
          interactive: false,
        }).addTo(map)

        mapRef.current = map

        map.invalidateSize()

        map.setView(
          [MAP_CENTER[0] + 0.06, MAP_CENTER[1] - 0.06],
          9.5,
          { animate: false }
        )

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (cancelled || !mapRef.current) return

            mapRef.current.invalidateSize()

            mapRef.current.flyTo(
              MAP_CENTER,
              12,
              { duration: 1.8 }
            )
          })
        })

        const handleResize = () => map.invalidateSize()

        window.addEventListener(
          'resize',
          handleResize
        )

        map.__handleResize = handleResize
      })
      .catch((err) => {
        console.warn(
          'Background map failed to load:',
          err
        )
      })

    return () => {
      cancelled = true

      if (mapRef.current) {
        window.removeEventListener(
          'resize',
          mapRef.current.__handleResize
        )

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
        .govmap-pin {
          position: relative;
          width: 18px;
          height: 18px;
        }

        .govmap-pin-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid var(--primary);
          animation: govmap-pulse 2.6s ease-out infinite;
        }

        .govmap-pin-ring--delay {
          animation-delay: 1.3s;
        }

        .govmap-pin-core {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: var(--primary);
          box-shadow:
            0 0 0 3px
            color-mix(
              in srgb,
              var(--primary) 25%,
              transparent
            );
        }

        @keyframes govmap-pulse {
          0% {
            transform: scale(0.3);
            opacity: 0.9;
          }

          70% {
            opacity: 0;
          }

          100% {
            transform: scale(3.2);
            opacity: 0;
          }
        }

        .leaflet-control-attribution {
          font-size: 0.65rem !important;
          opacity: 0.7;
        }

        .leaflet-control-zoom a {
          color: var(--fg) !important;
          background:
            color-mix(
              in srgb,
              var(--card) 92%,
              transparent
            ) !important;
          backdrop-filter: blur(6px);
        }

        .leaflet-control-zoom a:hover {
          background: var(--card) !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .govmap-pin-ring {
            animation: none !important;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

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

export default function GovLogin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const hov = (on) =>
    document.body.classList.toggle(
      'cursor-hover',
      on
    )

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setError(true)
      setErrorMsg(
        'Please enter both ID and password.'
      )
      return
    }

    setLoading(true)
    setError(false)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/gov-login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          credentials: 'include',

          body: JSON.stringify({
            username,
            password,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        navigate('/dashboard/municipal')
      } else {
        setError(true)

        setErrorMsg(
          data.message ||
            'Incorrect ID or Password. Please try again.'
        )

        setPassword('')
      }
    } catch (err) {
      console.error(
        'Gov login failed:',
        err
      )

      setError(true)

      setErrorMsg(
        'Could not reach the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    border: '1.5px solid var(--border)',
    borderRadius: '0.875rem',
    padding: '0.9rem 1.1rem',
    fontFamily: "'DM Sans',sans-serif",
    fontSize: '1rem',
    color: 'var(--fg)',
    background: 'var(--card)',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <LeafletBackgroundMap />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
          }}
        >
          <InnerNav backTo="/" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              animation:
                'fadeIn 0.5s ease-out forwards',
              pointerEvents: 'auto',
            }}
          >
            <div className="text-center mb-7">
              <div
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                🏛️
              </div>

              <h2
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  marginBottom: '0.4rem',
                }}
              >
                Official Portal
              </h2>

              <p
                style={{
                  color: 'var(--muted)',
                  fontSize: '0.92rem',
                }}
              >
                Log in with your government credentials
              </p>
            </div>

            <div
              style={{
                background:
                  'color-mix(in srgb, var(--card) 88%, transparent)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border:
                  '1.5px solid var(--border)',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow:
                  '0 12px 40px rgba(14,17,23,0.16)',
              }}
            >
              <div
                style={{
                  marginBottom: '1.25rem',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.6rem',
                    color: 'var(--fg)',
                    fontFamily:
                      "'Sora',sans-serif",
                  }}
                >
                  Government ID
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' && login()
                  }
                  placeholder="Enter your ID"
                  style={{
                    ...inputStyle,
                    letterSpacing: '0.05em',
                    cursor: 'text',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor =
                      'var(--primary)')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      'var(--border)')
                  }
                />
              </div>

              <div
                style={{
                  marginBottom: '1.25rem',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.6rem',
                    color: 'var(--fg)',
                    fontFamily:
                      "'Sora',sans-serif",
                  }}
                >
                  Password
                </label>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <input
                    type={
                      showPwd
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      login()
                    }
                    placeholder="••••••••"
                    style={{
                      ...inputStyle,
                      paddingRight: '3rem',
                      cursor: 'text',
                      borderColor: error
                        ? 'var(--red)'
                        : 'var(--border)',
                    }}
                    onFocus={(e) =>
                      !error &&
                      (e.target.style.borderColor =
                        'var(--primary)')
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor =
                        error
                          ? 'var(--red)'
                          : 'var(--border)')
                    }
                  />

                  <button
                    onClick={() =>
                      setShowPwd((v) => !v)
                    }
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform:
                        'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'none',
                      color: 'var(--muted)',
                      fontSize: '1.1rem',
                    }}
                    onMouseEnter={() =>
                      hov(true)
                    }
                    onMouseLeave={() =>
                      hov(false)
                    }
                  >
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--red)',
                      marginTop: '0.4rem',
                    }}
                  >
                    ⚠ {errorMsg}
                  </p>
                )}
              </div>

              <button
                onClick={login}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'var(--fg)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.875rem',
                  fontFamily:
                    "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: loading
                    ? 'default'
                    : 'none',
                  marginTop: '0.5rem',
                  transition: 'all 0.25s',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={() =>
                  hov(true)
                }
                onMouseLeave={() =>
                  hov(false)
                }
              >
                {loading
                  ? 'Logging in...'
                  : 'Access Dashboard'}
              </button>

              <p
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  marginTop: '1rem',
                }}
              >
                Authorised personnel only ·
                CivicSeva Gov v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}