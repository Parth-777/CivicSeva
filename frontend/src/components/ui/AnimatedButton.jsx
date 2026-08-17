import React from 'react'

export default function AnimatedButton({
  children,
  onClick,
  hov,
  showArrow = false,
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => hov?.(true)}
      onMouseLeave={() => hov?.(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.5rem',
        border: 'none',
        borderRadius: '999px',
        background: '#ffffff',
        color: '#0e1117',
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.9rem',
        fontWeight: 800,
        cursor: 'none',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      }}
      className="animated-button"
    >
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
        }}
      >
        {children}

        {showArrow && (
          <span
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#0e1117',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.25s ease',
            }}
            className="animated-button-arrow"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        )}
      </span>
    </button>
  )
}