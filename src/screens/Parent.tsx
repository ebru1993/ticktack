import { useEffect, useRef, useState } from 'preact/hooks'
import { playTap, speak } from '../audio.ts'
import { ANIMALS, Avatar, BackIcon } from '../components/Art.tsx'
import { LEVELS, type LevelId } from '../logic/levels.ts'
import { FIXED_SPEECH } from '../logic/phrases.ts'
import { useStore } from '../store.tsx'

const QUESTIONS: [string, number][] = [
  ['3 + 2', 5],
  ['4 + 3', 7],
  ['6 + 2', 8],
  ['5 + 4', 9],
  ['8 - 3', 5],
  ['9 - 2', 7],
  ['2 + 6', 8],
  ['7 - 4', 3],
]

export function ParentScreen({ onExit }: { onExit: () => void }) {
  const { active, profiles, updateActive, renameProfile, setAvatar, deleteProfile, addProfile } = useStore()
  const [held, setHeld] = useState(0)
  const [stage, setStage] = useState<'hold' | 'math' | 'panel'>('hold')
  const [question, setQuestion] = useState(QUESTIONS[0])
  const [shake, setShake] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [draft, setDraft] = useState(active.name)
  const frame = useRef(0)
  const started = useRef(0)

  useEffect(() => {
    setDraft(active.name)
  }, [active.id, active.name])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function pointerDown(event: PointerEvent) {
    if (stage !== 'hold') return
    ;(event.currentTarget as Element).setPointerCapture?.(event.pointerId)
    started.current = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started.current) / 3000)
      setHeld(progress)
      if (progress >= 1) {
        setQuestion(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)])
        setStage('math')
        return
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  function pointerUp() {
    cancelAnimationFrame(frame.current)
    if (stage === 'hold') setHeld(0)
  }

  function answer(value: number) {
    if (value === question[1]) {
      playTap()
      setStage('panel')
      return
    }
    setShake(true)
    window.setTimeout(() => setShake(false), 400)
  }

  if (stage !== 'panel') {
    return (
      <section className="screen center-screen">
        <header className="topbar">
          <button type="button" className="icon-btn" data-testid="back" aria-label="Zurück" onClick={onExit}>
            <BackIcon />
          </button>
          <strong className="top-title">Eltern</strong>
          <span className="icon-spacer" />
        </header>
        {stage === 'hold' ? (
          <button
            type="button"
            className="hold"
            data-testid="parent-hold"
            onPointerDown={pointerDown}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
          >
            <span className="hold-ring" style={{ ['--p' as string]: String(held) }} />
            <span>3 Sekunden halten</span>
          </button>
        ) : (
          <div className={`math${shake ? ' shake' : ''}`} data-testid="parent-math">
            <p className="math-q">Was ist {question[0]}?</p>
            <div className="keypad">
              {Array.from({ length: 10 }, (_, n) => (
                <button key={n} type="button" className="key" data-testid={`key-${n}`} onClick={() => answer(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="screen parent-screen" data-testid="parent-panel">
      <header className="topbar">
        <button type="button" className="icon-btn" data-testid="back" aria-label="Zurück" onClick={onExit}>
          <BackIcon />
        </button>
        <strong className="top-title">{active.name}</strong>
        <span className="icon-spacer" />
      </header>
      <div className="parent-grid">
        <article className="card">
          <h2>Level öffnen</h2>
          <p>Tippe ein Level an. Alles bis dorthin ist offen.</p>
          <div className="level-row">
            {LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                className={`level-pip${active.unlockedLevel >= level.id ? ' open' : ''}${active.unlockedLevel === level.id ? ' current' : ''}`}
                onClick={() =>
                  updateActive((profile) => ({
                    ...profile,
                    unlockedLevel: level.id,
                    selectedLevel: level.id,
                  }))
                }
              >
                {level.id}
                <small>{level.short}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Uhr</h2>
          <label className="switch-row">
            <input
              type="checkbox"
              checked={active.settings.minuteMarkers}
              onChange={(event) =>
                updateActive((profile) => ({
                  ...profile,
                  settings: { ...profile.settings, minuteMarkers: event.currentTarget.checked },
                }))
              }
            />
            <span>Minuten-Zahlen (5, 10, 15…)</span>
          </label>
          <label className="switch-row">
            <input
              type="checkbox"
              checked={active.settings.independentHands}
              onChange={(event) =>
                updateActive((profile) => ({
                  ...profile,
                  settings: { ...profile.settings, independentHands: event.currentTarget.checked },
                }))
              }
            />
            <span>Zeiger getrennt drehen</span>
          </label>
        </article>

        <article className="card">
          <h2>Stimme</h2>
          <p>Die Ansagen sind fest aufgenommen und funktionieren auch ohne Internet.</p>
          <div className="rate-row">
            {[
              ['Langsam', 0.85],
              ['Normal', 1],
              ['Schnell', 1.15],
            ].map(([label, rate]) => (
              <button
                key={label}
                type="button"
                className={`btn btn-white${active.settings.speechRate === rate ? ' is-on' : ''}`}
                onClick={() =>
                  updateActive((profile) => ({
                    ...profile,
                    settings: { ...profile.settings, speechRate: Number(rate) },
                  }))
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-blue"
            onClick={() => speak(FIXED_SPEECH.hello, active.settings)}
          >
            Stimme testen
          </button>
        </article>

        <article className="card">
          <h2>Kinder</h2>
          <label className="field">
            Name von {active.name}
            <input
              value={draft}
              maxLength={16}
              onInput={(event) => setDraft(event.currentTarget.value)}
            />
          </label>
          <button type="button" className="btn btn-white" onClick={() => renameProfile(active.id, draft)}>
            Name speichern
          </button>
          <p className="eyebrow">Tier</p>
          <div className="animal-grid compact" role="listbox" aria-label="Tier">
            {ANIMALS.map((animal) => (
              <button
                key={animal.id}
                type="button"
                className={`animal-pick${active.avatar === animal.id ? ' is-on' : ''}`}
                aria-label={animal.name}
                aria-pressed={active.avatar === animal.id}
                onClick={() => setAvatar(active.id, animal.id)}
              >
                <Avatar id={animal.id} size={64} />
                <span>{animal.name}</span>
              </button>
            ))}
          </div>
          <div className="profile-edit-list">
            {profiles.map((profile) => (
              <span key={profile.id} className="chip">
                {profile.name}
                {profiles.length > 1 && (
                  <button type="button" onClick={() => deleteProfile(profile.id)} aria-label={`${profile.name} löschen`}>
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-white" onClick={() => addProfile('Kind')}>
            Kind hinzufügen
          </button>
        </article>

        <article className="card">
          <h2>Fortschritt</h2>
          <p>
            {active.stars} Sterne, {active.stickers.length} Sticker.
          </p>
          {confirmReset ? (
            <div className="confirm">
              <p>Sterne, Sticker und Level von {active.name} löschen?</p>
              <button
                type="button"
                className="btn btn-coral"
                onClick={() => {
                  updateActive((profile) => ({
                    ...profile,
                    stars: 0,
                    stickers: [],
                    unlockedLevel: 1 as LevelId,
                    selectedLevel: 1,
                    stats: {},
                  }))
                  setConfirmReset(false)
                }}
              >
                Löschen
              </button>
              <button type="button" className="btn btn-white" onClick={() => setConfirmReset(false)}>
                Abbrechen
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-coral" onClick={() => setConfirmReset(true)}>
              Fortschritt zurücksetzen
            </button>
          )}
        </article>
      </div>
    </section>
  )
}
