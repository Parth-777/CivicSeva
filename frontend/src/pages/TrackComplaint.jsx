import { useState } from 'react'
import InnerNav from '../components/ui/InnerNav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100'

export default function TrackComplaint() {
  const [trackId, setTrackId] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hov = (on) =>
    document.body.classList.toggle('cursor-hover', on)

  const handleTrack = async () => {
    const id = trackId.trim()

    if (!id) {
      setError('Please enter a complaint ID.')
      setComplaint(null)
      return
    }

    setLoading(true)
    setError('')
    setComplaint(null)

    try {
      const response = await fetch(
        `${API_URL}/api/complaints/track?id=${encodeURIComponent(id)}`,
        {
          method: 'GET',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Complaint not found.')
        return
      }

      setComplaint(data.complaint)
    } catch (err) {
      console.error('Track complaint error:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------
  const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // --------------------------------------------------
  // STATUS HELPERS
  // --------------------------------------------------
  const getStatus = () => {
    if (!complaint?.status) return 'pending'

    return complaint.status.toLowerCase()
  }

  const status = getStatus()

  const isPending =
    status === 'pending'

  const isVerified =
    status === 'verified' ||
    status === 'in progress' ||
    status === 'resolved'

  const isInProgress =
    status === 'in progress' ||
    status === 'resolved'

  const isResolved =
    status === 'resolved'

  // --------------------------------------------------
  // TIMELINE
  // --------------------------------------------------
  const timeline = complaint
    ? [
        {
          dot: '✅',
          title: 'Complaint Submitted',
          time: formatDate(complaint.createdAt),
          done: true,
        },
        {
          dot: '🏛️',
          title: 'Complaint Received',
          time: formatDate(complaint.updatedAt),
          done: isVerified || isInProgress || isResolved,
          active: isPending,
        },
        {
          dot: '👷',
          title: 'In Progress',
          time: isInProgress
            ? formatDate(complaint.updatedAt)
            : 'Waiting for department action',
          done: isInProgress || isResolved,
          active: status === 'in progress',
        },
        {
          dot: '✅',
          title: 'Resolution & Closure',
          time: isResolved
            ? formatDate(complaint.updatedAt)
            : 'Pending',
          done: isResolved,
          active: false,
        },
      ]
    : []

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <InnerNav backTo="/" />

      <div
        style={{
          flex: 1,
          padding: '2.5rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '36rem',
            margin: '0 auto',
          }}
        >
          {/* -------------------------------------------------- */}
          {/* HEADER */}
          {/* -------------------------------------------------- */}

          <div
            style={{
              marginBottom: '2rem',
              animation: 'fadeIn 0.5s ease-out forwards',
            }}
          >
            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: '1.75rem',
                fontWeight: 800,
                marginBottom: '0.4rem',
              }}
            >
              Track Your Complaint
            </h2>

            <p
              style={{
                color: 'var(--muted)',
                fontSize: '0.9rem',
              }}
            >
              Enter your complaint ID to see the current status of your complaint
            </p>
          </div>

          {/* -------------------------------------------------- */}
          {/* SEARCH BAR */}
          {/* -------------------------------------------------- */}

          <div
            className="flex gap-3 mb-8"
            style={{
              animation: 'fadeIn 0.5s ease-out 0.1s both',
            }}
          >
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTrack()
                }
              }}
              placeholder="Enter complaint ID"
              style={{
                flex: 1,
                border: '1.5px solid var(--border)',
                borderRadius: '0.875rem',
                padding: '0.9rem 1.1rem',
                fontFamily: "'DM Sans',sans-serif",
                fontSize: '1rem',
                color: 'var(--fg)',
                background: 'var(--card)',
                outline: 'none',
                cursor: 'text',
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = 'var(--primary)')
              }
              onBlur={(e) =>
                (e.target.style.borderColor = 'var(--border)')
              }
            />

            <button
              onClick={handleTrack}
              disabled={loading}
              style={{
                padding: '0 1.5rem',
                background: 'var(--fg)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.875rem',
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                cursor: loading ? 'wait' : 'none',
                flexShrink: 0,
                fontSize: '0.9rem',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={() => hov(true)}
              onMouseLeave={() => hov(false)}
            >
              {loading ? 'Loading...' : 'Track →'}
            </button>
          </div>

          {/* -------------------------------------------------- */}
          {/* ERROR */}
          {/* -------------------------------------------------- */}

          {error && (
            <div
              style={{
                background: '#fff0f0',
                border: '1px solid #ffb3b3',
                color: '#dc2626',
                borderRadius: '0.875rem',
                padding: '1rem',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* COMPLAINT DETAILS */}
          {/* -------------------------------------------------- */}

          {complaint && (
            <div
              style={{
                animation: 'fadeIn 0.5s ease-out',
              }}
            >
              {/* -------------------------------------------------- */}
              {/* HERO CARD */}
              {/* -------------------------------------------------- */}

              <div
                style={{
                  background:
                    'linear-gradient(135deg,#1a2332,#0e1117)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  marginBottom: '1.25rem',
                  color: '#fff',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,.45)',
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  COMPLAINT ID · {complaint._id}
                </div>

                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                  }}
                >
                  {complaint.description}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Issue type */}
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: "'Sora',sans-serif",
                      background: 'rgba(74,144,217,.2)',
                      color: '#93c5fd',
                    }}
                  >
                    🛣️ {complaint.issueType}
                  </span>

                  {/* Severity */}
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: "'Sora',sans-serif",
                      background: 'rgba(240,121,42,.2)',
                      color: '#fb923c',
                    }}
                  >
                    ⚠️ {complaint.severity || 'N/A'}
                  </span>

                  {/* Status */}
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: "'Sora',sans-serif",
                      background: 'rgba(26,158,143,.2)',
                      color: '#4ecdc4',
                    }}
                  >
                    📌 {complaint.status}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,.5)',
                  }}
                >
                  📍 {complaint.location || 'Location not available'}
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,.5)',
                    marginTop: '0.35rem',
                  }}
                >
                  Submitted · {formatDate(complaint.createdAt)}
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* COMPLAINT DESCRIPTION */}
              {/* -------------------------------------------------- */}

              <div
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '0.8rem',
                  }}
                >
                  Complaint Description
                </div>

                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'var(--muted)',
                  }}
                >
                  {complaint.description}
                </p>
              </div>

              {/* -------------------------------------------------- */}
              {/* COMPLAINT INFORMATION */}
              {/* -------------------------------------------------- */}

              <div
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                  }}
                >
                  Complaint Details
                </div>

                {[
                  {
                    label: 'Complaint ID',
                    value: complaint._id,
                  },
                  {
                    label: 'Complaint Type',
                    value: complaint.issueType,
                  },
                  {
                    label: 'Location',
                    value: complaint.location || 'Not available',
                  },
                  {
                    label: 'Severity',
                    value: complaint.severity || 'Not available',
                  },
                  {
                    label: 'Current Status',
                    value: complaint.status,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2"
                    style={{
                      borderBottom:
                        '1px solid var(--border)',
                      gap: '1rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--muted)',
                        fontWeight: 500,
                      }}
                    >
                      {row.label}
                    </span>

                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        fontFamily: "'Sora',sans-serif",
                        color:
                          row.label === 'Current Status'
                            ? 'var(--primary)'
                            : 'var(--fg)',
                        textAlign: 'right',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* -------------------------------------------------- */}
              {/* STATUS TIMELINE */}
              {/* -------------------------------------------------- */}

              <div
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  Status Timeline
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                  }}
                >
                  {timeline.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        position: 'relative',
                        paddingBottom:
                          i < timeline.length - 1
                            ? '1.25rem'
                            : 0,
                        opacity:
                          !item.done && !item.active
                            ? 0.4
                            : 1,
                      }}
                    >
                      {i < timeline.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 16,
                            top: 32,
                            bottom: 0,
                            width: 2,
                            background: 'var(--border)',
                          }}
                        />
                      )}

                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: item.active
                            ? 'rgba(26,158,143,.15)'
                            : item.done
                            ? 'rgba(26,158,143,.08)'
                            : 'var(--bg2)',
                          border: item.active
                            ? '2px solid var(--primary)'
                            : '1.5px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      >
                        {item.dot}
                      </div>

                      <div
                        style={{
                          paddingTop: '0.2rem',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Sora',sans-serif",
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            color: item.active
                              ? 'var(--primary)'
                              : 'var(--fg)',
                          }}
                        >
                          {item.title}
                        </div>

                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted)',
                            marginTop: '0.1rem',
                          }}
                        >
                          {item.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* IMAGE */}
              {/* -------------------------------------------------- */}

              {complaint.imageUrl && (
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    marginTop: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      marginBottom: '0.8rem',
                    }}
                  >
                    Photo Evidence
                  </div>

                  <img
                    src={complaint.imageUrl}
                    alt="Complaint evidence"
                    style={{
                      width: '100%',
                      borderRadius: '0.75rem',
                      display: 'block',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}