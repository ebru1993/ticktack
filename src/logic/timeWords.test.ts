import { describe, expect, it } from 'vitest'
import { dayPeriod, spokenTime, timeToGermanWords } from './timeWords.ts'

const HOUR3 = [
  'drei Uhr',
  'eine Minute nach drei',
  'zwei Minuten nach drei',
  'drei Minuten nach drei',
  'vier Minuten nach drei',
  'fünf nach drei',
  'sechs Minuten nach drei',
  'sieben Minuten nach drei',
  'acht Minuten nach drei',
  'neun Minuten nach drei',
  'zehn nach drei',
  'elf Minuten nach drei',
  'zwölf Minuten nach drei',
  'dreizehn Minuten nach drei',
  'vierzehn Minuten nach drei',
  'Viertel nach drei',
  'sechzehn Minuten nach drei',
  'siebzehn Minuten nach drei',
  'achtzehn Minuten nach drei',
  'neunzehn Minuten nach drei',
  'zehn vor halb vier',
  'neun Minuten vor halb vier',
  'acht Minuten vor halb vier',
  'sieben Minuten vor halb vier',
  'sechs Minuten vor halb vier',
  'fünf vor halb vier',
  'vier Minuten vor halb vier',
  'drei Minuten vor halb vier',
  'zwei Minuten vor halb vier',
  'eine Minute vor halb vier',
  'halb vier',
  'eine Minute nach halb vier',
  'zwei Minuten nach halb vier',
  'drei Minuten nach halb vier',
  'vier Minuten nach halb vier',
  'fünf nach halb vier',
  'sechs Minuten nach halb vier',
  'sieben Minuten nach halb vier',
  'acht Minuten nach halb vier',
  'neun Minuten nach halb vier',
  'zwanzig vor vier',
  'neunzehn Minuten vor vier',
  'achtzehn Minuten vor vier',
  'siebzehn Minuten vor vier',
  'sechzehn Minuten vor vier',
  'Viertel vor vier',
  'vierzehn Minuten vor vier',
  'dreizehn Minuten vor vier',
  'zwölf Minuten vor vier',
  'elf Minuten vor vier',
  'zehn vor vier',
  'neun Minuten vor vier',
  'acht Minuten vor vier',
  'sieben Minuten vor vier',
  'sechs Minuten vor vier',
  'fünf vor vier',
  'vier Minuten vor vier',
  'drei Minuten vor vier',
  'zwei Minuten vor vier',
  'eine Minute vor vier',
]

const MINUTE_WORD = [
  '',
  'eins',
  'zwei',
  'drei',
  'vier',
  'fünf',
  'sechs',
  'sieben',
  'acht',
  'neun',
  'zehn',
  'elf',
  'zwölf',
  'dreizehn',
  'vierzehn',
  'fünfzehn',
  'sechzehn',
  'siebzehn',
  'achtzehn',
  'neunzehn',
  'zwanzig',
  'einundzwanzig',
  'zweiundzwanzig',
  'dreiundzwanzig',
  'vierundzwanzig',
  'fünfundzwanzig',
  'sechsundzwanzig',
  'siebenundzwanzig',
  'achtundzwanzig',
  'neunundzwanzig',
  'dreissig',
  'einunddreissig',
  'zweiunddreissig',
  'dreiunddreissig',
  'vierunddreissig',
  'fünfunddreissig',
  'sechsunddreissig',
  'siebenunddreissig',
  'achtunddreissig',
  'neununddreissig',
  'vierzig',
  'einundvierzig',
  'zweiundvierzig',
  'dreiundvierzig',
  'vierundvierzig',
  'fünfundvierzig',
  'sechsundvierzig',
  'siebenundvierzig',
  'achtundvierzig',
  'neunundvierzig',
  'fünfzig',
  'einundfünfzig',
  'zweiundfünfzig',
  'dreiundfünfzig',
  'vierundfünfzig',
  'fünfundfünfzig',
  'sechsundfünfzig',
  'siebenundfünfzig',
  'achtundfünfzig',
  'neunundfünfzig',
]

