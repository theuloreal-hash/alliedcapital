import { cn } from "@/lib/utils"

export function Sparkline({
  values,
  stroke = "#e0aa4d",
  className,
  area = true,
}: {
  values: number[]
  stroke?: string
  className?: string
  area?: boolean
}) {
  const width = 240
  const height = 64
  const pad = 4
  const series = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0]
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1

  const points = series.map((value, index) => {
    const x = pad + (index / (series.length - 1)) * (width - pad * 2)
    const y = height - pad - ((value - min) / span) * (height - pad * 2)
    return [x, y] as const
  })

  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const first = points[0]
  const last = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-16 w-full", className)}
      aria-hidden="true"
    >
      {area && (
        <path
          d={`${line} L${last[0].toFixed(1)} ${height} L${first[0].toFixed(1)} ${height} Z`}
          fill={stroke}
          opacity={0.16}
        />
      )}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r={4} fill="#293744" stroke={stroke} strokeWidth={2.2} />
    </svg>
  )
}
