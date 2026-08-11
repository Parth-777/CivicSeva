import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useScrollReveal } from '../hooks/useScrollReveal'
import stacksImg from '../assets/stacks.png'
import AnimatedLoop from '../components/ui/AnimatedLoop'
import ChaosMap from "../components/ui/ChaosMap";

const WHATSAPP = '919999999999'

const photos = [
  { src: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=480&h=360&fit=crop', label: '🛣️ Road Pothole' },
  { src: 'https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=480&h=360&fit=crop', label: '🌧️ Waterlogging' },
  { src: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=480&h=360&fit=crop', label: '🗑️ Garbage Overflow' },
  { src: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=480&h=360&fit=crop', label: '🚆 Rail Damage' },
  { src: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=480&h=360&fit=crop', label: '💧 Pipe Burst' },
  { src: 'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=480&h=360&fit=crop', label: '🚨 Highway Accident' },
]

const catItems = [
  { emoji: '🛣️', name: 'Road Issues', desc: 'Potholes, damaged roads, broken dividers and surface hazards impacting traffic.', dept: 'Municipal Road Department' },
  { emoji: '🚆', name: 'Rail Track Issues', desc: 'Track damage, alignment issues and safety concerns near rail corridors.', dept: 'Railway Authority' },
  { emoji: '🗑️', name: 'Garbage / Sanitation', desc: 'Overflowing bins, uncollected waste, illegal dumping and sanitation emergencies.', dept: 'Sanitation Department' },
  { emoji: '🌧️', name: 'Drainage Problems', desc: 'Blocked drains, waterlogging, flooded streets and storm drain failures.', dept: 'Drainage Department' },
  { emoji: '💧', name: 'Water Overflow / Leakage', desc: 'Pipe bursts, water main leaks, overflowing tanks and municipal water wastage.', dept: 'Water Supply Department' },
  { emoji: '🚨', name: 'Highway Accidents', desc: 'Emergency road incidents, accident scenes and immediate safety risks on highways.', dept: 'Traffic Police / Emergency' },
]

const howSteps = [
  { num: '01', icon: '📍', title: 'Spot the Issue', desc: 'See a pothole, overflowing bin, or broken drain? Open CitySync from anywhere.' },
  { num: '02', icon: '📋', title: 'Select Category', desc: 'Choose the issue type — we auto-route it to the correct government department.' },
  { num: '03', icon: '📸', title: 'Upload Evidence', desc: 'Attach photos. Visual proof speeds up response and confirms the issue location.' },
  { num: '04', icon: '✅', title: 'Track & Resolve', desc: 'Get a unique ticket ID. Track your complaint and receive updates on resolution.' },
]

const features = [
  { icon: '🤖', title: 'AI-Powered Classification', desc: 'Natural language processing instantly categorises your report and routes it to the right department.', badge: 'NLP Engine' },
  { icon: '🗺️', title: 'Location Intelligence', desc: 'GPS tagging and map pinning ensures field teams find the exact issue location fast.', badge: 'Maps API' },
  { icon: '🔔', title: 'Real-Time Tracking', desc: 'Live status updates via SMS and WhatsApp keep citizens informed throughout resolution.', badge: 'Live Updates' },
  { icon: '📊', title: 'Department Routing', desc: 'Smart routing eliminates middlemen and sends each complaint directly to the right authority.', badge: 'Instant' },
  { icon: '📸', title: 'Photo Evidence', desc: 'Attach photographic proof to your report. Visual evidence dramatically speeds up resolution.', badge: 'Media Upload' },
  { icon: '🔁', title: 'Duplicate Detection', desc: 'AI detects and merges duplicate reports, preventing resource waste on the same issue.', badge: 'AI Merge' },
]

export default function Home() {
  const navigate = useNavigate()
  useScrollReveal()

  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  return (
    <div style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* ── HERO ── */}
      <div style={{ background: 'var(--bg)' }} className="min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div style={{ animation: 'fadeUp 0.7s ease forwards' }}>
            <div className="flex items-center gap-2 mb-6">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
              <span style={{ color: 'var(--muted)', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Civic Tech Platform
              </span>
            </div>
            <h1
              style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, lineHeight: 1.08, color: 'var(--fg)', letterSpacing: '-0.02em' }}
              className="text-5xl lg:text-6xl mb-6"
            >
              Fix Persistent<br />Issues in<br />Your City.
            </h1>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: '30rem' }} className="text-base mb-10">
              Report civic problems — potholes, garbage, drainage — and our AI instantly routes them to the right government department.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => navigate('/login')}
                style={{ fontFamily: "'Sora',sans-serif", background: 'var(--fg)', cursor: 'none', boxShadow: '0 4px 20px rgba(14,17,23,.25)' }}
                className="flex items-center gap-3 px-8 py-4 text-white font-bold text-base rounded-full transition-all duration-200 hover:-translate-y-0.5"
                onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
              >
                Report an Issue
                <span style={{ width: 28, height: 28, background: '#fff', borderRadius: '50%' }} className="flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" fill="none" stroke="var(--fg)" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => navigate('/track')}
                style={{ cursor: 'none', color: 'var(--muted)', fontFamily: "'Sora',sans-serif" }}
                className="text-sm font-semibold bg-transparent border-none hover:text-fg transition-colors"
                onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
              >
                Track Complaint →
              </button>

            </div>
            {/* Stacks Image */}
            <div style={{ marginTop: '2.5rem' }} className="sr">

              <div style={{
  position: 'relative',
  display: 'inline-block'
}}>

  {/* Shadow */}
  <div style={{
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '70%',
    height: '40px',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18), transparent 70%)',
    filter: 'blur(14px)',
    opacity: 0.8,
    zIndex: 0
  }} />

  {/* Image */}
  <img
    src={stacksImg}
    alt="City Issues"
    style={{
      width: '460px',
      maxWidth: '100%',
      transform: 'rotate(-3deg)',
      marginLeft: '-10px',
      position: 'relative',
      zIndex: 1
    }}
  />

