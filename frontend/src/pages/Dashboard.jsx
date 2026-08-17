import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'

const API_BASE_URL = import.meta.env.VITE_API_URL

// These 4 match exactly what the ML pipeline classifies complaints into
// (see gemini_pipeline.py's Department enum) -- keep these in sync if that
// list ever changes.
const DEPARTMENTS = [
  { key: 'ROADS', match: 'Roads & Public Works', label: 'Roads & Public Works', icon: '🚧' },
  { key: 'DRAINAGE', match: 'Drainage & Water Management', label: 'Drainage & Water Management', icon: '💧' },
  { key: 'SANITATION', match: 'Sanitation & Solid Waste', label: 'Sanitation & Solid Waste', icon: '🗑️' },
  { key: 'RAILWAY', match: 'Railway / Transport', label: 'Railway / Transport', icon: '🚆' },
]

const DEPT_TAG_STYLE = {
  ROADS: { bg: 'rgba(240,121,42,.12)', color: '#c9711f' },
  DRAINAGE: { bg: 'rgba(74,144,217,.12)', color: '#3178c6' },
  SANITATION: { bg: 'rgba(26,158,143,.12)', color: '#178a7c' },
  RAILWAY: { bg: 'rgba(124,58,237,.12)', color: '#6d28d9' },
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: '🏠' },
  { key: 'all', label: 'All Complaints', icon: '📋' },
]