describe('timeToGermanWords colloquial, jede Minute', () => {
  it('deckt alle 60 Minuten der Stunde drei ab', () => {
    expect(HOUR3).toHaveLength(60)
    for (let minute = 0; minute < 60; minute++) {
      expect(timeToGermanWords(3, minute, 'colloquial'), `3:${minute}`).toBe(HOUR3[minute])
    }
  })

  it('spricht die Beispiele aus der Aufgabe', () => {
    expect(timeToGermanWords(3, 0, 'colloquial')).toBe('drei Uhr')
    expect(timeToGermanWords(3, 30, 'colloquial')).toBe('halb vier')
    expect(timeToGermanWords(3, 15, 'colloquial')).toBe('Viertel nach drei')
    expect(timeToGermanWords(3, 45, 'colloquial')).toBe('Viertel vor vier')
    expect(timeToGermanWords(3, 5, 'colloquial')).toBe('fünf nach drei')
    expect(timeToGermanWords(3, 20, 'colloquial')).toBe('zehn vor halb vier')
    expect(timeToGermanWords(3, 35, 'colloquial')).toBe('fünf nach halb vier')
    expect(timeToGermanWords(16, 35, 'official')).toBe('sechzehn Uhr fünfunddreissig')
    expect(timeToGermanWords(16, 35, 'colloquial-period')).toBe('fünf nach halb fünf am Nachmittag')
  })
})

describe('timeToGermanWords official, jede Minute', () => {
  it('spricht sechzehn Uhr mit jeder Minute', () => {
    for (let minute = 0; minute < 60; minute++) {
      const expected = minute === 0 ? 'sechzehn Uhr' : `sechzehn Uhr ${MINUTE_WORD[minute]}`
      expect(timeToGermanWords(16, minute, 'official'), `16:${minute}`).toBe(expected)
    }
  })

  it('spricht null Uhr, ein Uhr und die späten Stunden', () => {
    expect(timeToGermanWords(0, 0, 'official')).toBe('null Uhr')
    expect(timeToGermanWords(0, 5, 'official')).toBe('null Uhr fünf')
    expect(timeToGermanWords(1, 0, 'official')).toBe('ein Uhr')
    expect(timeToGermanWords(1, 1, 'official')).toBe('ein Uhr eins')
    expect(timeToGermanWords(13, 0, 'official')).toBe('dreizehn Uhr')
    expect(timeToGermanWords(23, 59, 'official')).toBe('dreiundzwanzig Uhr neunundfünfzig')
  })
})

describe('Uhrzeiten über zwölf und Mitternacht', () => {
  const cases: [number, number, string][] = [
    [0, 0, 'zwölf Uhr'],
    [0, 15, 'Viertel nach zwölf'],
    [0, 30, 'halb eins'],
    [0, 45, 'Viertel vor eins'],
    [0, 20, 'zehn vor halb eins'],
    [0, 35, 'fünf nach halb eins'],
    [0, 40, 'zwanzig vor eins'],
    [0, 55, 'fünf vor eins'],
    [1, 0, 'ein Uhr'],
    [1, 5, 'fünf nach eins'],
    [1, 30, 'halb zwei'],
    [12, 0, 'zwölf Uhr'],
    [12, 1, 'eine Minute nach zwölf'],
    [12, 15, 'Viertel nach zwölf'],
    [12, 20, 'zehn vor halb eins'],
    [12, 30, 'halb eins'],
    [12, 35, 'fünf nach halb eins'],
    [12, 40, 'zwanzig vor eins'],
    [12, 45, 'Viertel vor eins'],
    [12, 59, 'eine Minute vor eins'],
    [11, 30, 'halb zwölf'],
    [11, 20, 'zehn vor halb zwölf'],
    [11, 45, 'Viertel vor zwölf'],
    [15, 0, 'drei Uhr'],
    [15, 30, 'halb vier'],
    [23, 20, 'zehn vor halb zwölf'],
    [23, 35, 'fünf nach halb zwölf'],
    [23, 45, 'Viertel vor zwölf'],
    [23, 59, 'eine Minute vor zwölf'],
    [4, 40, 'zwanzig vor fünf'],
    [7, 7, 'sieben Minuten nach sieben'],
  ]

  it.each(cases)('%i:%i → %s', (hour, minute, phrase) => {
    expect(timeToGermanWords(hour, minute, 'colloquial')).toBe(phrase)
  })

  it('wiederholt die 12-Stunden-Form für jede Stunde und jede Minute', () => {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        const phrase = timeToGermanWords(hour, minute, 'colloquial')
        expect(phrase).toBe(timeToGermanWords(hour % 12, minute, 'colloquial'))
        expect(phrase.includes('ß'), phrase).toBe(false)
      }
    }
  })
})

