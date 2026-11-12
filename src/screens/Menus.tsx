import { useState } from 'preact/hooks'
import { playTap, speak, unlockAudio } from '../audio.ts'
import {
  AlbumIcon,
  Avatar,
  EarIcon,
  EyeIcon,
  HandsIcon,
  NumbersIcon,
  ParentIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  StarIcon,
  StickerArt,
} from '../components/Art.tsx'
import { GAME_MODES, LEVELS, type LevelId, type Mode } from '../logic/levels.ts'
import { STICKERS } from '../logic/stickers.ts'
import { useStore } from '../store.tsx'

export function Welcome({ onStart }: { onStart: () => void }) {
  const { active } = useStore()
  return (
    <section className="screen center-screen welcome" data-testid="welcome">
      <div className="logo-lockup">
        <p className="eyebrow">Die Uhr lernen</p>
        <h1>TickTack</h1>
      </div>
      <div className="welcome-clock" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="welcome-face">
          <circle cx="100" cy="100" r="96" fill="#ffc53d" />
          <circle cx="100" cy="100" r="86" fill="#fffaf2" />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
            const angle = (n / 12) * Math.PI * 2
            return (
              <text
                key={n}
                x={100 + Math.sin(angle) * 66}
                y={100 - Math.cos(angle) * 66}
                textAnchor="middle"
                dominantBaseline="central"
                className="hour-num"
              >
                {n}
              </text>
            )
          })}
          <g className="welcome-minute">
            <line x1="100" y1="108" x2="100" y2="28" stroke="#1f6feb" strokeWidth="6" strokeLinecap="round" />
          </g>
          <g className="welcome-hour">
            <line x1="100" y1="108" x2="100" y2="58" stroke="#ef3d5a" strokeWidth="10" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="100" r="8" fill="#ffc53d" stroke="#1c2742" strokeWidth="3" />
        </svg>
      </div>
      <button
        type="button"
        className="btn btn-green btn-huge"
        data-testid="start"
        onClick={() => {
          unlockAudio()
          speak('Hallo! Lass uns die Uhr lernen.', active.settings)
          onStart()
        }}
      >
        Los geht's
      </button>
    </section>
  )
}

