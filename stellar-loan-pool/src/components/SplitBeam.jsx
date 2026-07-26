// src/components/SplitBeam.jsx
//
// Signature visual: one source line forks into N recipient lines,
// echoing what the transaction itself does (one payment, many destinations).

export default function SplitBeam({ count }) {
  const n = Math.max(1, count)
  const height = Math.max(64, n * 34)
  const sourceY = height / 2
  const spacing = height / (n + 1)

  return (
    <svg
      viewBox={`0 0 120 ${height}`}
      width="60"
      height={height}
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="10" cy={sourceY} r="4" fill="#FFB100" />
      {Array.from({ length: n }).map((_, i) => {
        const y = spacing * (i + 1)
        const midX = 60
        return (
          <path
            key={i}
            d={`M 14 ${sourceY} C ${midX} ${sourceY}, ${midX} ${y}, 110 ${y}`}
            fill="none"
            stroke="#4F9DFF"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-beam"
            opacity={0.85}
          />
        )
      })}
      {Array.from({ length: n }).map((_, i) => {
        const y = spacing * (i + 1)
        return <circle key={`d-${i}`} cx="110" cy={y} r="3" fill="#7AB6FF" />
      })}
    </svg>
  )
}
