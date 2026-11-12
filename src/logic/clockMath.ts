export type Time = { hour: number; minute: number }

export type ClockValue = Time & {
  /** Exact hour-hand degrees from 12, clockwise. Null = geared from hour + minute. */
  hourAngle: number | null
}

/** How far (in minutes) a hand may sit from the snapped mark and still count. */
export function minuteWindow(step: number): number {
  if (step <= 1) return 0
  if (step <= 5) return 2
  return 5
}

export function snapToStep(minute: number, step: number): number {
  const m = ((minute % 60) + 60) % 60
  if (step <= 1) return m
  const snapped = Math.round(m / step) * step
  return ((snapped % 60) + 60) % 60
}

export function circularMinuteDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 60
  return Math.min(d, 60 - d)
}

export function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** Hour hand on a real clock: 30° per hour plus half a degree per minute. */
export function hourHandDegrees(hour: number, minute: number): number {
  const h = ((hour % 12) + 12) % 12
  return (h + minute / 60) * 30
}

export function minuteHandDegrees(minute: number): number {
  return (((minute % 60) + 60) % 60) * 6
}

/** Lenient: the hour hand only has to sit near the geared position, between the right numbers. */
export const HOUR_TOLERANCE_DEG = 22

export type HandCheck = {
  ok: boolean
  minuteOk: boolean
  hourOk: boolean
  snappedMinute: number
}

export function checkAnalog(
  actual: ClockValue,
  target: Time,
  step: number,
): HandCheck {
  const snappedMinute = snapToStep(actual.minute, step)
  const minuteOk =
    circularMinuteDistance(actual.minute, snappedMinute) <= minuteWindow(step) &&
    snappedMinute === target.minute
  const expected = hourHandDegrees(target.hour, target.minute)
  const actualDeg = actual.hourAngle ?? hourHandDegrees(actual.hour, actual.minute)
  const hourOk = angleDiff(expected, actualDeg) <= HOUR_TOLERANCE_DEG
  return { ok: minuteOk && hourOk, minuteOk, hourOk, snappedMinute }
}

export function checkDigital(actual: Time, target: Time, step: number, use24: boolean): HandCheck {
  const snappedMinute = snapToStep(actual.minute, step)
  const minuteOk =
    circularMinuteDistance(actual.minute, snappedMinute) <= minuteWindow(step) &&
    snappedMinute === target.minute
  const hourOk = use24 ? actual.hour === target.hour : faceHour12(actual.hour) === faceHour12(target.hour)
  return { ok: minuteOk && hourOk, minuteOk, hourOk, snappedMinute }
}

export function faceHour12(hour: number): number {
  const h = ((hour % 12) + 12) % 12
  return h === 0 ? 12 : h
}

/**
 * Map a face hour (1–12) back to the stored hour.
 * In 24-hour play the dial stands for the afternoon and evening (12–23).
 */
export function applyHour12(hour12: number, use24: boolean): number {
  const face = hour12 === 0 ? 12 : hour12
  if (!use24) return face
  if (face === 12) return 12
  return face + 12
}

export function bumpHour(hour: number, dir: 1 | -1, use24: boolean): number {
  if (!use24) {
    let h = faceHour12(hour) + dir
    if (h > 12) h = 1
    if (h < 1) h = 12
    return h
  }
  return (hour + dir + 24) % 24
}

/**
 * Drag the minute hand. A small move across 12 changes the hour (geared).
 * A teleport (tap) should call this only when the short path actually crosses 12,
 * which the delta check already requires.
 */
export function dragMinute(
  hour: number,
  prev: number,
  next: number,
  use24: boolean,
): Time {
  let delta = next - prev
  if (delta > 30) delta -= 60
  if (delta < -30) delta += 60
  let h = hour
  if (delta > 0 && next < prev) h = bumpHour(hour, 1, use24)
  else if (delta < 0 && next > prev) h = bumpHour(hour, -1, use24)
  return { hour: h, minute: next }
}

/** Minute buttons cycle the level's marks and leave the hour alone. */
export function cycleMinute(minute: number, step: number, dir: 1 | -1): number {
  const size = step <= 1 ? 60 : Math.round(60 / step)
  const unit = step <= 1 ? 1 : step
  let idx = Math.round(minute / unit)
  idx = (idx + dir + size) % size
  return idx * unit
}

export function formatDigital(hour: number, minute: number, use24: boolean): string {
  const hh = use24 ? ((hour % 24) + 24) % 24 : faceHour12(hour)
  const hStr = use24 ? String(hh).padStart(2, '0') : String(hh)
  const mStr = String(((minute % 60) + 60) % 60).padStart(2, '0')
  return `${hStr}:${mStr}`
}

/** Sun from 6:00 until 18:00, moon otherwise. */
export function periodIcon(hour: number): 'sun' | 'moon' {
  const h = ((hour % 24) + 24) % 24
  return h >= 6 && h < 18 ? 'sun' : 'moon'
}
