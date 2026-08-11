import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const ringRef = useRef(null)
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 })
  const visible = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const ring = ringRef.current
    if (!cursor || !ring) return

    const onMove = (e) => {
      pos.current.mx = e.clientX
      pos.current.my = e.clientY
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
      if (!visible.current) {
        visible.current = true
        cursor.style.opacity = '1'
        ring.style.opacity = '0.5'
      }
    }

    const animRing = () => {
      pos.current.rx += (pos.current.mx - pos.current.rx) * 0.1
      pos.current.ry += (pos.current.my - pos.current.ry) * 0.1
      ring.style.left = pos.current.rx + 'px'
      ring.style.top = pos.current.ry + 'px'
      rafRef.current = requestAnimationFrame(animRing)
    }

    document.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animRing)

    return () => {
      document.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      <div
        id="cursor"
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: 12,
          height: 12,
          background: 'var(--primary)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%,-50%)',
          transition: 'width 0.15s, height 0.15s',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
          opacity: 0,
        }}
      />
      <div
        id="cursor-ring"
        ref={ringRef}
        style={{
          position: 'fixed',
          width: 38,
          height: 38,
          border: '2px solid var(--primary)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%,-50%)',
          transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s',
          opacity: 0,
        }}
      />
    </>
  )
}