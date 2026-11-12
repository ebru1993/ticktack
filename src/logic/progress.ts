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
  speechRate: 0.9,
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

export function starsForAttempt(attempt: 1 | 2): number {
  return attempt === 1 ? 2 : 1
}
