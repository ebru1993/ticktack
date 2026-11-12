import { useState } from 'preact/hooks'
import { playTap, speak } from '../audio.ts'
import { AnalogClock } from '../components/AnalogClock.tsx'
import { BackIcon, SpeakerIcon } from '../components/Art.tsx'
import { DigitalClock } from '../components/DigitalClock.tsx'
import type { ClockValue } from '../logic/clockMath.ts'
import { spokenTime } from '../logic/timeWords.ts'
import { useStore } from '../store.tsx'

export function FreePlay({ onExit }: { onExit: () => void }) {
  const { active } = useStore()
  const [clock, setClock] = useState<ClockValue>({ hour: 10, minute: 10, hourAngle: null })
  const settings = active.settings

  function say(hour: number, minute: number) {
    speak(spokenTime(hour, minute, 1), settings)
  }

  return (
    <section className="screen play-screen" data-testid="free-play">
      <header className="topbar">
        <button type="button" className="icon-btn" data-testid="back" aria-label="Zurück" onClick={onExit}>
          <BackIcon />
        </button>
        <strong className="top-title">Freies Spielen</strong>
        <button
          type="button"
          className="icon-btn speaker"
          data-testid="speaker"
          aria-label="Zeit sagen"
          onClick={() => say(clock.hour, clock.minute)}
        >
          <SpeakerIcon />
        </button>
      </header>
      <div className="play-grid">
        <AnalogClock
          value={clock}
          minuteMarkers={settings.minuteMarkers}
          geared={!settings.independentHands}
          interactive
          use24={false}
          showPeriod={false}
          ghost={null}
          wrongHour={false}
          wrongMinute={false}
          onChange={setClock}
          onRelease={(next) => say(next.hour, next.minute)}
        />
        <div className="side-panel">
          <DigitalClock
            hour={clock.hour}
            minute={clock.minute}
            use24={false}
            interactive
            minuteStep={1}
            onChange={(next) => {
              playTap()
              setClock({ hour: next.hour, minute: next.minute, hourAngle: null })
              say(next.hour, next.minute)
            }}
          />
        </div>
      </div>
    </section>
  )
}
