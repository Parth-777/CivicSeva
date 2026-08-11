import { useState } from 'react'
import InnerNav from '../components/ui/InnerNav'

const timeline = [
  { dot: '✅', title: 'Complaint Submitted', time: 'Apr 10, 2024 · 09:14 AM', done: true },
  { dot: '🧠', title: 'AI Classified & Routed', time: 'Apr 10, 2024 · 09:14 AM (automated)', done: true },
  { dot: '🏛️', title: 'Received by Municipal Road Dept', time: 'Apr 10, 2024 · 10:02 AM', done: true },
  { dot: '👷', title: 'Field Team Assigned — In Progress', time: 'Apr 11, 2024 · 08:30 AM', done: true, active: true },
  { dot: '⏳', title: 'Resolution & Closure', time: 'Expected Apr 13, 2024', done: false },
]

export default function TrackComplaint() {
  const [trackId, setTrackId] = useState('')
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const handleTrack = () => {
    if (trackId.trim()) alert(`Complaint "${trackId}" not found. Showing demo below.`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InnerNav backTo="/" />
      <div style={{ flex: 1, padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.5s ease-out forwards' }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Track Your Complaint</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Enter your complaint ID or see a sample complaint below</p>
          </div>

          {/* Search bar */}
          <div className="flex gap-3 mb-8" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="e.g. CS-2024-0412"
              style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '0.9rem 1.1rem', fontFamily: "'DM Sans',sans-serif", fontSize: '1rem', color: 'var(--fg)', background: 'var(--card)', outline: 'none', cursor: 'text' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={handleTrack}
              style={{ padding: '0 1.5rem', background: 'var(--fg)', color: '#fff', border: 'none', borderRadius: '0.875rem', fontFamily: "'Sora',sans-serif", fontWeight: 700, cursor: 'none', flexShrink: 0, fontSize: '0.9rem' }}
              onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
            >
              Track →
            </button>
          </div>

          {/* Demo complaint */}
          <div style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
            {/* Hero card */}
            <div style={{ background: 'linear-gradient(135deg,#1a2332,#0e1117)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.25rem', color: '#fff' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.45)', fontFamily: "'Sora',sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                COMPLAINT ID · CS-2024-0391
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Large pothole causing tyre damage near bus stop
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: '🛣️ Road Issues', bg: 'rgba(74,144,217,.2)', color: '#93c5fd' },
                  { label: 'Municipal Road Dept', bg: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' },
                  { label: '🟠 High Priority', bg: 'rgba(240,121,42,.2)', color: '#fb923c' },
                  { label: '🧠 AI Classified', bg: 'rgba(26,158,143,.2)', color: '#4ecdc4' },
                ].map((tag) => (
                  <span key={tag.label} style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", background: tag.bg, color: tag.color }}>
                    {tag.label}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.5)' }}>📍 MG Road, Near Central Bus Stand · Submitted Apr 10, 2024</div>
            </div>

            {/* AI Analysis */}
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2 mb-4" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--fg)' }}>
                <span>🧠</span> AI Analysis
              </div>
              {[
                { label: 'Classification', val: 'Road Issues — Pothole', color: 'var(--primary)' },
                { label: 'Priority Score', val: 'High (8.2 / 10)', color: 'var(--orange)' },
                { label: 'Duplicate Check', val: '✓ Unique', color: 'var(--green)' },
                { label: 'Estimated Resolution', val: '2–3 Working Days', color: null },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: row.color || 'var(--fg)' }}>{row.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500 }}>Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="conf-bar"><div className="conf-fill" style={{ width: '92%' }} /></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>92%</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1rem', padding: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Status Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {timeline.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', position: 'relative', paddingBottom: i < timeline.length - 1 ? '1.25rem' : 0, opacity: !item.done && !item.active ? 0.4 : 1 }}>
                    {i < timeline.length - 1 && (
                      <div style={{ position: 'absolute', left: 16, top: 32, bottom: 0, width: 2, background: 'var(--border)' }} />
                    )}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.active ? 'rgba(26,158,143,.15)' : item.done ? 'rgba(26,158,143,.08)' : 'var(--bg2)', border: item.active ? '2px solid var(--primary)' : '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, zIndex: 1 }}>
                      {item.dot}
                    </div>
                    <div style={{ paddingTop: '0.2rem' }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: item.active ? 'var(--primary)' : 'var(--fg)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}