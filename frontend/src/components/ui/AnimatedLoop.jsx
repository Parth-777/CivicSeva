export default function AnimatedLoop() {
  return (
    <div style={{ width: '680px', maxWidth: '100%' }}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .loop-flow { animation: loop-flow 1.4s linear infinite; }
          @keyframes loop-flow { to { stroke-dashoffset: -24; } }
          .loop-dots-g { animation: loop-dots-g 1.2s linear infinite; }
          @keyframes loop-dots-g { to { stroke-dashoffset: -20; } }
          .loop-dots-b { animation: loop-dots-b 1.2s linear infinite; }
          @keyframes loop-dots-b { to { stroke-dashoffset: -20; } }
          .loop-dots-o { animation: loop-dots-o 1.2s linear infinite; }
          @keyframes loop-dots-o { to { stroke-dashoffset: -20; } }
          .loop-star { animation: loop-spin 9s linear infinite; transform-origin: 330px 175px; }
          @keyframes loop-spin { to { transform: rotate(360deg); } }
          .loop-warn { animation: loop-warnpulse 1.3s ease-in-out infinite; transform-origin: 205px 396px; }
          @keyframes loop-warnpulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
          .loop-uparrow { animation: loop-uppulse 1.6s ease-in-out infinite; }
          @keyframes loop-uppulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
        }
      `}</style>
      <svg width="100%" viewBox="0 0 680 460" role="img" aria-label="Animated cycle: Report goes to No Action, to Follow-Up, to Pending, and back to Report">
        <defs>
          <marker id="loop-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        <path className="loop-flow" d="M495,110 C540,150 565,200 558,258" fill="none" stroke="#2d2d3a" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 11" markerEnd="url(#loop-ah)" />
        <path className="loop-dots-g" d="M470,150 C500,175 515,205 520,235" fill="none" stroke="#2fae66" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" opacity="0.85" />
        <circle cx="548" cy="272" r="7" fill="none" stroke="#2fae66" strokeWidth="2.5" />
        <circle cx="562" cy="286" r="4" fill="none" stroke="#2fae66" strokeWidth="2" />

        <path className="loop-flow" d="M535,304 C518,352 465,382 400,392" fill="none" stroke="#2d2d3a" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 11" markerEnd="url(#loop-ah)" />
        <path className="loop-dots-b" d="M495,335 C465,355 445,368 425,378" fill="none" stroke="#4361ee" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" opacity="0.85" />

        <g className="loop-uparrow">
          <path d="M178,405 L178,268" fill="none" stroke="#2d2d3a" strokeWidth="6" strokeLinecap="round" markerEnd="url(#loop-ah)" />
        </g>
        <path className="loop-dots-o" d="M120,395 L120,270" fill="none" stroke="#f4923b" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" opacity="0.85" />

        <path className="loop-flow" d="M170,222 C150,140 280,80 470,98" fill="none" stroke="#2d2d3a" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 11" markerEnd="url(#loop-ah)" />
        <path className="loop-dots-o" d="M95,180 C90,140 105,110 135,90" fill="none" stroke="#f4923b" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" opacity="0.85" />

        <g className="loop-star" fill="#2d2d3a">
          <path d="M330,155 L336,172 L354,172 L339,183 L345,200 L330,189 L315,200 L321,183 L306,172 L324,172 Z" />
        </g>

        <rect x="220" y="42" width="128" height="42" rx="21" fill="#2fae66" />
        <text x="284" y="63" textAnchor="middle" dominantBaseline="central" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="15" fill="#fff">Report</text>

        <rect x="15" y="198" width="150" height="46" rx="23" fill="#f4923b" />
        <text x="90" y="221" textAnchor="middle" dominantBaseline="central" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="15" fill="#fff">Pending…</text>

        <rect x="480" y="238" width="150" height="42" rx="21" fill="#4361ee" />
        <text x="555" y="259" textAnchor="middle" dominantBaseline="central" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="15" fill="#fff">No Action</text>

        <g className="loop-warn">
          <path d="M205,382 L219,406 L191,406 Z" fill="#e74c3c" />
          <text x="205" y="400" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="11" fill="#fff">!</text>
        </g>
        <rect x="235" y="384" width="150" height="42" rx="21" fill="#4361ee" />
        <text x="310" y="405" textAnchor="middle" dominantBaseline="central" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="15" fill="#fff">Follow-Up</text>
      </svg>
    </div>
  )
}
