import { useEffect, useRef, useState } from 'preact/hooks'
import {
  applyHour12,
  dragMinute,
  hourHandDegrees,
  minuteHandDegrees,
  type ClockValue,
} from '../logic/clockMath.ts'
import { SunMoon } from './Art.tsx'

const C = 150
const SIZE = 300
/**
 * Inside this fraction of the radius the child sets the hour (the short hand and the
 * numbers 1–12). Outside, the long minute hand and the minute numbers.
 */
const HOUR_ZONE = 0.7

type Point = { radius: number; deg: number; minute: number; hour12: number }

type Props = {
  value: ClockValue
  minuteMarkers: boolean
  geared: boolean
  interactive: boolean
  use24: boolean
  showPeriod: boolean
  ghost: { hour: number; minute: number } | null
  wrongHour: boolean
  wrongMinute: boolean
  onChange?: (next: ClockValue) => void
  onRelease?: (next: ClockValue) => void
  testId?: string
}

function readPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const rect = svg.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  const radius = Math.hypot(dx, dy) / (rect.width / 2 || 1)
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI
  if (deg < 0) deg += 360
  const minute = Math.round(deg / 6) % 60
  let hour12 = Math.round(deg / 30) % 12
  if (hour12 === 0) hour12 = 12
  return { radius, deg, minute, hour12 }
}

function Hand({
  angle,
  y2,
  tail,
  width,
  color,
  className,
  knob = 0,
}: {
  angle: number
  y2: number
  tail: number
  width: number
  color: string
  className: string
  knob?: number
}) {
  return (
    <g className={className} style={{ transform: `rotate(${angle}deg)` }}>
      <line
        x1={C}
        y1={C + tail}
        x2={C}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      {knob > 0 && <circle cx={C} cy={y2} r={knob} fill={color} />}
    </g>
  )
}

