import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { DEPT_CONFIG, STATUS_COLORS } from '../data/reportStore'
import StatusBadge from '../components/ui/StatusBadge'

const LogoIcon = () => (
  <div style={{ width: '2rem', height: '2rem', background: '#fff', borderRadius: '0.5rem', opacity: 0.9 }} className="flex items-center justify-center flex-shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" strokeWidth="2">
      <circle cx="12" cy="8" r="3" /><circle cx="6" cy="14" r="2.5" /><circle cx="18" cy="14" r="2.5" />
      <path d="M12 11v3M8.8 12.6L6 14M15.2 12.6L18 14" />
    </svg>
  </div>
)

export default function Dashboard() {
  const { dept } = useParams()
  const navigate = useNavigate()
  const { reports, activeDept, setActiveDept } = useApp()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const deptKey = (dept || activeDept || '').toUpperCase()
  const cfg = DEPT_CONFIG[deptKey]

  if (!cfg) {
    navigate('/gov-login')
    return null
  }

  const relevant = reports.filter((r) => cfg.allowedCategories.includes(r.categoryId))

  const logout = () => {
    setActiveDept(null)
    navigate('/login')
  }

  const tagColors = {
    MUNICIPAL: { bg: 'rgba(26,158,143,.15)', color: 'var(--primary)' },
    ROADWAYS: { bg: 'rgba(74,144,217,.15)', color: '#4a90d9' },
    RAILWAY: { bg: 'rgba(124,58,237,.15)', color: '#7c3aed' },
  }
  const tagStyle = tagColors[deptKey] || tagColors.MUNICIPAL

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--fg)', padding: '1rem 1.75rem' }} className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <LogoIcon />
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            {cfg.icon} {cfg.label}
          </span>
          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", ...tagStyle }}>
            {deptKey}
          </span>
        </div>
        <button
          onClick={logout}
          style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '0.5rem 1.2rem', borderRadius: '9999px', fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: '0.82rem', cursor: 'none' }}
          onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
        >
          Logout ↩
        </button>
      </div>

      <div style={{ flex: 1, padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { num: cfg.stats.open, lbl: 'Open Issues', color: '#f0792a' },
              { num: cfg.stats.critical, lbl: 'Critical', color: '#e04b4b' },
              { num: cfg.stats.inProgress, lbl: 'In Progress', color: '#4a90d9' },
              { num: cfg.stats.resolved, lbl: 'Resolved (Month)', color: '#1a9e8f' },
            ].map((s) => (
              <div key={s.lbl} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(14,17,23,0.08)' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '2.25rem', fontWeight: 800, color: s.color }}>{s.num}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Reports */}
          {relevant.length === 0 ? (
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
              No citizen reports yet for this department.
            </div>
          ) : (
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(14,17,23,0.08)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>📬</span>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem' }}>Citizen Submitted Reports</h3>
                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", background: 'rgba(26,158,143,.12)', color: 'var(--primary)' }}>
                  {relevant.length} reports
                </span>
              </div>
              {[...relevant].reverse().map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/issue/${r.id}`)}
                  style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', cursor: 'none', transition: 'background 0.15s' }}
                  className="hover:bg-bg"
                  onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
                >
                  {r.photo ? (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={r.photo} alt="Issue" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '0.65rem', border: '2px solid rgba(26,158,143,.25)' }} />
                    </div>
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: '0.65rem', background: 'rgba(26,158,143,.08)', border: '2px dashed rgba(26,158,143,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                      {r.icon}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--fg)' }}>{r.title}</div>
                      <StatusBadge status={r.status} />
                      {r.photo && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", padding: '0.18rem 0.55rem', borderRadius: '9999px', background: 'rgba(26,158,143,.12)', color: 'var(--primary)' }}>
                          📷 Photo
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                      {r.date} · via {r.channel} · #{r.id}{r.phone ? ` · 📱 ${r.phone}` : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>📍 {r.location || 'No location'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{r.description}</div>
                  </div>
                  <div style={{ color: 'var(--primary)', fontSize: '1.4rem', fontWeight: 300, alignSelf: 'center', flexShrink: 0 }}>›</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}