import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useApp } from '../../context/AppContext'

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

/**
 * ==============   Rolling text hover effect   ================
 * Wraps a label in a clipped window with a duplicate copy stacked
 * above/below it, so on hover the old label rolls out while the new
 * one rolls in. Renders as a <a> when `href` is given, else a <button>.
 */

const outgoingVariants = {
  rest: { transform: 'translateY(0%)' },
  active: { transform: 'translateY(100%)' },
}

const incomingVariants = {
  rest: { transform: 'translateY(-100%)' },
  active: { transform: 'translateY(0%)' },
}

const rollTransition = {
  duration: 0.3,
  ease: [0.338, 0.015, 0.395, 0.959],
}

function RollingLink({ href, onClick, children, style, className, onHoverChange }) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(false)

  const setHover = (on) => {
    onHoverChange?.(on)
    if (!reduceMotion) setActive(on)
  }

  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      href={href}
      onClick={onClick}
      style={{ cursor: 'none', ...style }}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <span className="label-window">
        <motion.span
          className="label-copy"
          variants={outgoingVariants}
          initial="rest"
          animate={active ? 'active' : 'rest'}
          transition={rollTransition}
        >
          {children}
        </motion.span>
        <motion.span
          className="label-copy label-copy--incoming"
          variants={incomingVariants}
          initial="rest"
          animate={active ? 'active' : 'rest'}
          transition={rollTransition}
        >
          {children}
        </motion.span>
      </span>
    </Tag>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const { session } = useApp()
  const [loginMenuOpen, setLoginMenuOpen] = useState(false)
  const [loginTextActive, setLoginTextActive] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [navHeight, setNavHeight] = useState(0)
  const lastScrollY = useRef(0)
  const navRef = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (navRef.current) setNavHeight(navRef.current.offsetHeight)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      const previous = lastScrollY.current
      if (current > previous && current > 150) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleHover = (on) => {
    document.body.classList.toggle('cursor-hover', on)
  }

  const handleLoginHover = (on) => {
    handleHover(on)
    if (!reduceMotion) setLoginTextActive(on)
  }

  // Already logged in? Skip straight to picking a category.
  // Not logged in? Go to citizen login (reporting is citizen-only).
  const handleReportIssue = () => navigate(session ? '/categories' : '/citizen-login')

  return (
    <>
    <div style={{ height: navHeight }} />
    <nav
      ref={navRef}
      style={{
        background: 'rgba(240,241,243,0.9)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(221,225,231,0.6)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease-in-out',
      }}
      className="flex items-center justify-between px-10 py-5 z-50"
    >
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 font-sora font-bold text-xl text-fg"
        style={{ cursor: 'none', background: 'none', border: 'none' }}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <LogoIcon />
        CivicSeva
      </button>

      <ul className="hidden md:flex items-center gap-8 list-none">
        {[
          { label: 'How it Works', href: '#how' },
          { label: 'Categories', href: '#categories-section' },
          { label: 'Contact', href: '#contact' },
          { label: 'Report Issue', action: handleReportIssue },
        ].map((link) => (
          <li key={link.label}>
            <RollingLink
              href={link.href}
              onClick={link.action}
              onHoverChange={handleHover}
              style={{ color: 'var(--muted)' }}
              className="text-sm font-medium hover:text-fg transition-colors duration-200 no-underline bg-transparent border-none"
            >
              {link.label}
            </RollingLink>
          </li>
        ))}
      </ul>

     
  <div
    style={{ position: 'relative' }}
    onMouseEnter={() => setLoginMenuOpen(true)}
    onMouseLeave={() => setLoginMenuOpen(false)}
  >
    <button
      onClick={() => setLoginMenuOpen((v) => !v)}
      style={{
        cursor: 'none',
        border: '1.5px solid var(--fg)',
        fontFamily: "'Sora', sans-serif",
      }}
      className="px-5 py-2 rounded-full font-semibold text-sm bg-transparent text-[var(--fg)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-white flex items-center gap-1.5"
      onMouseEnter={() => handleLoginHover(true)}
      onMouseLeave={() => handleLoginHover(false)}
      aria-haspopup="true"
      aria-expanded={loginMenuOpen}
    >
      <span className="label-window">
        <motion.span
          className="label-copy"
          variants={outgoingVariants}
          initial="rest"
          animate={loginTextActive ? 'active' : 'rest'}
          transition={rollTransition}
        >
          LogIn
        </motion.span>
        <motion.span
          className="label-copy label-copy--incoming"
          variants={incomingVariants}
          initial="rest"
          animate={loginTextActive ? 'active' : 'rest'}
          transition={rollTransition}
        >
          LogIn
        </motion.span>
      </span>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        style={{ transform: loginMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    {loginMenuOpen && (
      <div
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          paddingTop: '0.5rem',
        }}
      >
        <div
          style={{
            minWidth: '13rem',
            background: 'var(--card)',
            border: '1.5px solid var(--border)',
            borderRadius: '0.9rem',
            boxShadow: '0 12px 40px rgba(14,17,23,0.15)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out forwards',
          }}
        >
          <button
            onClick={() => { setLoginMenuOpen(false); navigate('/citizen-login') }}
            style={{ cursor: 'none', background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}
            className="hover:bg-bg transition-colors"
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
          >
            <span style={{ fontSize: '1.2rem' }}>👤</span>
            <span>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--fg)' }}>Citizen Login</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Report a civic issue</div>
            </span>
          </button>
          <div style={{ borderTop: '1px solid var(--border)' }} />
          <button
            onClick={() => { setLoginMenuOpen(false); navigate('/gov-login') }}
            style={{ cursor: 'none', background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}
            className="hover:bg-bg transition-colors"
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
          >
            <span style={{ fontSize: '1.2rem' }}>🏛️</span>
            <span>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--fg)' }}>Government Official</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Manage & resolve reports</div>
            </span>
          </button>
        </div>
      </div>
    )}
  </div>

    </nav>
    <NavRollStyles />
    </>
  )
}

function NavRollStyles() {
  return (
    <style>{`
      .label-window {
        position: relative;
        display: block;
        width: max-content;
        overflow: hidden;
      }

      .label-copy {
        display: block;
        white-space: nowrap;
      }

      .label-copy--incoming {
        position: absolute;
        inset: 0;
      }
    `}</style>
  )
}
