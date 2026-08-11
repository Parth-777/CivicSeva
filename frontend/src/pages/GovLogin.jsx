import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InnerNav from '../components/ui/InnerNav'
import { DEPT_CONFIG } from '../data/reportStore'
import { useApp } from '../context/AppContext'

export default function GovLogin() {
  const navigate = useNavigate()
  const { setActiveDept } = useApp()
  const [deptId, setDeptId] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState(false)
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const login = () => {
    const id = deptId.trim().toUpperCase()
    const pw = password.trim().toUpperCase()
    const cfg = DEPT_CONFIG[id]
    if (cfg && pw === cfg.password) {
      setError(false)
      setActiveDept(id)
      navigate(`/dashboard/${id.toLowerCase()}`)
    } else {
      setError(true)
      setPassword('')
    }
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: '0.875rem',
    padding: '0.9rem 1.1rem', fontFamily: "'DM Sans',sans-serif", fontSize: '1rem',
    color: 'var(--fg)', background: 'var(--card)', outline: 'none', transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InnerNav backTo="/login" />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div style={{ maxWidth: '28rem', width: '100%', animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div className="text-center mb-7">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏛️</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>Official Portal</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Log in with your department credentials</p>
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: 'var(--bg2)', borderRadius: '0.75rem', fontSize: '0.78rem', color: 'var(--muted)', display: 'inline-block' }}>
              Hint: ID = <strong>MUNICIPAL</strong>, <strong>ROADWAYS</strong>, or <strong>RAILWAY</strong> · Password = <strong>GOVERNMENT</strong>
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 24px rgba(14,17,23,0.08)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--fg)', fontFamily: "'Sora',sans-serif" }}>Department ID</label>
              <input
                type="text"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="e.g. MUNICIPAL"
                style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'text' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--fg)', fontFamily: "'Sora',sans-serif" }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && login()}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '3rem', cursor: 'text', borderColor: error ? 'var(--red)' : 'var(--border)' }}
                  onFocus={(e) => !error && (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)')}
                />
                <button
                  onClick={() => setShowPwd((v) => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'none', color: 'var(--muted)', fontSize: '1.1rem' }}
                  onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {error && (
                <p style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: '0.4rem' }}>
                  ⚠ Incorrect ID or Password. Please try again.
                </p>
              )}
            </div>

            <button
              onClick={login}
              style={{ width: '100%', padding: '1rem', background: 'var(--fg)', color: '#fff', border: 'none', borderRadius: '0.875rem', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', cursor: 'none', marginTop: '0.5rem', transition: 'all 0.25s' }}
              onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
            >
              Access Dashboard
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '1rem' }}>
              Authorised personnel only · CitySync Gov v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}