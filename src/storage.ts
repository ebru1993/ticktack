import type { LevelId } from './logic/levels.ts'
import { DEFAULT_SETTINGS, type Profile, type Settings } from './logic/progress.ts'

const KEY = 'ticktack-v1'

export type SaveData = {
  profiles: Profile[]
  activeId: string
}

function clampLevel(value: number): LevelId {
  const level = Math.min(6, Math.max(1, Math.round(value))) as LevelId
  return level
}

function settingsOf(raw: Partial<Settings> | undefined): Settings {
  return {
    minuteMarkers: raw?.minuteMarkers ?? DEFAULT_SETTINGS.minuteMarkers,
    speechRate: typeof raw?.speechRate === 'number' ? raw.speechRate : DEFAULT_SETTINGS.speechRate,
    voiceURI: raw?.voiceURI ?? null,
    independentHands: raw?.independentHands ?? false,
  }
}

export function createProfile(name: string, avatar: number): Profile {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `kind-${Math.random().toString(36).slice(2, 10)}`
  return {
    id,
    name,
    avatar,
    stars: 0,
    stickers: [],
    unlockedLevel: 1,
    selectedLevel: 1,
    stats: {},
    settings: { ...DEFAULT_SETTINGS },
  }
}

function normalize(raw: Partial<Profile>): Profile {
  const unlocked = clampLevel(raw.unlockedLevel ?? 1)
  const selected = clampLevel(raw.selectedLevel ?? 1)
  return {
    id: raw.id || createProfile('Kind', 0).id,
    name: (raw.name || 'Kind').slice(0, 16),
    avatar: raw.avatar ?? 0,
    stars: Math.max(0, Math.round(raw.stars ?? 0)),
    stickers: Array.isArray(raw.stickers) ? raw.stickers.filter((id) => typeof id === 'string') : [],
    unlockedLevel: unlocked,
    selectedLevel: selected <= unlocked ? selected : unlocked,
    stats: raw.stats ?? {},
    settings: settingsOf(raw.settings),
  }
}

export function seedProfiles(): Profile[] {
  return [createProfile('Kind 1', 0), createProfile('Kind 2', 1)]
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>
      if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        const profiles = parsed.profiles.map((item) => normalize(item))
        const activeId = profiles.some((item) => item.id === parsed.activeId) ? parsed.activeId! : profiles[0].id
        return { profiles, activeId }
      }
    }
  } catch {
    /* Private mode or a broken save: start fresh in memory. */
  }
  const profiles = seedProfiles()
  const fresh = { profiles, activeId: profiles[0].id }
  persist(fresh)
  return fresh
}

export function persist(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* Keep playing even if the iPad refuses to store. */
  }
}