export function Profiles({ onChoose, onParent }: { onChoose: (id: string) => void; onParent: () => void }) {
  const { profiles, addProfile, renameProfile } = useStore()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  return (
    <section className="screen" data-testid="profiles">
      <header className="topbar">
        <span className="icon-spacer" />
        <strong className="top-title">Wer spielt?</strong>
        <button type="button" className="icon-btn" data-testid="parent" aria-label="Eltern" onClick={onParent}>
          <ParentIcon />
        </button>
      </header>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <div key={profile.id} className="profile-card">
            <button
              type="button"
              className="avatar-btn"
              data-testid="profile"
              data-name={profile.name}
              onClick={() => onChoose(profile.id)}
            >
              <Avatar id={profile.avatar} />
              <span>{profile.name}</span>
            </button>
            <button
              type="button"
              className="icon-btn tiny"
              aria-label={`${profile.name} umbenennen`}
              onClick={() => {
                setEditing(profile.id)
                setDraft(profile.name)
              }}
            >
              <PencilIcon />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="avatar-btn add"
          onClick={() => {
            const created = addProfile('Kind')
            setEditing(created.id)
            setDraft('Kind')
          }}
        >
          <PlusIcon />
          <span>Neu</span>
        </button>
      </div>
      {editing && (
        <div className="modal">
          <form
            className="card rename"
            onSubmit={(event) => {
              event.preventDefault()
              renameProfile(editing, draft)
              setEditing(null)
            }}
          >
            <label className="field">
              Name
              <input value={draft} maxLength={16} onInput={(event) => setDraft(event.currentTarget.value)} />
            </label>
            <button type="submit" className="btn btn-green">
              Fertig
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

const MODE_ICON = {
  hear: EarIcon,
  read: EyeIcon,
  d2a: NumbersIcon,
  a2d: HandsIcon,
} as const

export function Home({
  onMode,
  onFree,
  onAlbum,
  onParent,
}: {
  onMode: (mode: Exclude<Mode, 'free'>) => void
  onFree: () => void
  onAlbum: () => void
  onParent: () => void
}) {
  const { active, updateActive } = useStore()
  const stat = active.stats[active.selectedLevel] ?? { correct: 0, attempts: 0 }
  const level = LEVELS.find((item) => item.id === active.selectedLevel) ?? LEVELS[0]

  return (
    <section className="screen" data-testid="home">
      <header className="topbar">
        <div className="who">
          <Avatar id={active.avatar} size={64} />
          <div>
            <strong>{active.name}</strong>
            <span className="stars">
              <StarIcon /> {active.stars}
            </span>
          </div>
        </div>
        <button type="button" className="icon-btn" data-testid="album" aria-label="Stickeralbum" onClick={onAlbum}>
          <AlbumIcon />
        </button>
        <button type="button" className="icon-btn" data-testid="parent" aria-label="Eltern" onClick={onParent}>
          <ParentIcon />
        </button>
      </header>

      <div className="home-grid">
        <div className="card level-card">
          <p className="eyebrow">Level</p>
          <h2>{level.title}</h2>
          <div className="level-row">
            {LEVELS.map((item) => {
              const open = item.id <= active.unlockedLevel
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`level-pip${open ? ' open' : ' locked'}${item.id === active.selectedLevel ? ' current' : ''}`}
                  data-testid={`level-${item.id}`}
                  aria-label={item.title}
                  onClick={() => {
                    if (!open) {
                      speak('Dieses Level ist noch zu.', active.settings)
                      return
                    }
                    updateActive((profile) => ({ ...profile, selectedLevel: item.id as LevelId }))
                    speak(item.title, active.settings)
                  }}
                >
                  <span>{item.id}</span>
                  <small>{item.short}</small>
                </button>
              )
            })}
          </div>
          <p className="progress-note">
            {stat.correct} richtig · {stat.attempts} von 10
            {active.unlockedLevel < 6 && active.selectedLevel === active.unlockedLevel ? ' bis zum nächsten Level' : ''}
          </p>
        </div>

        <div className="mode-grid">
          {GAME_MODES.map((item) => {
            const Icon = MODE_ICON[item.id]
            return (
              <button
                key={item.id}
                type="button"
                className={`mode-card mode-${item.id}`}
                data-testid={`mode-${item.id}`}
                onClick={() => {
                  playTap()
                  onMode(item.id)
                }}
              >
                <Icon />
                <span>{item.title}</span>
              </button>
            )
          })}
          <button type="button" className="mode-card mode-free" data-testid="mode-free" onClick={onFree}>
            <PlayIcon />
            <span>Freies Spielen</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export function Album({ onExit }: { onExit: () => void }) {
  const { active } = useStore()
  const counts = new Map<string, number>()
  for (const id of active.stickers) counts.set(id, (counts.get(id) ?? 0) + 1)

  return (
    <section className="screen" data-testid="album-screen">
      <header className="topbar">
        <button type="button" className="icon-btn" data-testid="back" aria-label="Zurück" onClick={onExit}>
          <svg viewBox="0 0 48 48" className="ico" aria-hidden="true">
            <path d="M30 8 L14 24 L30 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </button>
        <strong className="top-title">Stickeralbum</strong>
        <span className="icon-spacer" />
      </header>
      {active.stickers.length === 0 && <p className="empty-note">Spiel eine Runde, dann gibt es einen Sticker.</p>}
      <div className="album-grid">
        {STICKERS.map((sticker) => {
          const count = counts.get(sticker.id) ?? 0
          return (
            <div key={sticker.id} className="album-slot">
              <StickerArt id={sticker.id} locked={count === 0} />
              {count > 1 && <span className="count">{count}</span>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function RoundEnd({
  stars,
  correct,
  stickerId,
  unlocked,
  onAgain,
  onDone,
}: {
  stars: number
  correct: number
  stickerId: string
  unlocked: boolean
  onAgain: () => void
  onDone: () => void
}) {
  return (
    <section className="screen center-screen" data-testid="round-end">
      <p className="eyebrow">Runde geschafft</p>
      <h1 className="end-title">Toll gemacht!</h1>
      <p className="end-score">
        <StarIcon /> {stars} Sterne · {correct} von 5
      </p>
      <div className="sticker-pop">
        <StickerArt id={stickerId} />
      </div>
      <p>Neuer Sticker</p>
      {unlocked && <p className="banner good">Neues Level ist offen!</p>}
      <div className="end-actions">
        <button type="button" className="btn btn-green" onClick={onAgain}>
          Nochmal
        </button>
        <button type="button" className="btn btn-white" data-testid="done" onClick={onDone}>
          Fertig
        </button>
      </div>
    </section>
  )
}
