import { createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import type { Profile } from './logic/progress.ts'
import { createProfile, loadSave, persist, type SaveData } from './storage.ts'

type Store = {
  profiles: Profile[]
  active: Profile
  setActive: (id: string) => void
  updateActive: (fn: (profile: Profile) => Profile) => void
  updateProfile: (id: string, fn: (profile: Profile) => Profile) => void
  addProfile: (name?: string) => Profile
  renameProfile: (id: string, name: string) => void
  deleteProfile: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ComponentChildren }) {
  const [data, setData] = useState<SaveData>(loadSave)

  function commit(next: SaveData): void {
    setData(next)
    persist(next)
  }

  function updateProfile(id: string, fn: (profile: Profile) => Profile): void {
    setData((current) => {
      const next = { ...current, profiles: current.profiles.map((profile) => (profile.id === id ? fn(profile) : profile)) }
      persist(next)
      return next
    })
  }

  const active = data.profiles.find((profile) => profile.id === data.activeId) ?? data.profiles[0]

  const store: Store = {
    profiles: data.profiles,
    active,
    setActive(id) {
      setData((current) => {
        const next = { ...current, activeId: current.profiles.some((profile) => profile.id === id) ? id : current.activeId }
        persist(next)
        return next
      })
    },
    updateActive(fn) {
      updateProfile(active.id, fn)
    },
    updateProfile,
    addProfile(name = 'Kind') {
      const profile = createProfile(name, data.profiles.length)
      commit({ profiles: [...data.profiles, profile], activeId: data.activeId })
      return profile
    },
    renameProfile(id, name) {
      const clean = name.trim().slice(0, 16)
      if (!clean) return
      updateProfile(id, (profile) => ({ ...profile, name: clean }))
    },
    deleteProfile(id) {
      setData((current) => {
        if (current.profiles.length <= 1) return current
        const profiles = current.profiles.filter((profile) => profile.id !== id)
        const next = { profiles, activeId: current.activeId === id ? profiles[0].id : current.activeId }
        persist(next)
        return next
      })
    },
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const store = useContext(Ctx)
  if (!store) throw new Error('Store fehlt')
  return store
}
