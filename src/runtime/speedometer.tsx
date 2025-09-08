/** @jsx jsx */
import { React, jsx } from 'jimu-core'

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

export function Speedometer(props: SpeedometerProps): React.ReactElement {
  const {
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
  } = props

  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const angle = ratio * 180 - 90

  const sorted = thresholds ? [...thresholds].sort((a, b) => a.value - b.value) : []
  const thresholdColor = sorted.length
    ? (sorted.find(t => value <= t.value) || sorted[sorted.length - 1]).color
    : gaugeColor

  const count = 4
  const cx = 100
  const cy = 100
  const outer = 90
  const inner = 82
  const labelRadius = 65
  const ticks = Array.from({ length: count + 1 }, (_, i) => {
    const r = i / count
    const rad = Math.PI - r * Math.PI
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    return {
      x1: cx + outer * cos,
      y1: cy - outer * sin,
      x2: cx + inner * cos,
      y2: cy - inner * sin,
      lx: cx + labelRadius * cos,
      ly: cy - labelRadius * sin,
      label: Math.round(min + (max - min) * r)
    }
  })

  const needleTransform = 'rotate(' + angle + ' 100 100)'

  return jsx('div', {
    className: 'speedometer',
    style: { width: '100%', height: '100%', padding },
    children: jsx('svg', {
      viewBox: '0 0 200 200',
      xmlns: 'http://www.w3.org/2000/svg',
      'aria-label': 'Gauge icon',
      preserveAspectRatio: 'xMidYMid meet',
      style: { width: '100%', height: '100%', overflow: 'visible' },
      children: [
        jsx('g', {
          key: 'gauge',
          fill: 'none',
          strokeLinecap: 'round',
          children: [
            jsx('g', {
              key: 'arc',
              stroke: thresholdColor,
              children: [
                jsx('path', { key: 'arc-path', d: 'M 10 100 A 90 90 0 0 1 190 100', strokeWidth: 4 }),
                jsx('g', {
                  key: 'ticks',
                  strokeWidth: 4,
                  children: ticks.map((t, i) =>
                    jsx('line', { key: i, x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 })
                  )
                }),
                jsx('g', {
                  key: 'minor',
                  strokeWidth: 2,
                  children: [
                    jsx('line', { key: 'top', x1: 100, y1: 88, x2: 100, y2: 82 }),
                    jsx('line', { key: 'right', x1: 112, y1: 100, x2: 118, y2: 100 }),
                    jsx('line', { key: 'bottom', x1: 100, y1: 112, x2: 100, y2: 118 }),
                    jsx('line', { key: 'left', x1: 88, y1: 100, x2: 82, y2: 100 }),
                    jsx('line', { key: 'ne', x1: 108, y1: 92, x2: 112, y2: 88 }),
                    jsx('line', { key: 'se', x1: 108, y1: 108, x2: 112, y2: 112 }),
                    jsx('line', { key: 'sw', x1: 92, y1: 108, x2: 88, y2: 112 }),
                    jsx('line', { key: 'nw', x1: 92, y1: 92, x2: 88, y2: 88 })
                  ]
                })
              ]
            }),
            jsx('g', {
              key: 'labels',
              stroke: 'none',
              children: ticks.map((t, i) =>
                jsx('text', {
                  key: 'label-' + i,
                  x: t.lx,
                  y: t.ly,
                  textAnchor: 'middle',
                  alignmentBaseline: 'middle',
                  fontSize: tickFontSize,
                  fontFamily: tickFontFamily,
                  fill: tickColor,
                  children: t.label.toString()
                })
              )
            }),
            jsx('g', {
              key: 'needle',
              stroke: thresholds && thresholds.length ? thresholdColor : needleColor,
              strokeWidth: 3,
              children: [
                jsx('circle', { key: 'hub', cx: 100, cy: 100, r: 12, fill: 'none' }),
                jsx('line', { key: 'hand', x1: 100, y1: 100, x2: 100, y2: 50, transform: needleTransform })
              ]
            })
          ]
        }),
        jsx('text', {
          key: 'value',
          x: 100,
          y: 170,
          textAnchor: 'middle',
          fontSize: labelFontSize,
          fontFamily: labelFontFamily,
          fontWeight: labelBold ? 'bold' : 'normal',
          fill: labelColor,
          children: value.toFixed(0) + ' knt'
        })
      ]
    })
  })
}
