/**
 * German clock phrases for children (Hochdeutsch, Swiss spelling with ss).
 *
 * Colloquial rules, hour H and minute M:
 * - 0              → "ein Uhr" / "drei Uhr" / "zwölf Uhr"
 * - 15             → "Viertel nach H"
 * - 30             → "halb H+1"          (3:30 = "halb vier")
 * - 45             → "Viertel vor H+1"
 * - 1–29 (not 15)  → "n nach H"          (3:20 = "zwanzig nach drei")
 * - 31–59 (not 45) → "n vor H+1"         (3:35 = "fünfundzwanzig vor vier")
 *
 * Multiples of 5 omit the word Minuten: "fünf nach drei", "zwanzig nach eins".
 * Other minutes use it: "vierundzwanzig Minuten nach zwei".
 * Never "vor halb" or "nach halb".
 *
 * Official 24-hour form: "sechzehn Uhr fünfunddreissig".
 * "colloquial-period" appends the time of day, e.g. "am Nachmittag".
 */

export type GermanTimeMode = 'colloquial' | 'colloquial-period' | 'official'

const BELOW_20 = [
  'null',
  'ein',
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
] as const

const TENS = ['', '', 'zwanzig', 'dreissig', 'vierzig', 'fünfzig'] as const

/** Cardinal 0–59. One is "ein" (einundzwanzig), not "eins". */
export function cardinal(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 59) {
    throw new Error(`Zahl ausserhalb 0–59: ${n}`)
  }
  if (n < 20) return BELOW_20[n]
  const tens = Math.floor(n / 10)
  const ones = n % 10
  if (ones === 0) return TENS[tens]
  return `${ones === 1 ? 'ein' : BELOW_20[ones]}und${TENS[tens]}`
}

function assertTime(hour: number, minute: number): void {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`Stunde ausserhalb 0–23: ${hour}`)
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`Minute ausserhalb 0–59: ${minute}`)
  }
}

/** 1–12 on the clock face. 0 and 12 both become 12. */
function faceHour(hour: number): number {
  const wrapped = ((hour % 12) + 12) % 12
  return wrapped === 0 ? 12 : wrapped
}

/** "ein Uhr" but "halb eins" / "Viertel nach eins". */
function hourLabel(hour: number, kind: 'uhr' | 'nach'): string {
  const face = faceHour(hour)
  if (face === 12) return 'zwölf'
  if (face === 1) return kind === 'uhr' ? 'ein' : 'eins'
  return cardinal(face)
}

/** Count of minutes inside a phrase. Multiples of 5 stay short: "fünf", "zehn". */
function fragment(n: number): string {
  if (n === 1) return 'eine Minute'
  if (n % 5 === 0) return cardinal(n)
  return `${cardinal(n)} Minuten`
}

export function dayPeriod(hour: number): string {
  assertTime(hour, 0)
  if (hour < 5 || hour >= 22) return 'in der Nacht'
  if (hour < 11) return 'am Morgen'
  if (hour < 12) return 'am Vormittag'
  if (hour < 13) return 'am Mittag'
  return hour < 18 ? 'am Nachmittag' : 'am Abend'
}

function colloquial(hour: number, minute: number): string {
  const current = hourLabel(hour, 'nach')
  const currentUhr = hourLabel(hour, 'uhr')
  const next = hourLabel(hour + 1, 'nach')
  if (minute === 0) return `${currentUhr} Uhr`
  if (minute === 15) return `Viertel nach ${current}`
  if (minute === 30) return `halb ${next}`
  if (minute === 45) return `Viertel vor ${next}`
  if (minute < 30) return `${fragment(minute)} nach ${current}`
  return `${fragment(60 - minute)} vor ${next}`
}

function official(hour: number, minute: number): string {
  const h = hour === 0 ? 'null' : hour === 1 ? 'ein' : cardinal(hour)
  if (minute === 0) return `${h} Uhr`
  const m = minute === 1 ? 'eins' : cardinal(minute)
  return `${h} Uhr ${m}`
}

/** Pieces for official 24-hour speech, so audio can play them in sequence. */
export function officialParts(hour: number, minute: number): string[] {
  assertTime(hour, minute)
  const h = hour === 0 ? 'null' : hour === 1 ? 'ein' : cardinal(hour)
  if (minute === 0) return [h, 'Uhr']
  const m = minute === 1 ? 'eins' : cardinal(minute)
  return [h, 'Uhr', m]
}

export function timeToGermanWords(hour: number, minute: number, mode: GermanTimeMode): string {
  assertTime(hour, minute)
  if (mode === 'official') return official(hour, minute)
  const phrase = colloquial(hour, minute)
  if (mode === 'colloquial-period') return `${phrase} ${dayPeriod(hour)}`
  return phrase
}

/** What the app says for a time at this level. Level 6 adds the time of day and the 24-hour form. */
export function spokenTime(hour: number, minute: number, level: number): string {
  if (level >= 6) {
    return `${timeToGermanWords(hour, minute, 'colloquial-period')}. ${timeToGermanWords(hour, minute, 'official')}.`
  }
  return timeToGermanWords(hour, minute, 'colloquial')
}
