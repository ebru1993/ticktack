import { describe, expect, it } from 'vitest'
import {
  HOUR_TOLERANCE_DEG,
  applyHour12,
  bumpHour,
  checkAnalog,
  checkDigital,
  cycleMinute,
  dragMinute,
  formatDigital,
  hourHandDegrees,
  periodIcon,
  snapToStep,
} from './clockMath.ts'
import { levelStep, makeRound, makeTask, randomTime } from './levels.ts'
import { recordResult, starsForAttempt, type Profile } from './progress.ts'
import { helpSpeech, taskSpeech } from './phrases.ts'
import { stickerForIndex, STICKERS } from './stickers.ts'

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('snap und Zeiger-Prüfung', () => {
  it('rastet auf den Level-Schritt ein', () => {
    expect(levelStep(1)).toBe(60)
    expect(levelStep(2)).toBe(30)
    expect(levelStep(3)).toBe(15)
    expect(levelStep(4)).toBe(5)
    expect(levelStep(5)).toBe(1)
    expect(levelStep(6)).toBe(5)
    expect(snapToStep(7, 5)).toBe(5)
    expect(snapToStep(8, 5)).toBe(10)
    expect(snapToStep(58, 5)).toBe(0)
    expect(snapToStep(4, 60)).toBe(0)
    expect(snapToStep(50, 60)).toBe(0)
    expect(snapToStep(17, 1)).toBe(17)
  })

  it('verzeiht Minuten nahe am Strich, nicht daneben', () => {
    const near = checkAnalog({ hour: 3, minute: 4, hourAngle: null }, { hour: 3, minute: 0 }, 60)
    expect(near.ok).toBe(true)
    const far = checkAnalog({ hour: 3, minute: 20, hourAngle: null }, { hour: 3, minute: 0 }, 60)
    expect(far.minuteOk).toBe(false)
    expect(far.ok).toBe(false)
    const five = checkAnalog({ hour: 3, minute: 7, hourAngle: null }, { hour: 3, minute: 5 }, 5)
    expect(five.ok).toBe(true)
    const exact = checkAnalog({ hour: 3, minute: 7, hourAngle: null }, { hour: 3, minute: 7 }, 1)
    expect(exact.ok).toBe(true)
    const miss = checkAnalog({ hour: 3, minute: 8, hourAngle: null }, { hour: 3, minute: 7 }, 1)
    expect(miss.ok).toBe(false)
  })

  it('prüft den Stundenzeiger grosszügig zwischen den Zahlen', () => {
    const wrongHour = checkAnalog({ hour: 4, minute: 0, hourAngle: null }, { hour: 3, minute: 0 }, 60)
    expect(wrongHour.minuteOk).toBe(true)
    expect(wrongHour.hourOk).toBe(false)
    const nudged = checkAnalog(
      { hour: 3, minute: 0, hourAngle: hourHandDegrees(3, 0) + HOUR_TOLERANCE_DEG },
      { hour: 3, minute: 0 },
      60,
    )
    expect(nudged.hourOk).toBe(true)
    const tooFar = checkAnalog(
      { hour: 3, minute: 0, hourAngle: hourHandDegrees(3, 0) + HOUR_TOLERANCE_DEG + 1 },
      { hour: 3, minute: 0 },
      60,
    )
    expect(tooFar.hourOk).toBe(false)
    const afternoon = checkAnalog({ hour: 16, minute: 35, hourAngle: null }, { hour: 16, minute: 35 }, 5)
    expect(afternoon.ok).toBe(true)
    const sameHands = checkAnalog({ hour: 4, minute: 35, hourAngle: null }, { hour: 16, minute: 35 }, 5)
    expect(sameHands.ok).toBe(true)
  })

  it('prüft die Digitaluhr mit 24 Stunden streng', () => {
    expect(checkDigital({ hour: 16, minute: 35 }, { hour: 16, minute: 35 }, 5, true).ok).toBe(true)
    expect(checkDigital({ hour: 4, minute: 35 }, { hour: 16, minute: 35 }, 5, true).ok).toBe(false)
    expect(checkDigital({ hour: 4, minute: 0 }, { hour: 16, minute: 0 }, 60, false).ok).toBe(true)
    expect(formatDigital(16, 5, true)).toBe('16:05')
    expect(formatDigital(0, 5, false)).toBe('12:05')
  })
})

