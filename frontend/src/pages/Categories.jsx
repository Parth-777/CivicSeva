import { useNavigate } from 'react-router-dom'
import InnerNav from '../components/ui/InnerNav'
import { categories } from '../data/categories'
import { useApp } from '../context/AppContext'

export default function Categories() {
  const navigate = useNavigate()
  const { setSelectedCategory } = useApp()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const handleSelect = (cat) => {
    setSelectedCategory(cat)
    navigate('/channel')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InnerNav backTo="/login" />
      <div style={{ padding: '2.5rem 1.5rem', flex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.5s ease-out forwards' }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.4rem' }}>What's the issue?</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Select the category that best describes your problem.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat)}
                style={{
                  background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'none',
                  animation: `fadeIn 0.5s ease-out ${i * 80}ms both`,
                }}
                onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
              >
                <div
                  style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(14,17,23,0.08)', transition: 'all 0.3s' }}
                  className="hover:-translate-y-1 hover:shadow-card-lg"
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ height: 140, overflow: 'hidden' }}>
                    <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} loading="lazy"
                      onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                    />
                  </div>
                  <div style={{ padding: '1.25rem 1.4rem' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--fg)' }}>{cat.title}</span>
                    </div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{cat.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>→ {cat.department}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}