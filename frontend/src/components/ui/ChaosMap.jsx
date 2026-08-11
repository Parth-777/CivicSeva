import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'

/* ─────────────────────────────────────────────
   LOCATION HELPERS
───────────────────────────────────────────── */

async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    )

    const data = await res.json()

    if (data.length > 0) {
      return [
        parseFloat(data[0].lat),
        parseFloat(data[0].lon),
      ]
    }
  } catch (error) {
    console.error('Geocoding failed:', error)
  }

  return null
}

async function resolveLocation(location) {
  if (!location) return null

  /*
   * Supports:
   * "21.1458, 79.0882"
   */
  const match = location.match(
    /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/
  )

  if (match) {
    return [
      parseFloat(match[1]),
      parseFloat(match[2]),
    ]
  }

  /*
   * Otherwise:
   * address → latitude/longitude
   */
  return geocodeAddress(location)
}

/* ─────────────────────────────────────────────
   SEVERITY
───────────────────────────────────────────── */

const SEVERITY = {
  Critical: {
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.65)',
    label: 'CRITICAL',
  },

  High: {
    color: '#f97316',
    glow: 'rgba(249,115,22,0.55)',
    label: 'HIGH',
  },

  Medium: {
    color: '#eab308',
    glow: 'rgba(234,179,8,0.45)',
    label: 'MEDIUM',
  },

  Low: {
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.4)',
    label: 'LOW',
  },
}

/* ─────────────────────────────────────────────
   CATEGORY ICONS
───────────────────────────────────────────── */

const CATEGORY_ICONS = {
  pothole: '🕳️',
  road: '🛣️',
  construction: '🚧',
  railway: '🚆',
  garbage: '🗑️',
  water: '💧',
  streetlight: '💡',
  traffic: '🚦',
  drainage: '💧',
}

/* ─────────────────────────────────────────────
   GET SEVERITY
───────────────────────────────────────────── */

function getSeverity(report) {
  if (report.severity) {
    return report.severity
  }

  const priority = Number(report.priority || 0)

  if (priority >= 9) return 'Critical'
  if (priority >= 7) return 'High'
  if (priority >= 4) return 'Medium'

  return 'Low'
}

/* ─────────────────────────────────────────────
   GET ICON
───────────────────────────────────────────── */