describe('Getriebe der Zeiger', () => {
  it('dreht die Stunde mit, wenn die Minute über zwölf gezogen wird', () => {
    expect(dragMinute(3, 55, 2, false)).toEqual({ hour: 4, minute: 2 })
    expect(dragMinute(3, 2, 55, false)).toEqual({ hour: 2, minute: 55 })
    expect(dragMinute(3, 10, 25, false)).toEqual({ hour: 3, minute: 25 })
    expect(dragMinute(12, 50, 5, false)).toEqual({ hour: 1, minute: 5 })
    expect(dragMinute(1, 5, 50, false)).toEqual({ hour: 12, minute: 50 })
    expect(dragMinute(23, 55, 2, true)).toEqual({ hour: 0, minute: 2 })
    expect(dragMinute(0, 2, 55, true)).toEqual({ hour: 23, minute: 55 })
  })

  it('setzt den Stundenzeiger auf 12 bis 23 im 24-Stunden-Level', () => {
    expect(applyHour12(4, true)).toBe(16)
    expect(applyHour12(12, true)).toBe(12)
    expect(applyHour12(11, true)).toBe(23)
    expect(applyHour12(4, false)).toBe(4)
    expect(bumpHour(12, 1, false)).toBe(1)
    expect(bumpHour(1, -1, false)).toBe(12)
    expect(cycleMinute(0, 15, 1)).toBe(15)
    expect(cycleMinute(45, 15, 1)).toBe(0)
    expect(cycleMinute(0, 15, -1)).toBe(45)
    expect(cycleMinute(59, 1, 1)).toBe(0)
  })

  it('zeigt Sonne am Tag und Mond in der Nacht', () => {
    expect(periodIcon(16)).toBe('sun')
    expect(periodIcon(8)).toBe('sun')
    expect(periodIcon(20)).toBe('moon')
    expect(periodIcon(3)).toBe('moon')
  })
})

describe('Zufallszeiten und Aufgaben', () => {
  it('bleibt für jedes Level auf dem richtigen Raster', () => {
    const rng = mulberry32(7)
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      for (let i = 0; i < 30; i++) {
        const time = randomTime(level, rng)
        expect(time.minute % levelStep(level)).toBe(0)
        if (level === 6) {
          expect(time.hour).toBeGreaterThanOrEqual(12)
          expect(time.hour).toBeLessThanOrEqual(23)
        } else {
          expect(time.hour).toBeGreaterThanOrEqual(1)
          expect(time.hour).toBeLessThanOrEqual(12)
        }
      }
    }
  })

  it('baut Lese-Aufgaben mit der richtigen Antwort und Ablenkern', () => {
    const rng = mulberry32(3)
    for (let i = 0; i < 20; i++) {
      const task = makeTask(6, 'read', rng)
      expect(task.options).toHaveLength(4)
      expect(task.options.some((item) => item.hour === task.target.hour && item.minute === task.target.minute)).toBe(
        true,
      )
      const keys = new Set(task.options.map((item) => `${item.hour}:${item.minute}`))
      expect(keys.size).toBe(4)
      const twin = task.target.hour === 12 ? 0 : task.target.hour - 12
      expect(task.options.some((item) => item.hour === twin && item.minute === task.target.minute)).toBe(true)
    }
    const round = makeRound(1, 'hear', mulberry32(1))
    expect(round).toHaveLength(5)
    expect(round.every((task) => task.target.minute === 0)).toBe(true)
    const keys = new Set(round.map((task) => `${task.target.hour}:${task.target.minute}`))
    expect(keys.size).toBe(5)
  })

  it('vermeidet Wiederholungen in einer Runde und gegenüber der vorherigen', () => {
    const rng = mulberry32(99)
    const first = makeRound(4, 'hear', rng)
    const firstKeys = first.map((task) => `${task.target.hour}:${task.target.minute}`)
    expect(new Set(firstKeys).size).toBe(5)
    const second = makeRound(4, 'hear', rng, first.map((task) => task.target))
    const secondKeys = second.map((task) => `${task.target.hour}:${task.target.minute}`)
    expect(new Set(secondKeys).size).toBe(5)
    expect(secondKeys.some((key) => firstKeys.includes(key))).toBe(false)
  })
})

