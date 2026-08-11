import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import InnerNav from '../components/ui/InnerNav'

export default function Success() {
  const navigate = useNavigate()
  const { selectedCategory } = useApp()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InnerNav backTo="/" backLabel="← Home" />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center" style={{ maxWidth: '26rem', animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(26,158,143,.12)', border: '2px solid rgba(26,158,143,.3)', margin: '0 auto 1.5rem' }}
            className="flex items-center justify-center"
          >
            <svg width="36" height="36" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Report Submitted!
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            Your issue has been routed to the{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
              {selectedCategory?.department || 'appropriate department'}
            </span>
            . We'll keep you updated.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            You'll receive updates on the status of your complaint.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/track')}
              style={{ width: '100%', padding: '1rem', background: 'var(--fg)', color: '#fff', border: 'none', borderRadius: '0.875rem', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', cursor: 'none', transition: 'all 0.25s' }}
              onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
            >
              Track Complaint
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '1rem', background: 'transparent', color: 'var(--muted)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: '1rem', cursor: 'none', transition: 'all 0.25s' }}
              onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}