// Maps one raw complaint document from MongoDB into the shape this page
// renders. Centralized here so every place in the file uses the same
// field names, regardless of what the backend calls them.
function mapComplaint(c) {
  const deptEntry = DEPARTMENTS.find((d) => d.match === c.department)
  return {
    id: c._id,
    title: c.problem || c.issueType || 'Unclassified issue',
    icon: deptEntry?.icon || '⚠️',
    department: c.department || 'Unclassified',
    deptKey: deptEntry?.key || null,
    description: c.description,
    location: c.address,
    photo: c.imageUrl,
    phone: c.phoneNumber,
    severity: c.severity || 'medium',
    // NOTE: the backend schema only has "pending"/"complete" right now --
    // there's no "In Progress" state yet. Every non-complete complaint
    // shows as "Pending" until that's added to the schema + a status
    // update endpoint exists.
    status: c.status === 'complete' ? 'Resolved' : 'Pending',
    date: c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '',
    channel: 'Website',
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function downloadCSV(reports) {
  const headers = ['ID', 'Issue', 'Department', 'Location', 'Status', 'Severity', 'Date']
  const rows = reports.map((r) => [r.id, r.title, r.department, r.location, r.status, r.severity, r.date])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `civicseva-complaints-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function openPrintableReport(reports, stats) {
  const win = window.open('', '_blank')
  if (!win) return
  const rows = reports
    .map(
      (r) => `<tr>
        <td>#${r.id}</td><td>${r.title}</td><td>${r.department}</td>
        <td>${r.location}</td><td>${r.status}</td><td>${formatDate(r.date)}</td>
      </tr>`
    )
    .join('')
  win.document.write(`
    <html>
      <head>
        <title>CivicSeva — Complaints Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2rem; color: #0e1117; }
          h1 { font-size: 1.3rem; margin-bottom: 0.25rem; }
          .meta { color: #6b7280; font-size: 0.85rem; margin-bottom: 1.5rem; }
          .stats { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; }
          .stat b { display: block; font-size: 1.4rem; }
          table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
          th, td { text-align: left; padding: 0.5rem 0.7rem; border-bottom: 1px solid #e6e9ee; }
          th { text-transform: uppercase; font-size: 0.7rem; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>CivicSeva — Complaints Report</h1>
        <div class="meta">Generated ${new Date().toLocaleString('en-IN')}</div>
        <div class="stats">
          <div class="stat"><b>${stats.total}</b>Total</div>
          <div class="stat"><b>${stats.critical}</b>Critical</div>
          <div class="stat"><b>${stats.inProgress}</b>In Progress</div>
          <div class="stat"><b>${stats.resolved}</b>Resolved</div>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Issue</th><th>Department</th><th>Location</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

export default function Dashboard() {
  const navigate = useNavigate()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [govUsername, setGovUsername] = useState('Admin')

  const [activeNav, setActiveNav] = useState('overview')
  const [filter, setFilter] = useState(null) // null | 'critical' | 'pending' | a DEPARTMENTS key
  const [showAll, setShowAll] = useState(false)

  // Load the real complaint list from the backend.
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/api/complaints`, {
  credentials: 'include',
})
        if (res.status === 401) {
          navigate('/gov-login')
          return
        }
        if (!res.ok) throw new Error('Failed to load complaints')
        const data = await res.json()
        if (!cancelled) setReports((data.complaints || []).map(mapComplaint))
      } catch (err) {
        if (!cancelled) setFetchError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [navigate])

  // Grab the logged-in gov username to show in the header instead of a
  // hardcoded placeholder.
  useEffect(() => {
   fetch(`${API_BASE_URL}/api/auth/gov-session`, {
  credentials: 'include',
})
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.username) setGovUsername(data.username) })
      .catch(() => {})
  }, [])

  const stats = useMemo(() => {
    const total = reports.length
    const critical = reports.filter((r) => r.severity === 'critical').length
    const inProgress = 0 // no "in progress" state in the backend schema yet
    const resolved = reports.filter((r) => r.status === 'Resolved').length
    const pending = reports.filter((r) => r.status === 'Pending').length
    return { total, critical, inProgress, resolved, pending }
  }, [reports])

  const deptBreakdown = useMemo(
    () =>
      DEPARTMENTS.map((d) => {
        const deptReports = reports.filter((r) => r.department === d.match)
        return {
          key: d.key,
          label: d.label,
          icon: d.icon,
          count: deptReports.length,
          critical: deptReports.filter((r) => r.severity === 'critical').length,
        }
      }),
    [reports]
  )

  const visibleReports = useMemo(() => {
    let list = [...reports]
    if (filter === 'critical') list = list.filter((r) => r.severity === 'critical')
    else if (filter === 'pending') list = list.filter((r) => r.status === 'Pending')
    else if (filter) list = list.filter((r) => r.deptKey === filter)
    return showAll ? list : list.slice(0, 6)
  }, [reports, filter, showAll])

  // Department cards/sidebar filter the same table in-place, rather than
  // navigating to a separate per-department page -- that page doesn't
  // exist yet, and this keeps every click actually functional today.
  const goToDept = (key) => {
    setFilter(filter === key ? null : key)
    setShowAll(true)
    setActiveNav('all')
  }

  const goToIssue = (id) => navigate(`/issue/${id}`)

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/gov-logout`, {
  method: 'POST',
  credentials: 'include',
})
    } catch (err) {
      console.error('Logout request failed:', err)
    }
    navigate('/gov-login')
  }

  const handleNavClick = (item) => {
    setActiveNav(item.key)
    if (item.key === 'all') {
      setFilter(null)
      setShowAll(true)
    } else if (item.key === 'overview') {
      setFilter(null)
      setShowAll(false)
    }
  }

  const vars = {
    '--bg': '#f3f5f7',
    '--card': '#ffffff',
    '--border': '#e6e9ee',
    '--fg': '#0e1117',
    '--muted': '#6b7280',
    '--primary': '#1a9e8f',
  }

  const tableTitle = filter === 'critical'
    ? 'Critical Complaints'
    : filter === 'pending'
      ? 'Pending Complaints'
      : filter
        ? `${DEPARTMENTS.find((d) => d.key === filter)?.label || ''} Complaints`
        : 'Recent Complaints'

  if (loading) {
    return (
      <div style={{ ...vars, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--muted)', fontFamily: "'Sora',sans-serif" }}>
        Loading dashboard...
      </div>
    )
  }

  if (fetchError) {
    return (
      <div style={{ ...vars, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg)', color: 'var(--muted)', fontFamily: "'Sora',sans-serif" }}>
        <div>⚠ {fetchError}</div>
        <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.2rem', border: '1.5px solid var(--border)', borderRadius: '9999px', background: 'var(--card)', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ ...vars, minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: "'Inter', sans-serif", color: 'var(--fg)' }}>
      {/* ---------------- Sidebar ---------------- */}
      <aside style={{ width: 260, flexShrink: 0, background: 'var(--card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '1.25rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '2rem', height: '2rem', background: 'var(--fg)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="12" cy="8" r="3" /><circle cx="6" cy="14" r="2.5" /><circle cx="18" cy="14" r="2.5" />
              <path d="M12 11v3M8.8 12.6L6 14M15.2 12.6L18 14" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.05rem' }}>CivicSeva</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.key
            return (
              <div
                key={item.key}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => hov(true)}
                onMouseLeave={() => hov(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.6rem 0.75rem', borderRadius: '0.65rem',
                  background: active ? 'rgba(26,158,143,.12)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--fg)',
                  fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1rem', width: 17, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </div>
            )
          })}
        </nav>

        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--muted)', margin: '1.5rem 0 0.6rem 0.75rem' }}>
          DEPARTMENTS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {deptBreakdown.map((d) => (
            <div
              key={d.key}
              onClick={() => goToDept(d.key)}
              onMouseEnter={() => hov(true)}
              onMouseLeave={() => hov(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0.75rem',
                borderRadius: '0.65rem', cursor: 'pointer',
                background: filter === d.key ? 'rgba(26,158,143,.08)' : 'transparent',
              }}
            >
              <span style={{ width: 30, height: 30, borderRadius: '0.55rem', background: DEPT_TAG_STYLE[d.key]?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                {d.icon}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{d.label}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)' }}>{d.count}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
          <button
            onClick={logout}
            onMouseEnter={() => hov(true)}
            onMouseLeave={() => hov(false)}
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.6rem 1rem', borderRadius: '0.65rem', fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Logout ↩
          </button>
        </div>
      </aside>

      {/* ---------------- Main column ---------------- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ background: 'var(--fg)', padding: '1rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            🏛️ CivicSeva <span style={{ color: '#8fc0f5', fontWeight: 700, fontSize: '0.72rem', marginLeft: '0.5rem', letterSpacing: '0.04em' }}>ADMIN OVERVIEW</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div style={{ position: 'relative' }} title={`${stats.pending} complaints awaiting action`}>
              {stats.pending > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -7, background: '#e04b4b', color: '#fff', fontSize: '0.62rem', fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stats.pending}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                {govUsername.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '0.85rem' }}>{govUsername}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '2rem 1.75rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left / center content */}
          <div style={{ flex: '1 1 640px', minWidth: 0 }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>
                Welcome back, {govUsername}! 👋
              </h1>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {stats.total} total complaints across {deptBreakdown.length} departments.
              </div>
            </div>

            {/* Top stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Complaints', value: stats.total, color: '#f0792a', bg: 'rgba(240,121,42,.12)', icon: '📋' },
                { label: 'Critical', value: stats.critical, color: '#e04b4b', bg: 'rgba(224,75,75,.12)', icon: '⚠️', onClick: () => setFilter(filter === 'critical' ? null : 'critical') },
                { label: 'In Progress', value: stats.inProgress, color: '#4a90d9', bg: 'rgba(74,144,217,.12)', icon: '🔄' },
                { label: 'Resolved', value: stats.resolved, color: '#1a9e8f', bg: 'rgba(26,158,143,.12)', icon: '✅' },
              ].map((s) => (
                <div
                  key={s.label}
                  onClick={s.onClick}
                  onMouseEnter={() => s.onClick && hov(true)}
                  onMouseLeave={() => s.onClick && hov(false)}
                  style={{ background: 'var(--card)', border: filter === 'critical' && s.label === 'Critical' ? '1.5px solid #e04b4b' : '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 24px rgba(14,17,23,0.05)', cursor: s.onClick ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: s.color }}>{s.label}</span>
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{s.icon}</span>
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '2rem', marginTop: '0.4rem' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Department cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              {deptBreakdown.map((d) => (
                <div
                  key={d.key}
                  onClick={() => goToDept(d.key)}
                  onMouseEnter={() => hov(true)}
                  onMouseLeave={() => hov(false)}
                  style={{ background: `linear-gradient(135deg, ${DEPT_TAG_STYLE[d.key]?.bg}, transparent)`, border: filter === d.key ? '1.5px solid var(--primary)' : '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                >
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: DEPT_TAG_STYLE[d.key]?.color, marginBottom: '0.6rem', maxWidth: '75%' }}>{d.label}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.9rem' }}>{d.count}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.9rem' }}>
                    Complaints {d.critical > 0 && <span style={{ color: '#e04b4b', fontWeight: 700 }}>· {d.critical} critical</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: DEPT_TAG_STYLE[d.key]?.color }}>
                    {filter === d.key ? 'Filtering ✓' : 'View Complaints →'}
                  </div>
                  <span style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '2.1rem', opacity: 0.9 }}>{d.icon}</span>
                </div>
              ))}
            </div>

            {/* Recent complaints */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(14,17,23,0.05)' }}>
              <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
                  {tableTitle}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {filter && (
                    <span onClick={() => setFilter(null)} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', cursor: 'pointer' }}>Clear filter ✕</span>
                  )}
                  <span onClick={() => setShowAll((v) => !v)} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>
                    {showAll ? 'Show Less' : 'View All →'}
                  </span>
                </div>
              </div>

              {visibleReports.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No complaints match this filter.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                    <thead>
                      <tr style={{ textAlign: 'left' }}>
                        {['ID', 'Issue', 'Department', 'Location', 'Status', 'Reported On'].map((h) => (
                          <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.03em', padding: '0.7rem 1.4rem', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleReports.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => goToIssue(r.id)}
                          onMouseEnter={() => hov(true)}
                          onMouseLeave={() => hov(false)}
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                        >
                          <td style={{ padding: '0.9rem 1.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>#{String(r.id).slice(-6)}</td>
                          <td style={{ padding: '0.9rem 1.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                              {r.photo ? (
                                <img src={r.photo} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '0.5rem', flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{r.icon}</div>
                              )}
                              <div>
                                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.84rem' }}>{r.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.9rem 1.4rem', whiteSpace: 'nowrap' }}>
                            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, ...DEPT_TAG_STYLE[r.deptKey] }}>{r.department}</span>
                          </td>
                          <td style={{ padding: '0.9rem 1.4rem', fontSize: '0.82rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.location}</td>
                          <td style={{ padding: '0.9rem 1.4rem', whiteSpace: 'nowrap' }}>
                            <StatusBadge status={r.status} />
                          </td>
                          <td style={{ padding: '0.9rem 1.4rem', fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(r.date)}<br />via {r.channel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 24px rgba(14,17,23,0.05)' }}>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.9rem', margin: '0 0 1rem' }}>Status Overview</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {[
                  { name: 'Pending', value: stats.pending, color: '#f0a92a' },
                  { name: 'In Progress', value: stats.inProgress, color: '#4a90d9' },
                  { name: 'Resolved', value: stats.resolved, color: '#1a9e8f' },
                ].map((s) => {
                  const pct = stats.total ? Math.round((s.value / stats.total) * 100) : 0
                  return (
                    <div key={s.name}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ color: 'var(--fg)', flex: 1 }}>{s.name}</span>
                        <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{s.value} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, borderRadius: '9999px', background: 'var(--bg)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 24px rgba(14,17,23,0.05)' }}>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.9rem', margin: '0 0 1rem' }}>Quick Actions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {[
                  { icon: '⚠️', label: 'Critical Only', onClick: () => setFilter(filter === 'critical' ? null : 'critical') },
                  { icon: '🟠', label: 'Pending Only', onClick: () => setFilter(filter === 'pending' ? null : 'pending') },
                  { icon: '📄', label: 'Generate Report', onClick: () => openPrintableReport(visibleReports, stats) },
                  { icon: '⬇️', label: 'Download Data', onClick: () => downloadCSV(reports) },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    onMouseEnter={() => hov(true)}
                    onMouseLeave={() => hov(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.7rem 0.75rem', borderRadius: '0.7rem',
                      border: '1px solid var(--border)', background: 'var(--card)',
                      cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                      fontSize: '0.78rem', fontWeight: 600, color: 'var(--fg)',
                    }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(26,158,143,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem' }}>
                      {a.icon}
                    </span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