function profile(over: Partial<Profile> = {}): Profile {
  return {
    id: 'p',
    name: 'Kind 1',
    avatar: 0,
    stars: 0,
    stickers: [],
    unlockedLevel: 1,
    selectedLevel: 1,
    stats: {},
    settings: {
      minuteMarkers: true,
      speechRate: 1,
      voiceURI: null,
      independentHands: false,
    },
    ...over,
  }
}

describe('Fortschritt', () => {
  it('öffnet das nächste Level nach 8 von 10', () => {
    let current = profile()
    for (let i = 0; i < 8; i++) current = recordResult(current, 1, true).profile
    for (let i = 0; i < 2; i++) {
      const outcome = recordResult(current, 1, false)
      current = outcome.profile
      if (i === 1) expect(outcome.unlocked).toBe(true)
    }
    expect(current.unlockedLevel).toBe(2)
    expect(current.selectedLevel).toBe(2)
    expect(current.stats[1]).toEqual({ correct: 0, attempts: 0 })
  })

  it('setzt das Fenster zurück, wenn es nicht reicht, und überspringt nichts', () => {
    let current = profile()
    for (let i = 0; i < 7; i++) current = recordResult(current, 1, true).profile
    for (let i = 0; i < 3; i++) current = recordResult(current, 1, false).profile
    expect(current.unlockedLevel).toBe(1)
    expect(current.stats[1]).toEqual({ correct: 0, attempts: 0 })

    current = profile({ unlockedLevel: 3, selectedLevel: 3 })
    for (let i = 0; i < 10; i++) current = recordResult(current, 1, true).profile
    expect(current.unlockedLevel).toBe(3)
  })

  it('vergibt zwei Sterne beim ersten Versuch und danach weniger', () => {
    expect(starsForAttempt(1)).toBe(2)
    expect(starsForAttempt(2)).toBe(1)
    expect(starsForAttempt(3)).toBe(1)
    expect(starsForAttempt(4)).toBe(1)
    expect(starsForAttempt(5)).toBe(0)
  })
})

describe('Ansagen', () => {
  it('sagt die Aufgabe passend zum Modus', () => {
    expect(taskSpeech('hear', 1, { hour: 3, minute: 0 })).toBe('Hör genau zu. Stell die Zeiger auf drei Uhr.')
    expect(taskSpeech('hear', 6, { hour: 16, minute: 35 })).toContain('sechzehn Uhr fünfunddreissig')
    expect(taskSpeech('read', 1, { hour: 2, minute: 0 })).toContain('Tippe auf die richtige Antwort')
    expect(taskSpeech('d2a', 3, { hour: 4, minute: 15 })).toBe(
      'Schau auf die Digitaluhr und stell die Zeiger auf dieselbe Zeit.',
    )
    expect(helpSpeech('d2a', 1, { hour: 4, minute: 0 })).toBe('Stell die Zeiger auf vier Uhr.')
    expect(taskSpeech('a2d', 1, { hour: 4, minute: 0 })).toContain('Analoguhr')
    expect(taskSpeech('a2d', 6, { hour: 18, minute: 0 })).toContain('Mond')
  })

  it('vergibt Sticker der Reihe nach und fängt wieder vorne an', () => {
    expect(STICKERS.length).toBeGreaterThanOrEqual(16)
    expect(stickerForIndex(0)).toBe(STICKERS[0].id)
    expect(stickerForIndex(STICKERS.length)).toBe(STICKERS[0].id)
    expect(new Set(STICKERS.map((item) => item.id)).size).toBe(STICKERS.length)
  })
})
