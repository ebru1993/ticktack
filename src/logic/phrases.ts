import type { LevelId, Mode, Time } from './levels.ts'
import { spokenTime } from './timeWords.ts'

export function taskSpeech(mode: Mode, level: LevelId, time: Time): string {
  const said = spokenTime(time.hour, time.minute, level)
  switch (mode) {
    case 'hear':
      return level >= 6 ? `Stell die Zeiger. ${said}` : `Stell die Zeiger auf ${said}.`
    case 'read':
      return 'Welche Zeit zeigt die Uhr? Tippe auf eine Antwort.'
    case 'd2a':
      return 'Stell die Zeiger auf die Digitaluhr.'
    case 'a2d':
      return level >= 6
        ? 'Welche Zahlen zeigt die Uhr? Achte auf Sonne oder Mond.'
        : 'Welche Zahlen zeigt die Uhr?'
    case 'free':
      return said
  }
}

export function helpSpeech(mode: Mode, level: LevelId, time: Time): string {
  if (mode === 'read') return taskSpeech(mode, level, time)
  return spokenTime(time.hour, time.minute, level)
}