export function AnalogClock({
  value,
  minuteMarkers,
  geared,
  interactive,
  use24,
  showPeriod,
  ghost,
  wrongHour,
  wrongMinute,
  onChange,
  onRelease,
  testId = 'clock',
}: Props) {
  const live = useRef(value)
  const drag = useRef<{ hand: 'hour' | 'minute'; lastMinute: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [ghostDraw, setGhostDraw] = useState<{ hour: number; minute: number } | null>(null)
  if (!dragging) live.current = value

  useEffect(() => {
    if (!ghost) {
      setGhostDraw(null)
      return
    }
    const start = { hour: value.hour, minute: value.minute }
    setGhostDraw(start)
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setGhostDraw({ hour: ghost.hour, minute: ghost.minute }))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
    // The hint travels from the child's hands to the right time once per hint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghost?.hour, ghost?.minute])

  const hourAngle = value.hourAngle ?? hourHandDegrees(value.hour, value.minute)
  const minuteAngle = minuteHandDegrees(value.minute)

  function commit(hand: 'hour' | 'minute', point: Point, isStart: boolean): ClockValue {
    const cur = live.current
    let next: ClockValue
    if (hand === 'hour') {
      next = {
        hour: applyHour12(point.hour12, use24),
        minute: cur.minute,
        hourAngle: geared ? null : point.deg,
      }
    } else {
      let hour = cur.hour
      if (!isStart && geared && drag.current) {
        hour = dragMinute(cur.hour, drag.current.lastMinute, point.minute, use24).hour
      }
      next = {
        hour,
        minute: point.minute,
        hourAngle: geared ? null : (cur.hourAngle ?? hourHandDegrees(cur.hour, cur.minute)),
      }
    }
    if (drag.current) drag.current.lastMinute = point.minute
    live.current = next
    onChange?.(next)
    return next
  }

  function pointerDown(event: PointerEvent) {
    if (!interactive) return
    event.preventDefault()
    const svg = event.currentTarget as SVGSVGElement
    svg.setPointerCapture(event.pointerId)
    const point = readPoint(svg, event.clientX, event.clientY)
    const hand = point.radius < HOUR_ZONE ? 'hour' : 'minute'
    drag.current = { hand, lastMinute: point.minute }
    setDragging(true)
    commit(hand, point, true)
  }

  function pointerMove(event: PointerEvent) {
    if (!drag.current) return
    const svg = event.currentTarget as SVGSVGElement
    const point = readPoint(svg, event.clientX, event.clientY)
    commit(drag.current.hand, point, false)
  }

  function pointerUp(event: PointerEvent) {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    onRelease?.(live.current)
    const svg = event.currentTarget as SVGSVGElement
    if (svg.hasPointerCapture?.(event.pointerId)) svg.releasePointerCapture(event.pointerId)
  }

  const numbers = []
  for (let n = 1; n <= 12; n++) {
    const angle = (n / 12) * Math.PI * 2
    numbers.push(
      <text
        key={`h${n}`}
        x={C + Math.sin(angle) * 80}
        y={C - Math.cos(angle) * 80}
        className="hour-num"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {n}
      </text>,
    )
  }

  const minuteNumbers = []
  if (minuteMarkers) {
    for (let n = 5; n <= 55; n += 5) {
      const angle = (n / 60) * Math.PI * 2
      minuteNumbers.push(
        <text
          key={`m${n}`}
        x={C + Math.sin(angle) * 114}
        y={C - Math.cos(angle) * 114}
          className="minute-num"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {n}
        </text>,
      )
    }
  }

  const ticks = []
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0
    ticks.push(
      <line
        key={`t${i}`}
        x1={C}
        y1={12}
        x2={C}
        y2={major ? 24 : 18}
        stroke={major ? '#1c2742' : '#e4d7c4'}
        strokeWidth={major ? 3 : 1.5}
        strokeLinecap="round"
        transform={`rotate(${(i / 60) * 360} ${C} ${C})`}
      />,
    )
  }

  const handClass = dragging ? 'hand is-dragging' : 'hand'

  return (
    <div className={`clock-wrap${wrongHour || wrongMinute ? ' is-wrong' : ''}`}>
      <svg
        className="clock-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        data-testid={testId}
        data-hour={value.hour}
        data-minute={value.minute}
        role="img"
        aria-label="Analoge Uhr"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        <circle cx={C} cy={C} r={146} fill="#ffc53d" />
        <circle cx={C} cy={C} r={136} fill="#fffaf2" />
        {ticks}
        {minuteNumbers}
        {numbers}
        {ghostDraw && (
          <>
            <Hand
              angle={hourHandDegrees(ghostDraw.hour, ghostDraw.minute)}
              y2={78}
              tail={14}
              width={18}
              color="#1fa971"
              className="hand ghost"
            />
            <Hand
              angle={minuteHandDegrees(ghostDraw.minute)}
              y2={28}
              tail={12}
              width={8}
              color="#1fa971"
              className="hand ghost"
            />
          </>
        )}
        <Hand
          angle={hourAngle}
          y2={78}
          tail={18}
          width={18}
          color="#ef3d5a"
          className={`${handClass}${wrongHour ? ' wrong' : ''}`}
          knob={14}
        />
        <Hand
          angle={minuteAngle}
          y2={28}
          tail={16}
          width={8}
          color="#1f6feb"
          className={`${handClass}${wrongMinute ? ' wrong' : ''}`}
          knob={12}
        />
        <circle cx={C} cy={C} r={13} fill="#ffc53d" stroke="#1c2742" strokeWidth={3} />
        <circle cx={144} cy={148} r={1.8} fill="#1c2742" />
        <circle cx={156} cy={148} r={1.8} fill="#1c2742" />
        <path d="M144 155 Q150 160 156 155" fill="none" stroke="#1c2742" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
      {showPeriod && (
        <div className="period-badge" aria-hidden="true">
          <SunMoon hour={value.hour} />
        </div>
      )}
    </div>
  )
}