describe('Tageszeit', () => {
  it('hängt die passende Tageszeit an', () => {
    expect(timeToGermanWords(3, 0, 'colloquial-period')).toBe('drei Uhr in der Nacht')
    expect(timeToGermanWords(8, 15, 'colloquial-period')).toBe('Viertel nach acht am Morgen')
    expect(timeToGermanWords(11, 0, 'colloquial-period')).toBe('elf Uhr am Vormittag')
    expect(timeToGermanWords(12, 0, 'colloquial-period')).toBe('zwölf Uhr am Mittag')
    expect(timeToGermanWords(16, 35, 'colloquial-period')).toBe('fünf nach halb fünf am Nachmittag')
    expect(timeToGermanWords(18, 45, 'colloquial-period')).toBe('Viertel vor sieben am Abend')
    expect(timeToGermanWords(21, 0, 'colloquial-period')).toBe('neun Uhr am Abend')
    expect(timeToGermanWords(22, 30, 'colloquial-period')).toBe('halb elf in der Nacht')
  })

  it('nennt für jede Stunde genau eine Tageszeit', () => {
    const allowed = ['in der Nacht', 'am Morgen', 'am Vormittag', 'am Mittag', 'am Nachmittag', 'am Abend']
    for (let hour = 0; hour < 24; hour++) {
      expect(allowed).toContain(dayPeriod(hour))
      const phrase = timeToGermanWords(hour, 10, 'colloquial-period')
      expect(phrase.endsWith(dayPeriod(hour))).toBe(true)
      expect(phrase.includes('ß')).toBe(false)
    }
  })
})

describe('alle Modi, alle Minuten', () => {
  it('liefert für jede Minute einen Satz ohne ß', () => {
    for (let minute = 0; minute < 60; minute++) {
      for (const mode of ['colloquial', 'colloquial-period', 'official'] as const) {
        const phrase = timeToGermanWords(4, minute, mode)
        expect(phrase.length).toBeGreaterThan(0)
        expect(phrase.includes('ß'), `${mode} ${minute} ${phrase}`).toBe(false)
        if (mode === 'official') expect(phrase).toContain('Uhr')
        if (mode === 'colloquial' && minute === 0) expect(phrase.endsWith('Uhr')).toBe(true)
        if (mode === 'colloquial' && minute === 15) expect(phrase.startsWith('Viertel nach')).toBe(true)
        if (mode === 'colloquial' && minute === 30) expect(phrase.startsWith('halb')).toBe(true)
        if (mode === 'colloquial' && minute === 45) expect(phrase.startsWith('Viertel vor')).toBe(true)
      }
    }
  })

  it('spricht Level 6 doppelt', () => {
    expect(spokenTime(16, 35, 6)).toBe(
      'fünf nach halb fünf am Nachmittag. sechzehn Uhr fünfunddreissig.',
    )
    expect(spokenTime(3, 0, 1)).toBe('drei Uhr')
  })
})