function getCategoryIcon(report) {
  const text = `
    ${report.category || ''}
    ${report.title || ''}
  `.toLowerCase()

  for (const [key, icon] of Object.entries(
    CATEGORY_ICONS
  )) {
    if (text.includes(key)) {
      return icon
    }
  }

  return report.icon || '⚠️'
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
function createHotspots(reports) {
  const validReports = reports.filter((report) => {
    const lat = Number(report.latitude)
    const lng = Number(report.longitude)

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    )
  })

  const hotspots = []
  const used = new Set()

  // Approximate clustering distance.
  // Increase this for larger hotspot areas.
  const DISTANCE = 0.01

  validReports.forEach((report, index) => {
    if (used.has(index)) return

    const cluster = [report]
    used.add(index)

    const lat1 = Number(report.latitude)
    const lng1 = Number(report.longitude)

    validReports.forEach((other, otherIndex) => {
      if (used.has(otherIndex)) return

      const lat2 = Number(other.latitude)
      const lng2 = Number(other.longitude)

      const distance = Math.sqrt(
        Math.pow(lat1 - lat2, 2) +
        Math.pow(lng1 - lng2, 2)
      )

      if (distance <= DISTANCE) {
        cluster.push(other)
        used.add(otherIndex)
      }
    })

    // Only call it a hotspot when multiple reports
    // are happening in approximately the same area.
    if (cluster.length >= 2) {
      const avgLat =
        cluster.reduce(
          (sum, r) => sum + Number(r.latitude),
          0
        ) / cluster.length

      const avgLng =
        cluster.reduce(
          (sum, r) => sum + Number(r.longitude),
          0
        ) / cluster.length

      const criticalCount = cluster.filter(
        (r) => getSeverity(r) === 'Critical'
      ).length

      const highCount = cluster.filter(
        (r) => getSeverity(r) === 'High'
      ).length

      let severity = 'Medium'

      if (criticalCount > 0) {
        severity = 'Critical'
      } else if (highCount > 0) {
        severity = 'High'
      }

      hotspots.push({
        id: `hotspot-${index}`,
        latitude: avgLat,
        longitude: avgLng,
        reports: cluster,
        count: cluster.length,
        severity,
      })
    }
  })

  return hotspots
}
export default function ChaosMap() {
  const { reports = [] } = useApp()

  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  const [chaosMode, setChaosMode] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  // 🔥 Generate hotspots from GPS reports
  const hotspots = createHotspots(reports)
  /* ─────────────────────────────────────────
     1. LOAD LEAFLET MAP
  ───────────────────────────────────────── */

  useEffect(() => {
    const cssId = 'leaflet-chaos-css'
    const jsId = 'leaflet-chaos-js'

    /*
     * Add Leaflet CSS
     */
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')

      link.id = cssId
      link.rel = 'stylesheet'
      link.href =
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

      document.head.appendChild(link)
    }

    /*
     * Initialize map
     */
    const initializeMap = () => {
      if (
        !window.L ||
        !mapRef.current ||
        mapInstanceRef.current
      ) {
        return
      }

      const L = window.L

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(
        [21.1458, 79.0882],
        12
      )

      /*
       * Dark Carto map
       */
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map)

      /*
       * Zoom control
       */
      L.control
        .zoom({
          position: 'bottomright',
        })
        .addTo(map)

      mapInstanceRef.current = map

      setMapReady(true)
    }

    /*
     * Load Leaflet JS
     */
    if (!document.getElementById(jsId)) {
      const script =
        document.createElement('script')

      script.id = jsId

      script.src =
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

      script.onload = initializeMap

      document.body.appendChild(script)
    } else {
      initializeMap()
    }

    /*
     * Cleanup
     */
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  /* ─────────────────────────────────────────
     2. ADD REPORT MARKERS
  ───────────────────────────────────────── */

  useEffect(() => {
    if (
      !mapReady ||
      !mapInstanceRef.current ||
      !window.L
    ) {
      return
    }

    const L = window.L
    const map = mapInstanceRef.current

    let cancelled = false

    async function addReportMarkers() {
      /*
       * Remove old markers
       */
      markersRef.current.forEach(
        (marker) => {
          map.removeLayer(marker)
        }
      )

      markersRef.current = []

      if (!chaosMode) {
        return
      }

      /*
       * Process every CitySync report
       */
      for (const report of reports) {
        if (cancelled) {
          return
        }

        let latitude
        let longitude

        /*
         * OPTION 1
         * latitude / longitude
         */
        if (
          report.latitude != null &&
          report.longitude != null
        ) {
          latitude = Number(
            report.latitude
          )

          longitude = Number(
            report.longitude
          )
        }

        /*
         * OPTION 2
         * lat / lng
         */
        else if (
          report.lat != null &&
          report.lng != null
        ) {
          latitude = Number(report.lat)
          longitude = Number(report.lng)
        }

        /*
         * OPTION 3
         * Current CitySync format:
         *
         * location:
         * "Nagpur, Maharashtra"
         */
        else if (report.location) {
          const coords =
            await resolveLocation(
              report.location
            )

          if (!coords) {
            console.warn(
              'Could not locate report:',
              report.location
            )

            continue
          }

          latitude = coords[0]
          longitude = coords[1]
        }

        /*
         * No valid coordinates
         */
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          continue
        }

        /*
         * Severity
         */
        const severity =
          getSeverity(report)

        const config =
          SEVERITY[severity] ||
          SEVERITY.Medium

        /*
         * Icon
         */
        const icon =
          getCategoryIcon(report)

        /* ─────────────────────────────
           CREATE CUSTOM MARKER
        ───────────────────────────── */

        const markerIcon =
          L.divIcon({
            className:
              'citysync-chaos-marker',

            html: `
              <div
                class="chaos-marker-wrapper ${
                  severity === 'Critical'
                    ? 'chaos-critical'
                    : ''
                }"
                style="
                  --severity-color:${config.color};
                  --severity-glow:${config.glow};
                "
              >

                <div
                  class="chaos-marker-glow"
                ></div>

                <div
                  class="chaos-marker"
                >
                  <span>${icon}</span>
                </div>

              </div>
            `,

            iconSize: [50, 50],

            iconAnchor: [25, 25],
          })

        /*
         * Add marker
         */
        const marker =
          L.marker(
            [latitude, longitude],
            {
              icon: markerIcon,
            }
          ).addTo(map)

        /* ─────────────────────────────
           POPUP
        ───────────────────────────── */

        marker.bindPopup(`
          <div
            style="
              min-width:220px;
              font-family:Sora,sans-serif;
              padding:4px;
            "
          >

            <div
              style="
                font-size:10px;
                font-weight:800;
                letter-spacing:.08em;
                color:${config.color};
                margin-bottom:6px;
              "
            >
              ${config.label}
            </div>

            <div
              style="
                font-size:15px;
                font-weight:800;
                margin-bottom:5px;
              "
            >
              ${icon}
              ${report.title || 'Civic Issue'}
            </div>

            <div
              style="
                font-size:12px;
                color:#6b7280;
                margin-bottom:10px;
              "
            >
              ${
                report.location ||
                'Location detected'
              }
            </div>

            <div
              style="
                display:flex;
                justify-content:space-between;
                font-size:11px;
                font-weight:700;
              "
            >
              <span>Status</span>

              <span>
                ${
                  report.status ||
                  'Pending'
                }
              </span>
            </div>

          </div>
        `)

        markersRef.current.push(marker)
      }
    }

    addReportMarkers()

    return () => {
      cancelled = true
    }
  }, [
    reports,
    chaosMode,
    mapReady,
  ])

  /* ─────────────────────────────────────────
     3. STATISTICS
  ───────────────────────────────────────── */

  const totalReports =
    reports.length

  const criticalReports =
    reports.filter(
      (report) =>
        getSeverity(report) ===
        'Critical'
    ).length

  const openReports =
    reports.filter(
      (report) =>
        !report.status ||
        report.status !== 'Resolved'
    ).length

  const potholes =
    reports.filter((report) =>
      `
        ${report.category || ''}
        ${report.title || ''}
      `
        .toLowerCase()
        .includes('pothole')
    ).length

  /* ─────────────────────────────────────────
     4. UI
  ───────────────────────────────────────── */

  return (
    <div className="chaos-map">

      {/* MAP */}

      <div
        ref={mapRef}
        className="chaos-map-canvas"
      />

      {/* TOP HUD */}

      <div className="chaos-hud">

        <div>

          <div className="chaos-eyebrow">
            CITYSYNC / LIVE INFRASTRUCTURE
          </div>

          <div className="chaos-title">
            CITY CHAOS
          </div>

        </div>

        <button
          className={`chaos-toggle ${
            chaosMode
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setChaosMode(
              (value) => !value
            )
          }
        >

          <span className="live-dot" />

          {chaosMode
            ? 'CHAOS MODE'
            : 'NORMAL MODE'}

        </button>

      </div>

      {/* LIVE COUNTERS */}

      <div className="chaos-stats">

        <div className="chaos-stat">

          <span>
            TOTAL REPORTS
          </span>

          <strong>
            {totalReports}
          </strong>

        </div>

        <div className="chaos-stat">

          <span>
            OPEN ISSUES
          </span>

          <strong>
            {openReports}
          </strong>

        </div>

        <div
          className="chaos-stat critical"
        >

          <span>
            CRITICAL
          </span>

          <strong>
            {criticalReports}
          </strong>

        </div>

        <div className="chaos-stat">

          <span>
            POTHOLES
          </span>

          <strong>
            {potholes}
          </strong>

        </div>

      </div>

      {/* LEGEND */}

      <div className="chaos-legend">

        {Object.entries(
          SEVERITY
        ).map(
          ([name, value]) => (
            <div
              key={name}
              className="legend-item"
            >

              <span
                style={{
                  background:
                    value.color,
                }}
              />

              {value.label}

            </div>
          )
        )}

      </div>

    </div>
  )
}