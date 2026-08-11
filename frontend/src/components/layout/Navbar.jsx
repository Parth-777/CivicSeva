import { useNavigate } from 'react-router-dom'

const LogoIcon = () => (
  <div
    style={{ width: '2.2rem', height: '2.2rem', background: 'var(--fg)', borderRadius: '0.6rem' }}
    className="flex items-center justify-center flex-shrink-0"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <circle cx="12" cy="8" r="3" />
      <circle cx="6" cy="14" r="2.5" />
      <circle cx="18" cy="14" r="2.5" />
      <path d="M12 11v3M8.8 12.6L6 14M15.2 12.6L18 14" />
    </svg>
  </div>
)

export default function Navbar() {
  const navigate = useNavigate()

  const handleHover = (on) => {
    document.body.classList.toggle('cursor-hover', on)
  }

  return (
    <nav
      style={{
        background: 'rgba(240,241,243,0.9)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(221,225,231,0.6)',
      }}
      className="flex items-center justify-between px-10 py-5 sticky top-0 z-50"
    >
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 font-sora font-bold text-xl text-fg"
        style={{ cursor: 'none', background: 'none', border: 'none' }}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <LogoIcon />
        CitySync
      </button>

      <ul className="hidden md:flex items-center gap-8 list-none">
  {[
    { label: 'How it Works', href: '#how' },
    { label: 'Categories', href: '#categories-section' },
    { label: 'Contact', href: '#contact' },
    { label: 'Report Issue', action: () => navigate('/login') },
  ].map((link) => (
    <li key={link.label}>
      {link.href ? (
        <a
          href={link.href}
          style={{ cursor: 'none', color: 'var(--muted)' }}
          className="text-sm font-medium hover:text-fg transition-colors duration-200 no-underline"
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        >
          {link.label}
        </a>
      ) : (
        <button
          onClick={link.action}
          style={{ cursor: 'none', color: 'var(--muted)', background: 'none', border: 'none' }}
          className="text-sm font-medium hover:text-fg transition-colors duration-200"
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        >
          {link.label}
        </button>
      )}
    </li>
  ))}
</ul>

     <button
  onClick={() => navigate('/login')}
  style={{
    cursor: 'none',
    border: '1.5px solid var(--fg)',
    fontFamily: "'Sora', sans-serif",
  }}
  className="px-5 py-2 rounded-full font-semibold text-sm bg-transparent text-[var(--fg)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-white"
  onMouseEnter={() => handleHover(true)}
  onMouseLeave={() => handleHover(false)}
>
  LogIn
</button>
    </nav>
  )
}
