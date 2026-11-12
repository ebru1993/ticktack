import type { LevelId, Mode, Time } from './levels.ts'
import { dayPeriod, officialParts, spokenTime, timeToGermanWords } from './timeWords.ts'

export function taskSpeech(mode: Mode, level: LevelId, time: Time): string {
  const said = spokenTime(time.hour, time.minute, level)
  switch (mode) {
    case 'hear':
      return `Hör genau zu. Stell die Zeiger auf ${said}.`
    case 'read':
      return 'Welche Zeit zeigt die Uhr? Tippe auf die richtige Antwort.'
    case 'd2a':
      return 'Schau auf die Digitaluhr und stell die Zeiger auf dieselbe Zeit.'
    case 'a2d':
      return level >= 6
        ? 'Welche Zeit zeigt die Uhr? Achte auf Sonne oder Mond, und stell die Zahlen ein.'
        : 'Welche Zeit zeigt die Analoguhr? Stell die Zahlen ein.'
    case 'free':
      return `Es ist ${said}.`
  }
}

export function helpSpeech(mode: Mode, level: LevelId, time: Time): string {
  if (mode === 'read') return taskSpeech(mode, level, time)
  if (mode === 'd2a') return `Stell die Zeiger auf ${spokenTime(time.hour, time.minute, level)}.`
  if (mode === 'a2d') return `Stell die Zahlen auf ${spokenTime(time.hour, time.minute, level)}.`
  if (mode === 'hear') return taskSpeech(mode, level, time)
  return `Es ist ${spokenTime(time.hour, time.minute, level)}.`
}

export function praiseSpeech(level: LevelId, time: Time): string {
  return `Super! Es ist ${spokenTime(time.hour, time.minute, level)}.`
}

export function retrySpeech(hourOk: boolean, minuteOk: boolean): string {
  if (!hourOk && !minuteOk) return 'Das stimmt noch nicht. Versuch es noch einmal.'
  if (!hourOk) return 'Schau noch einmal auf den Stundenzeiger.'
  if (!minuteOk) return 'Schau noch einmal auf den Minutenzeiger.'
  return 'Das stimmt noch nicht. Versuch es noch einmal.'
}

export function hintSpeech(level: LevelId, time: Time): string {
  return `Schau, so sieht die richtige Zeit aus. Es ist ${spokenTime(time.hour, time.minute, level)}. Versuch es noch einmal.`
}

export function revealSpeech(level: LevelId, time: Time): string {
  return `So ist es richtig. Es ist ${spokenTime(time.hour, time.minute, level)}.`
}

export const FIXED_SPEECH = {
  hello: 'Hallo! Lass uns die Uhr lernen.',
  pickAnswer: 'Tippe zuerst auf eine Antwort.',
  lockedLevel: 'Dieses Level ist noch zu.',
  freeIntro: 'Spiel mit der Uhr. Dreh die Zeiger, ich sage dir die Zeit.',
  roundDone: 'Runde geschafft! Ein neuer Sticker für dich.',
  roundDoneUnlock: 'Runde geschafft! Ein neuer Sticker. Neues Level ist offen!',
} as const

/** Audio clips, in order, that speak a time at this level. */
export function timeParts(hour: number, minute: number, level: number): string[] {
  const colloquial = timeToGermanWords(hour, minute, 'colloquial')
  if (level >= 6) {
    return [colloquial, dayPeriod(hour), ...officialParts(hour, minute)]
  }
  return [colloquial]
}

export function taskParts(mode: Mode, level: LevelId, time: Time): string[] {
  const said = timeParts(time.hour, time.minute, level)
  switch (mode) {
    case 'hear':
      return ['Hör genau zu. Stell die Zeiger auf', ...said]
    case 'read':
      return ['Welche Zeit zeigt die Uhr? Tippe auf die richtige Antwort.']
    case 'd2a':
      return ['Schau auf die Digitaluhr und stell die Zeiger auf dieselbe Zeit.']
    case 'a2d':
      return level >= 6
        ? ['Welche Zeit zeigt die Uhr? Achte auf Sonne oder Mond, und stell die Zahlen ein.']
        : ['Welche Zeit zeigt die Analoguhr? Stell die Zahlen ein.']
    case 'free':
      return ['Es ist', ...said]
  }
}

export function helpParts(mode: Mode, level: LevelId, time: Time): string[] {
  const said = timeParts(time.hour, time.minute, level)
  if (mode === 'read') return taskParts(mode, level, time)
  if (mode === 'd2a') return ['Stell die Zeiger auf', ...said]
  if (mode === 'a2d') return ['Stell die Zahlen auf', ...said]
  if (mode === 'hear') return taskParts(mode, level, time)
  return ['Es ist', ...said]
}

export function praiseParts(level: LevelId, time: Time): string[] {
  return ['Super! Es ist', ...timeParts(time.hour, time.minute, level)]
}

export function hintParts(level: LevelId, time: Time): string[] {
  return [
    'Schau, so sieht die richtige Zeit aus. Es ist',
    ...timeParts(time.hour, time.minute, level),
    'Versuch es noch einmal.',
  ]
}

export function revealParts(level: LevelId, time: Time): string[] {
  return ['So ist es richtig. Es ist', ...timeParts(time.hour, time.minute, level)]
}
