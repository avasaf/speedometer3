import { React } from 'jimu-core'

export interface SpeedometerProps {
  value: number
  min?: number
  max?: number
  gaugeColor?: string
  needleColor?: string
  thresholds?: { value: number, color: string }[]
  labelColor?: string
  labelFontFamily?: string
  labelFontSize?: number
  labelBold?: boolean
  tickColor?: string
  tickFontFamily?: string
  tickFontSize?: number
  padding?: number
}

export const Speedometer = ({
  value,
  min = 0,
  max = 40,
  gaugeColor = '#000',
  needleColor = 'red',
  labelColor = '#000',
  labelFontFamily = 'Arial',
  labelFontSize = 12,
  labelBold = false,
  tickColor = '#000',
  tickFontFamily = 'Arial',
  tickFontSize = 10,
  padding = 0,
  thresholds
}: SpeedometerProps): React.ReactElement => {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const angle = ratio * 180 - 90
  const thresholdColor = React.useMemo(() => {
    if (!thresholds || thresholds.length === 0) return gaugeColor
    const sorted = [...thresholds].sort((a, b) => a.value - b.value)
    const match = sorted.find(t => value <= t.value) ?? sorted[sorted.length - 1]
    return match.color
  }, [thresholds, value, gaugeColor]);

  const ticks = React.useMemo(() => {
    const count = 4
    const cx = 100
    const cy = 100
    const outer = 90
    const inner = 82
    const labelRadius = 65
    return Array.from({ length: count + 1 }, (_, i) => {
      const r = i / count
      const rad = Math.PI - r * Math.PI
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const x1 = cx + outer * cos
      const y1 = cy - outer * sin
      const x2 = cx + inner * cos
      const y2 = cy - inner * sin
      const lx = cx + labelRadius * cos
      const ly = cy - labelRadius * sin
      const label = Math.round(min + (max - min) * r)
      return { x1, y1, x2, y2, lx, ly, label }
    })
  }, [min, max]);

  return (
    <div className='speedometer' style={{ width: '100%', height: '100%', marginTop: 8, padding }}>
      <svg
        viewBox='0 0 200 160'
        xmlns='http://www.w3.org/2000/svg'
        aria-label='Gauge icon'
        preserveAspectRatio='xMidYMid meet'
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <g fill='none' strokeLinecap='round'>
          <g stroke={thresholdColor}>
            <path d='M 10 100 A 90 90 0 0 1 190 100' strokeWidth='4' />
            <g strokeWidth='4'>
              {ticks.map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
              ))}
            </g>
            <g strokeWidth='2'>
              <line x1='100' y1='88' x2='100' y2='82' />
              <line x1='112' y1='100' x2='118' y2='100' />
              <line x1='100' y1='112' x2='100' y2='118' />
              <line x1='88' y1='100' x2='82' y2='100' />
              <line x1='108' y1='92' x2='112' y2='88' />
              <line x1='108' y1='108' x2='112' y2='112' />
              <line x1='92' y1='108' x2='88' y2='112' />
              <line x1='92' y1='92' x2='88' y2='88' />
            </g>
          </g>
          <g stroke='none'>
            {ticks.map((t, i) => (
              <text
                key={`label-${i}`}
                x={t.lx}
                y={t.ly}
                textAnchor='middle'
                alignmentBaseline='middle'
                fontSize={tickFontSize}
                fontFamily={tickFontFamily}
                fill={tickColor}
              >
                {t.label}
              </text>
            ))}
          </g>
          <g stroke={thresholds && thresholds.length ? thresholdColor : needleColor} strokeWidth='3'>
            <circle cx='100' cy='100' r='12' fill='none' />
            <line x1='100' y1='100' x2='100' y2='50' transform={`rotate(${angle} 100 100)`} />
          </g>
        </g>
        <text
          x='100'
          y='150'
          textAnchor='middle'
          fontSize={labelFontSize}
          fontFamily={labelFontFamily}
          fontWeight={labelBold ? 'bold' : 'normal'}
          fill={labelColor}
        >
          {value.toFixed(0)} knt
        </text>
        </svg>
      </div>
    </div>
  )
}
