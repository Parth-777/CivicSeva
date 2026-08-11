
import { STATUS_COLORS } from '../../data/reportStore'

export default function StatusBadge({ status }) {
  const sc = STATUS_COLORS[status] || STATUS_COLORS['Pending']
  return (
    <span
      style={{
        background: sc.bg,
        color: sc.color,
        border: `1px solid ${sc.border}`,
        fontFamily: "'Sora', sans-serif",
      }}
      className="text-xs font-bold px-2 py-0.5 rounded-full"
    >
      {status}
    </span>
  )
}