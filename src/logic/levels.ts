export type LevelId = 1 | 2 | 3 | 4 | 5 | 6

/** Minute grid for a level. Level 6 stays on 5-minute steps and uses afternoon/evening hours. */
export function levelStep(level: LevelId): number {
  switch (level) {
    case 1:
      return 60
    case 2:
      return 30
    case 3:
      return 15
    case 4:
      return 5
    case 5:
      return 1
    case 6:
      return 5
  }
}

export type Mode = 'hear' | 'read' | 'd2a' | 'a2d' | 'free'

export type Time = { hour: number; minute: number }

export type Task = {
  target: Time
  options: Time[]
}

export const LEVELS: { id: LevelId; title: string; short: string }[] = [
  { id: 1, title: 'Volle Stunden', short: 'Stunden' },
  { id: 2, title: 'Halbe Stunden', short: 'Halb' },
  { id: 3, title: 'Viertelstunden', short: 'Viertel' },
  { id: 4, title: '5-Minuten-Schritte', short: '5 Min' },
  { id: 5, title: 'Genaue Minuten', short: 'Minuten' },
  { id: 6, title: '24-Stunden-Zeit', short: '24 Std' },
]

export const GAME_MODES: { id: Exclude<Mode, 'free'>; title: string; short: string }[] = [
  { id: 'hear', title: 'Hören & Stellen', short: 'Hören' },
  { id: 'read', title: 'Uhr lesen', short: 'Lesen' },
  { id: 'd2a', title: 'Digital zu Analog', short: 'Zahlen' },
  { id: 'a2d', title: 'Analog zu Digital', short: 'Zeiger' },
]

function sameTime(a: Time, b: Time): boolean {
  return a.hour === b.hour && a.minute === b.minute
}

export function randomTime(level: LevelId, rng: () => number = Math.random): Time {
  const step = levelStep(level)
  const slots = step >= 60 ? 1 : Math.floor(60 / step)
  const minute = step >= 60 ? 0 : Math.floor(rng() * slots) * step
  if (level === 6) {
    return { hour: 12 + Math.floor(rng() * 12), minute }
  }
  return { hour: 1 + Math.floor(rng() * 12), minute }
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

export function makeTask(level: LevelId, mode: Mode, rng: () => number = Math.random): Task {
  const target = randomTime(level, rng)
  if (mode !== 'read') return { target, options: [] }
  const options: Time[] = [target]
  if (level === 6) {
    const twinHour = target.hour === 12 ? 0 : target.hour - 12
    options.push({ hour: twinHour, minute: target.minute })
  }
  let guard = 0
  while (options.length < 4 && guard < 50) {
    guard += 1
    const candidate = randomTime(level, rng)
    if (!options.some((item) => sameTime(item, candidate))) options.push(candidate)
  }
  return { target, options: shuffle(options, rng) }
}

export function makeRound(level: LevelId, mode: Mode, rng: () => number = Math.random): Task[] {
  return Array.from({ length: 5 }, () => makeTask(level, mode, rng))
}
