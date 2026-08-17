export const DEPT_CONFIG = {
  MUNICIPAL: {
    password: 'GOVERNMENT',
    dashboard: 'dashboard-municipal',
    allowedCategories: ['water', 'garbage', 'drainage'],
    label: 'Municipal Corporation Dashboard',
    icon: '🏛️',
    tag: 'MUNICIPAL',
    stats: { open: 14, critical: 3, inProgress: 6, resolved: 31 },
  },
  ROADWAYS: {
    password: 'GOVERNMENT',
    dashboard: 'dashboard-roadways',
    allowedCategories: ['road', 'accident'],
    label: 'Roadways & Traffic Department Dashboard',
    icon: '🛣️',
    tag: 'ROADWAYS',
    stats: { open: 9, critical: 4, inProgress: 3, resolved: 18 },
  },
  RAILWAY: {
    password: 'GOVERNMENT',
    dashboard: 'dashboard-railway',
    allowedCategories: ['rail'],
    label: 'Railway Authority Dashboard',
    icon: '🚆',
    tag: 'RAILWAY',
    stats: { open: 7, critical: 2, inProgress: 4, resolved: 12 },
  },
}

export const STATUS_COLORS = {
  Pending: { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  'In Progress': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  Resolved: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
}

export const PRIORITY_MAP = {
  road: 'High',
  rail: 'Critical',
  garbage: 'Medium',
  drainage: 'High',
  water: 'Critical',
  accident: 'Critical',
}

export const PRIORITY_COLORS = {
  Critical: '#e04b4b',
  High: '#f0792a',
  Medium: '#f5a623',
  Low: '#7a8799',
}

export const initialReports = [
  
]