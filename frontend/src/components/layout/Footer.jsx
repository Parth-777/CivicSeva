
export default function Footer() {
  return (
    <footer
    id="contact"//added id
      style={{ background: 'var(--fg)', color: 'rgba(255,255,255,0.5)' }}
      className="py-10 px-6 text-center text-sm"
    >
      <p style={{ fontFamily: "'Sora', sans-serif", color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
        CitySync
      </p>
      <p>Civic Issue Reporting Platform · Making cities better, one report at a time.</p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', opacity: 0.5 }}>
        © 2026 CitySync. All rights reserved.
      </p>
    </footer>
  )
}