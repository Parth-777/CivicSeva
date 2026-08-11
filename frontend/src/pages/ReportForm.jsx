import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import InnerNav from '../components/ui/InnerNav'
import { useApp } from '../context/AppContext'

export default function ReportForm() {
  const navigate = useNavigate()
  const { selectedCategory, addReport } = useApp()
  const [desc, setDesc] = useState('')
  const [loc, setLoc] = useState('')
  const [phone, setPhone] = useState('')
  const [locStatus, setLocStatus] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [phoneError, setPhoneError] = useState(false)
  const fileRef = useRef()

  if (!selectedCategory) {
    navigate('/categories')
    return null
  }

  const phoneValid = /^\d{10}$/.test(phone)
  const canSubmit = loc.trim() && desc.trim() && phoneValid

  const handlePhoneChange = (val) => {
    setPhone(val)
    if (val.length > 0) setPhoneError(!/^\d{10}$/.test(val))
    else setPhoneError(false)
  }

  const detectGPS = () => {
    setLocStatus('📡 Detecting your location…')
    if (!navigator.geolocation) {
      setLocStatus('❌ Geolocation not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLoc(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        setLocStatus('✅ Location detected!')
      },
      (err) => {
        if (err.code === 1) setLocStatus('⚠️ Location permission denied. Please type manually.')
        else {
          fetch('https://ipapi.co/json/')
            .then((r) => r.json())
            .then((d) => {
              if (d.latitude) {
                setLoc(`${d.latitude.toFixed(5)}, ${d.longitude.toFixed(5)}`)
                setLocStatus('✅ Approximate location detected (IP-based)!')
              } else setLocStatus('⚠️ Could not detect location. Please type manually.')
            })
            .catch(() => setLocStatus('⚠️ Could not detect location. Please type manually.'))
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhoto(reader.result)
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    addReport({ description: desc, location: loc, phone, channel: 'Website', photo })
    navigate('/success')
  }

  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const inputStyle = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: '0.875rem',
    padding: '0.9rem 1.1rem', fontFamily: "'DM Sans',sans-serif", fontSize: '1rem',
    color: 'var(--fg)', background: 'var(--card)', outline: 'none', transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <InnerNav backTo="/channel" />
      <div style={{ flex: 1, padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.5s ease-out forwards' }}>
            <div className="flex items-center gap-3 mb-1">
              <span style={{ fontSize: '1.5rem' }}>{selectedCategory.icon}</span>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.75rem', fontWeight: 800 }}>
                {selectedCategory.title}
              </h2>
            </div>
            <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>→ {selectedCategory.department}</p>
          </div>

          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 24px rgba(14,17,23,0.08)', animation: 'fadeIn 0.5s ease-out 0.1s both' }}>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--fg)', fontFamily: "'Sora',sans-serif" }}>
                Describe the Issue *
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the issue clearly — location details, severity, how long it's been there…"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', cursor: 'text' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--fg)', fontFamily: "'Sora',sans-serif" }}>
                Location *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="e.g. MG Road, Near Central Bus Stand, Mumbai"
                  style={{ ...inputStyle, flex: 1, cursor: 'text' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  onClick={detectGPS}
                  style={{ cursor: 'none', background: 'var(--fg)', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0 1rem', fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}
                  onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
                >
                  📍 GPS
                </button>
              </div>
              {locStatus && <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem' }}>{locStatus}</p>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--fg)', fontFamily: "'Sora',sans-serif" }}>
                Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 600 }}>+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  style={{ ...inputStyle, paddingLeft: '3rem', cursor: 'text', borderColor: phoneError ? 'var(--red)' : 'var(--border)' }}
                  onFocus={(e) => !phoneError && (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = phoneError ? 'var(--red)' : 'var(--border)')}
                />
              </div>
              {phoneError && <p style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: '0.4rem' }}>⚠ Enter a valid 10-digit mobile number.</p>}
            </div>

            {/* Photo */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--fg)', fontFamily: "'Sora',sans-serif" }}>
                Photo Evidence (optional)
              </label>
              {!photoPreview ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border: '2px dashed var(--border)', borderRadius: '0.875rem', padding: '2rem', textAlign: 'center', cursor: 'none', transition: 'border-color 0.2s, background 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(26,158,143,.04)'; hov(true) }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; hov(false) }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>Click to upload photo</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>JPG, PNG up to 10MB</p>
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '0.875rem', overflow: 'hidden' }}>
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={clearPhoto}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', borderRadius: '9999px', width: 28, height: 28, cursor: 'none', fontSize: '0.8rem' }}
                    onMouseEnter={() => hov(true)} onMouseLeave={() => hov(false)}
                  >✕</button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '1rem', background: canSubmit ? 'var(--fg)' : '#ccc',
                color: '#fff', border: 'none', borderRadius: '0.875rem',
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem',
                cursor: canSubmit ? 'none' : 'not-allowed', transition: 'all 0.25s',
              }}
              onMouseEnter={() => canSubmit && hov(true)} onMouseLeave={() => hov(false)}
            >
              Submit Report →
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
              Your report will be routed to {selectedCategory.department}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}