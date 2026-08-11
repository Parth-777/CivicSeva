export const classifierData = [
  {
    keywords: ['pothole', 'road', 'highway', 'damage', 'tyre', 'surface', 'broken', 'asphalt'],
    category: 'Road Issues',
    dept: 'Roadways Dept',
    priority: 'High',
    eta: '2–4 Days',
    conf: 94,
    dup: 'No',
    note: '🧭 Routed to Roadways Department. Field crew will assess and patch within SLA window.',
  },
  {
    keywords: ['water', 'pipe', 'burst', 'flood', 'leak', 'overflow', 'tap', 'supply'],
    category: 'Water Overflow',
    dept: 'Municipal Corp',
    priority: 'Critical',
    eta: '4–8 Hours',
    conf: 97,
    dup: 'No',
    note: '🚨 Critical issue flagged. Municipal water team will be dispatched immediately.',
  },
  {
    keywords: ['garbage', 'waste', 'trash', 'bin', 'rubbish', 'dump', 'smell', 'odour'],
    category: 'Garbage / Sanitation',
    dept: 'Municipal Corp',
    priority: 'Medium',
    eta: '1–2 Days',
    conf: 91,
    dup: 'No',
    note: '🗑️ Routed to Sanitation wing of Municipal Corporation for scheduled pickup.',
  },
  {
    keywords: ['drain', 'drainage', 'sewage', 'manhole', 'waterlog', 'sewer'],
    category: 'Drainage Problems',
    dept: 'Municipal Corp',
    priority: 'High',
    eta: '1–3 Days',
    conf: 89,
    dup: 'No',
    note: '🌧️ Routed to Drainage Department. Engineers will inspect and clear blockage.',
  },
  {
    keywords: ['railway', 'track', 'rail', 'train', 'signal', 'crossing', 'station'],
    category: 'Rail Track Issues',
    dept: 'Railway Authority',
    priority: 'Critical',
    eta: '2–6 Hours',
    conf: 96,
    dup: 'No',
    note: '🚆 Safety-critical issue. Railway Authority has been alerted with high priority flag.',
  },
  {
    keywords: ['accident', 'crash', 'collision', 'vehicle', 'emergency', 'ambulance', 'injury'],
    category: 'Highway Accident',
    dept: 'Roadways / Traffic Police',
    priority: 'Critical',
    eta: 'Immediate',
    conf: 98,
    dup: 'No',
    note: '🚨 Emergency routed to Traffic Police and Emergency Services simultaneously.',
  },
]

export function classify(text) {
  const lower = text.trim().toLowerCase()
  if (!lower) return null
  let best = null
  let bestScore = 0
  classifierData.forEach((cat) => {
    const score = cat.keywords.filter((k) => lower.includes(k)).length
    if (score > bestScore) {
      bestScore = score
      best = cat
    }
  })
  return (
    best || {
      category: 'General Civic Issue',
      dept: 'Municipal Corp',
      priority: 'Low',
      eta: '5–7 Days',
      conf: 72,
      dup: 'No',
      note: '📋 No specific category matched. Routed to Municipal Corporation for manual review.',
    }
  )
}