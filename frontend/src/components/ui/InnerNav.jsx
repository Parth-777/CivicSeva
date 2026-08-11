
import { useNavigate } from 'react-router-dom'

const LogoIcon = () => (
  <div
    style={{ width: '2rem', height: '2rem', background: 'var(--fg)', borderRadius: '0.5rem' }}
    className="flex items-center justify-center flex-shrink-0"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <circle cx="12" cy="8" r="3" />
      <circle cx="6" cy="14" r="2.5" />
      <circle cx="18" cy="14" r="2.5" />
      <path d="M12 11v3M8.8 12.6L6 14M15.2 12.6L18 14" />
    </svg>
  </div>
)

export default function InnerNav({ backTo, backLabel = '← Back' }) {
  const navigate = useNavigate()

  return (
    <div
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      className="flex items-center justify-between px-8 py-5"
    >
      <div className="flex items-center gap-2 font-sora font-bold text-xl" style={{ color: 'var(--fg)' }}>
        <LogoIcon />
        CitySync
      </div>
      <button
        onClick={() => navigate(backTo)}
        style={{
          cursor: 'none',
          border: '1.5px solid var(--border)',
          color: 'var(--muted)',
          fontFamily: "'Sora', sans-serif",
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white transition-all duration-200 hover:border-fg hover:text-fg"
        onMouseEnter={() => document.body.classList.add('cursor-hover')}
        onMouseLeave={() => document.body.classList.remove('cursor-hover')}
      >
        {backLabel}
      </button>
    </div>
  )
}