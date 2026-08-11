import { useNavigate } from 'react-router-dom'
import InnerNav from '../components/ui/InnerNav'

export default function Login() {
  const navigate = useNavigate()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InnerNav backTo="/" />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div style={{ maxWidth: '28rem', width: '100%', animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div className="text-center mb-8">
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.875rem', fontWeight: 800 }}>Choose Your Role</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>How would you like to continue?</p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { icon: '👤', title: 'Citizen', desc: 'Report a civic issue in your area', to: '/categories', bg: 'rgba(26,158,143,.12)' },
              { icon: '🏛️', title: 'Government Official', desc: 'Login to manage & resolve submitted issues', to: '/gov-login', bg: '#f0f1f3' },
            ].map((role) => (
              <button
                key={role.title}
                onClick={() => navigate(role.to)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.4rem 1.5rem',
                  border: '1.5px solid var(--border)', borderRadius: '1rem', background: 'var(--card)',
                  cursor: 'none', width: '100%', textAlign: 'left',
                  boxShadow: '0 4px 24px rgba(14,17,23,0.08)', transition: 'all 0.25s',
                  fontFamily: 'inherit',
                }}
                className="hover:border-primary hover:-translate-y-0.5"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 12px 48px rgba(14,17,23,0.14)'; hov(true) }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(14,17,23,0.08)'; hov(false) }}
              >
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem', background: role.bg, fontSize: '1.5rem', flexShrink: 0 }} className="flex items-center justify-center">
                  {role.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--fg)' }}>{role.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{role.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}