</div>

            </div>
          </div>

          {/* Right - Cycle diagram */}
          {/* Right - Loop Image */}
          <div className="flex flex-col items-center justify-center sr-r">

            <div style={{ transform: 'translateX(40px)' }}>
              <AnimatedLoop />
            </div>

            <p
              style={{
                textAlign: 'center',
                marginTop: '1.2rem',
                color: 'var(--muted)',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}
            >
              Reports get delayed.<br />
              Issues remain unresolved.
            </p>

          </div>
        </div>

        {/* Trust bar */}
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 2.5rem' }}>
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-12 flex-wrap">
            {['No Login Required', 'WhatsApp Support', 'Available 24/7', 'AI-Powered Routing', 'Govt. Verified'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, display: 'inline-block' }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ background: 'var(--primary)', padding: '3.5rem 2.5rem' }}>
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '12,400+', lbl: 'Complaints Filed' },
              { val: '94%', lbl: 'Resolution Rate' },
              { val: '48 hrs', lbl: 'Avg Response Time' },
              { val: '6', lbl: 'Departments' },
            ].map((s) => (
              <div key={s.lbl} className="sr">
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
           </div>

      {/* ── LIVE CITY CHAOS ── */}
      <section
        style={{
          background: 'var(--bg)',
          padding: '5rem 2rem',
        }}
      >
        <div className="max-w-6xl mx-auto">

          <div className="sr" style={{ marginBottom: '2rem' }}>
            <p
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.75rem',
              }}
            >
              Live Infrastructure
            </p>

            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: 'clamp(2rem,4vw,3rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}
            >
              What's happening in your city?
            </h2>

            <p
              style={{
                color: 'var(--muted)',
                lineHeight: 1.7,
                maxWidth: '520px',
              }}
            >
              Real-time civic issues visualized across the city.
              Monitor potholes, construction, railway damage and
              other infrastructure problems in one place.
            </p>
          </div>

          <ChaosMap />

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ background: 'var(--bg)' }}>
        <section className="max-w-6xl mx-auto px-8 py-24">
          <div className="sr">
            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Process</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              How CitySync works
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: '480px', fontSize: '1rem' }}>
              Four simple steps from spotting an issue to getting it resolved by the right authority.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {howSteps.map((step, i) => (
              <div
                key={step.num}
                className="sr bg-white rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
                style={{ border: '1px solid var(--border)', transitionDelay: `${i * 50}ms` }}
              >
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f0f0ec', lineHeight: 1, marginBottom: '0.75rem', fontFamily: "'Sora',sans-serif" }}>{step.num}</div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f5f5f0', fontSize: '1.4rem', marginBottom: '1.25rem' }} className="flex items-center justify-center">{step.icon}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── CATEGORIES (dark) ── */}
      <div id="categories-section" style={{ background: 'radial-gradient(circle at top,#111 0%,#000 100%)' }}>
        <section className="max-w-6xl mx-auto px-8 py-24">
          <div className="sr">
            <p style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Routing Categories</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', marginBottom: '1rem' }}>
              What can you report?
            </h2>
            <p style={{ color: '#888', lineHeight: 1.7, maxWidth: '480px' }}>
              Every complaint is instantly routed to the right department — no middlemen, no delays.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {catItems.map((cat, i) => (
              <div
                key={cat.name}
                className="sr rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', cursor: 'none', transitionDelay: `${i * 50}ms` }}
                onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
              >
                <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>{cat.emoji}</span>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>{cat.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6, marginBottom: '0.75rem' }}>{cat.desc}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.8rem', borderRadius: '9999px', background: 'rgba(26,158,143,.15)', color: '#4ecdc4' }}>
                  {cat.dept}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── PHOTO GALLERY ── */}
      <div style={{ background: 'var(--bg)', padding: '5rem 0' }}>
        <section className="max-w-6xl mx-auto px-8 pb-8">
          <div className="sr">
            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Real Issues. Real City.</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, lineHeight: 1.1 }}>
              Problems we solve every day
            </h2>
          </div>
        </section>
        <div className="photo-scroll-track">
          <div className="photo-scroll-inner">
            {[...photos, ...photos].map((p, i) => (
              <div key={i} style={{ width: 240, height: 180, borderRadius: '1rem', overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#ddd' }}>
                <img src={p.src} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} loading="lazy" />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 500 }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS DARK ── */}
      <div style={{ background: 'var(--fg)', padding: '5rem 0', color: '#fff' }}>
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            By The Numbers
          </div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '3rem' }}>
            Built for your city,<br />designed for impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: '6', lbl: 'Issue Categories' },
              { val: '24/7', lbl: 'Reporting Available' },
              { val: 'Instant', lbl: 'Department Routing' },
              { val: '3', lbl: 'Gov. Departments' },
            ].map((s) => (
              <div key={s.lbl} className="sr text-center p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '2.75rem', fontWeight: 800, color: 'var(--primary)' }}>{s.val}</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,.55)', marginTop: '0.375rem' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI FEATURES ── */}
      <div style={{ background: 'var(--bg)', padding: '5rem 0' }}>
        <section className="max-w-6xl mx-auto px-8">
          <div className="sr">
            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>AI Features</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>Intelligent by design</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: '36rem' }}>Every complaint is enhanced by AI to be faster, smarter, and more effective.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="sr bg-white rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                style={{ border: '1.5px solid var(--border)', boxShadow: '0 4px 24px rgba(14,17,23,0.08)', transitionDelay: `${i * 50}ms` }}
              >
                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(26,158,143,.1)', fontSize: '1.4rem', marginBottom: '1.1rem' }} className="flex items-center justify-center">{f.icon}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.85rem', padding: '0.25rem 0.7rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", background: 'rgba(26,158,143,.1)', color: 'var(--primary)' }}>
                  {f.badge}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>



      {/* ── CTA BANNER ── */}
      <div style={{ background: 'var(--primary)', padding: '4.5rem 0' }}>
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 800, marginBottom: '1rem', fontFamily: "'Sora',sans-serif" }}>
            Ready to make your city better?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Join thousands of citizens who've already made a difference.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/login')}
              style={{ background: '#fff', color: 'var(--primary)', cursor: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}
              className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base border-none transition-all duration-200 hover:-translate-y-0.5"
              onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
            >
              Report an Issue
            </button>
            <button
              onClick={() => navigate('/gov-login')}
              style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,.8)', fontWeight: 500, cursor: 'none', background: 'none', border: 'none' }}
              onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
            >
              Government Portal →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}