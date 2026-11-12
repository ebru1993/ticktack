import type { LevelId } from './levels.ts'

export type Settings = {
  minuteMarkers: boolean
  speechRate: number
  voiceURI: string | null
  independentHands: boolean
}

export type LevelStat = {
  correct: number
  attempts: number
}

export type Profile = {
  id: string
  name: string
  avatar: number
  stars: number
  stickers: string[]
  unlockedLevel: LevelId
  selectedLevel: LevelId
  stats: Partial<Record<LevelId, LevelStat>>
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  minuteMarkers: true,
  speechRate: 1,
  voiceURI: null,
  independentHands: false,
}

export const UNLOCK_WINDOW = 10
export const UNLOCK_CORRECT = 8
export const ROUND_LENGTH = 5

export function emptyStats(): LevelStat {
  return { correct: 0, attempts: 0 }
}

export type RecordOutcome = {
  profile: Profile
  unlocked: boolean
}

/**
 * One finished task. After 10 answers, 8 correct opens the next level.
 * Replaying an earlier level does not skip ahead.
 */
export function recordResult(profile: Profile, level: LevelId, correct: boolean): RecordOutcome {
  const prev = profile.stats[level] ?? emptyStats()
  let correctN = prev.correct + (correct ? 1 : 0)
  let attempts = prev.attempts + 1
  let unlockedLevel = profile.unlockedLevel
  let selectedLevel = profile.selectedLevel
  let unlocked = false
  if (attempts >= UNLOCK_WINDOW) {
    if (correctN >= UNLOCK_CORRECT && unlockedLevel === level && level < 6) {
      unlockedLevel = (level + 1) as LevelId
      selectedLevel = unlockedLevel
      unlocked = true
    }
    correctN = 0
    attempts = 0
  }
  return {
    unlocked,
    profile: {
      ...profile,
      unlockedLevel,
      selectedLevel,
      stats: { ...profile.stats, [level]: { correct: correctN, attempts } },
    },
  }
}

export function awardStars(profile: Profile, stars: number): Profile {
  return { ...profile, stars: profile.stars + stars }
}

export const MAX_ATTEMPTS = 5
/** Show the correct time only once this many attempts have already failed. */
export const REVEAL_AFTER_FAILS = 4

/** Two stars on the first try, one star until the solution is shown, none after that. */
export function starsForAttempt(attempt: number): number {
  if (attempt <= 1) return 2
  if (attempt <= REVEAL_AFTER_FAILS) return 1
  return 0
}
