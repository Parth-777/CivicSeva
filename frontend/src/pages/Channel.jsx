import { useNavigate } from 'react-router-dom'
import InnerNav from '../components/ui/InnerNav'
import { useApp } from '../context/AppContext'

const WHATSAPP = '919999999999'

export default function Channel() {
  const navigate = useNavigate()
  const { selectedCategory, addReport } = useApp()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  if (!selectedCategory) {
    navigate('/categories')
    return null
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I want to report a civic issue.')}`, '_blank')
    addReport({ description: '(Reported via WhatsApp)', location: '', phone: '', channel: 'WhatsApp', photo: null })
    navigate('/success')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InnerNav backTo="/categories" />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div style={{ maxWidth: '28rem', width: '100%', animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div className="text-center mb-8">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{selectedCategory.icon}</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>{selectedCategory.title}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>How would you like to report this issue?</p>
            <div style={{ marginTop: '0.75rem', display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(26,158,143,.1)', color: 'var(--primary)', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>
              → {selectedCategory.department}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                icon: '💬',
                iconBg: 'rgba(26,158,143,.12)',
                title: 'Report via Website',
                desc: 'Fill out a detailed form with your complaint, location and photos.',
                onClick: () => navigate('/report'),
                recommended: true,
              },
              {
                icon: '📱',
                iconBg: 'rgba(37,179,72,.12)',
                title: 'Report via WhatsApp',
                desc: 'Send a message to our WhatsApp number for quick reporting.',
                onClick: handleWhatsApp,
                recommended: false,
              },
            ].map((ch) => (
              <button
                key={ch.title}
                onClick={ch.onClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.4rem 1.5rem',
                  border: '1.5px solid var(--border)', borderRadius: '1rem', background: 'var(--card)',
                  cursor: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                  boxShadow: '0 4px 24px rgba(14,17,23,0.08)', transition: 'all 0.25s', position: 'relative',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 12px 48px rgba(14,17,23,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; hov(true) }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(14,17,23,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; hov(false) }}
              >
                {ch.recommended && (
                  <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", padding: '0.18rem 0.55rem', borderRadius: '9999px' }}>
                    Recommended
                  </span>
                )}
                <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '0.75rem', background: ch.iconBg, fontSize: '1.4rem', flexShrink: 0 }} className="flex items-center justify-center">
                  {ch.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--fg)' }}>{ch.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.15rem' }}>{ch.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}