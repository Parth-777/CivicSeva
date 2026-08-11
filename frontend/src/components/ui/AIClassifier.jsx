import { useState } from 'react'
import { classify } from '../../data/classifierData'

const samples = [
  'Large pothole on MG Road causing tyre damage',
  'Garbage not collected for 3 days near my building',
  'Drainage blocked — street is waterlogged',
  'Water pipe burst near Dadar station',
  'Cracked railway track near signal post',
]

const PRIORITY_COLORS = {
  Critical: '#ff7e7e',
  High: '#ffb077',
  Medium: '#ffe08a',
  Low: 'rgba(255,255,255,.7)',
}

export default function AIClassifier() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = () => {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setResult(classify(input))
      setLoading(false)
    }, 1400)
  }

  return (
    <div
      id="classifier"
      style={{ background: 'linear-gradient(160deg,#0e1117 0%,#1a2332 100%)', padding: '6rem 0' }}
    >
      <section className="max-w-4xl mx-auto px-8">
        <div className="text-center mb-12 sr">
          <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            Live Demo
          </p>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '1rem' }}>
            AI Issue Classifier
          </h2>
          <p style={{ color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>
            Describe a civic issue in plain language and watch our AI classify and route it instantly.
          </p>
        </div>

        <div
          className="sr rounded-3xl p-8"
          style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(12px)' }}
        >
          {/* Input */}
          <div className="mb-6">
            <label style={{ display: 'block', color: 'rgba(255,255,255,.6)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.6rem', fontFamily: "'Sora',sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Describe the Issue
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Large pothole on MG Road causing tyre damage..."
              rows={3}
              style={{
                width: '100%', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: '0.875rem',
                padding: '0.9rem 1.1rem', fontFamily: "'DM Sans',sans-serif", fontSize: '1rem',
                color: '#fff', resize: 'vertical', background: 'rgba(255,255,255,.08)',
                outline: 'none', cursor: 'text',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,.15)')}
            />
          </div>

          {/* Sample chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {samples.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                style={{ cursor: 'none', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', fontFamily: "'Sora',sans-serif" }}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/20 hover:text-white"
                onMouseEnter={() => document.body.classList.add('cursor-hover')}
                onMouseLeave={() => document.body.classList.remove('cursor-hover')}
              >
                {s.length > 35 ? s.slice(0, 35) + '…' : s}
              </button>
            ))}
          </div>

          {/* Run button */}
          <button
            onClick={run}
            disabled={!input.trim() || loading}
            style={{ cursor: 'none', background: 'var(--primary)', fontFamily: "'Sora',sans-serif" }}
            className="w-full py-3.5 rounded-full text-white font-bold text-base transition-all duration-200 hover:opacity-90 disabled:opacity-40"
            onMouseEnter={() => document.body.classList.add('cursor-hover')}
            onMouseLeave={() => document.body.classList.remove('cursor-hover')}
          >
            {loading ? '🔄 Classifying…' : '🧠 Classify Issue'}
          </button>

          {/* Typing indicator */}
          {loading && (
            <div className="mt-6 flex items-center gap-2" style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.85rem' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                ))}
              </div>
              AI is analysing your complaint…
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div
              className="mt-6 rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', animation: 'fadeIn 0.5s ease-out forwards' }}
            >
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.9rem' }}>
                <span>🧠</span> AI Analysis Result
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Category', val: result.category, color: 'var(--primary)' },
                  { label: 'Department', val: result.dept },
                  { label: 'Priority', val: result.priority, color: PRIORITY_COLORS[result.priority] },
                  { label: 'ETA', val: result.eta },
                  { label: 'Confidence', val: result.conf + '%', color: 'var(--primary)' },
                  { label: 'Duplicate', val: result.dup === 'No' ? '✓ Unique' : '⚠ Possible Dup', color: result.dup === 'No' ? '#4ade80' : '#fbbf24' },
                ].map((row) => (
                  <div key={row.label}>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.4)', fontFamily: "'Sora',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                      {row.label}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: row.color || '#fff' }}>
                      {row.val}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(26,158,143,.12)', border: '1px solid rgba(26,158,143,.25)', borderRadius: '0.75rem', padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}>
                {result.note}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}