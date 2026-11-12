import { useEffect, useRef, useState } from 'preact/hooks'
import { hush, playSuccess, playTap, playTryAgain, speak } from '../audio.ts'
import { AnalogClock } from '../components/AnalogClock.tsx'
import { CheckIcon, SpeakerIcon } from '../components/Art.tsx'
import { Confetti } from '../components/Confetti.tsx'
import { DigitalClock } from '../components/DigitalClock.tsx'
import { checkAnalog, checkDigital, type ClockValue } from '../logic/clockMath.ts'
import { levelStep, type LevelId, type Mode, type Task } from '../logic/levels.ts'
import { helpSpeech, taskSpeech } from '../logic/phrases.ts'
import { starsForAttempt } from '../logic/progress.ts'
import { spokenTime } from '../logic/timeWords.ts'
import { useStore } from '../store.tsx'

type Phase = 'answer' | 'wrong' | 'correct' | 'reveal'

const startClock = (): ClockValue => ({ hour: 12, minute: 0, hourAngle: null })

export function PlayScreen({
  mode,
  level,
  tasks,
  onExit,
  onFinishedTask,
  onRoundDone,
}: {
  mode: Exclude<Mode, 'free'>
  level: LevelId
  tasks: Task[]
  onExit: () => void
  onFinishedTask: (correct: boolean, stars: number) => void
  onRoundDone: (info: { stars: number; correct: number }) => void
}) {
  const { active } = useStore()
  const settings = active.settings
  const [index, setIndex] = useState(0)
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [phase, setPhase] = useState<Phase>('answer')
  const [clock, setClock] = useState<ClockValue>(startClock)
  const [digital, setDigital] = useState({ hour: 12, minute: 0 })
  const [selected, setSelected] = useState<number | null>(null)
  const [misses, setMisses] = useState<number[]>([])
  const [wrong, setWrong] = useState<{ hour: boolean; minute: boolean } | null>(null)
  const [showGhost, setShowGhost] = useState(false)
  const [stars, setStars] = useState(0)
  const [correctN, setCorrectN] = useState(0)
  const [burst, setBurst] = useState(0)
  const [shake, setShake] = useState(false)
  const ghostTimer = useRef(0)
  const task = tasks[index]
  const use24 = level === 6
  const geared = !settings.independentHands
  const interactive = (mode === 'hear' || mode === 'd2a') && (phase === 'answer' || phase === 'wrong')
  const step = levelStep(level)

  useEffect(() => () => window.clearTimeout(ghostTimer.current), [])

  function resetBoard() {
    window.clearTimeout(ghostTimer.current)
    setClock(startClock())
    setDigital({ hour: 12, minute: 0 })
    setSelected(null)
    setMisses([])
    setWrong(null)
    setShowGhost(false)
    setAttempt(1)
    setPhase('answer')
  }

  function finish(correct: boolean) {
    const earned = correct ? starsForAttempt(attempt) : 0
    onFinishedTask(correct, earned)
    setStars((value) => value + earned)
    if (correct) setCorrectN((value) => value + 1)
  }

  function onCheck() {
    if (phase === 'correct' || phase === 'reveal') return
    let result: { ok: boolean; hourOk: boolean; minuteOk: boolean }
    if (mode === 'read') {
      if (selected === null) {
        setShake(true)
        window.setTimeout(() => setShake(false), 450)
        speak('Tippe auf eine Antwort.', settings)
        return
      }
      const choice = task.options[selected]
      const ok = choice.hour === task.target.hour && choice.minute === task.target.minute
      result = { ok, hourOk: ok, minuteOk: ok }
    } else if (mode === 'a2d') {
      result = checkDigital(digital, task.target, step, use24)
    } else {
      result = checkAnalog(clock, task.target, step)
    }

    if (result.ok) {
      setPhase('correct')
      setWrong(null)
      setShowGhost(false)
      finish(true)
      setBurst((value) => value + 1)
      playSuccess()
      speak(`Super! ${spokenTime(task.target.hour, task.target.minute, level)}`, settings)
      return
    }

    setWrong({ hour: !result.hourOk, minute: !result.minuteOk })
    if (mode === 'read' && selected !== null) setMisses((list) => [...list, selected])
    playTryAgain()
    if (attempt === 1) {
      setAttempt(2)
      setPhase('wrong')
      setShowGhost(true)
      window.clearTimeout(ghostTimer.current)
      ghostTimer.current = window.setTimeout(() => setShowGhost(false), 2300)
      speak('Fast geschafft. Schau nochmal und versuch es noch einmal.', settings)
      return
    }

    setPhase('reveal')
    setShowGhost(true)
    if (mode === 'hear' || mode === 'd2a') {
      setClock({ hour: task.target.hour, minute: task.target.minute, hourAngle: null })
    }
    if (mode === 'a2d') setDigital({ hour: task.target.hour, minute: task.target.minute })
    finish(false)
    speak(`So ist es richtig. ${spokenTime(task.target.hour, task.target.minute, level)}`, settings)
  }

  function onNext() {
    playTap()
    if (index + 1 >= tasks.length) {
      onRoundDone({ stars, correct: correctN })
      return
    }
    const nextIndex = index + 1
    setIndex(nextIndex)
    resetBoard()
    speak(taskSpeech(mode, level, tasks[nextIndex].target), settings)
  }

  function replay() {
    speak(helpSpeech(mode, level, task.target), settings)
  }

  const questionClock = mode === 'read' || mode === 'a2d'
  const clockValue: ClockValue = questionClock
    ? { hour: task.target.hour, minute: task.target.minute, hourAngle: null }
    : clock

  return (
    <section
      className="screen play-screen"
      data-testid="task"
      data-target-hour={task.target.hour}
      data-target-minute={task.target.minute}
      data-phase={phase}
      data-mode={mode}
    >
      <Confetti burst={burst} />
      <header className="topbar">
        <button type="button" className="icon-btn" data-testid="back" aria-label="Zurück" onClick={() => { hush(); onExit() }}>
          <svg viewBox="0 0 48 48" className="ico" aria-hidden="true">
            <path d="M30 8 L14 24 L30 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="dots" aria-hidden="true">
          {tasks.map((_, dot) => (
            <span key={dot} className={dot < index ? 'dot done' : dot === index ? 'dot now' : 'dot'} />
          ))}
        </div>
        <button type="button" className="icon-btn speaker" data-testid="speaker" aria-label="Nochmal hören" onClick={replay}>
          <SpeakerIcon />
        </button>
      </header>

      {phase === 'correct' && <p className="banner good">Super!</p>}
      {phase === 'wrong' && <p className="banner soft">Schau nochmal</p>}
      {phase === 'reveal' && <p className="banner soft">So ist es richtig</p>}

      <div className="play-grid">
        <div className="clock-card">
          <AnalogClock
            value={clockValue}
            minuteMarkers={settings.minuteMarkers}
            geared={geared}
            interactive={interactive}
            use24={use24}
            showPeriod={level === 6}
            ghost={!questionClock && showGhost ? task.target : null}
            wrongHour={!questionClock && !!wrong?.hour}
            wrongMinute={!questionClock && !!wrong?.minute}
            onChange={setClock}
          />
          {mode === 'hear' && (
            <DigitalClock
              hour={clock.hour}
              minute={clock.minute}
              use24={use24}
              interactive={false}
              minuteStep={step}
              testId="mirror"
              size="mini"
            />
          )}
        </div>

        <div className="side-panel">
          {mode === 'd2a' && (
            <div className="question-card">
              {level === 6 && (
                <div className="period-badge inline">
                  <svg viewBox="0 0 64 64" className="period-svg" aria-hidden="true">
                    {task.target.hour >= 6 && task.target.hour < 18 ? (
                      <circle cx="32" cy="32" r="18" fill="#ffb703" />
                    ) : (
                      <path d="M40 14a16 16 0 1 0 12 20 12 12 0 1 1-12-20z" fill="#24324a" />
                    )}
                  </svg>
                </div>
              )}
              <DigitalClock
                hour={task.target.hour}
                minute={task.target.minute}
                use24={use24}
                interactive={false}
                minuteStep={step}
                testId="question-digital"
                size="large"
              />
            </div>
          )}

          {mode === 'a2d' && (
            <DigitalClock
              hour={digital.hour}
              minute={digital.minute}
              use24={use24}
              interactive={phase === 'answer' || phase === 'wrong'}
              minuteStep={step}
              onChange={setDigital}
              wrongHour={!!wrong?.hour}
              wrongMinute={!!wrong?.minute}
            />
          )}

          {mode === 'read' && (
            <div className={`options${shake ? ' shake' : ''}`}>
              {task.options.map((option, optionIndex) => {
                const picked = selected === optionIndex
                const bad = misses.includes(optionIndex)
                const good = phase === 'reveal' && option.hour === task.target.hour && option.minute === task.target.minute
                return (
                  <button
                    key={`${option.hour}-${option.minute}-${optionIndex}`}
                    type="button"
                    className={`option${picked ? ' selected' : ''}${bad ? ' bad' : ''}${good ? ' good' : ''}`}
                    data-testid="option"
                    data-hour={option.hour}
                    data-minute={option.minute}
                    onClick={() => {
                      if (phase === 'correct' || phase === 'reveal') return
                      setSelected(optionIndex)
                      speak(spokenTime(option.hour, option.minute, level), settings)
                    }}
                  >
                    <DigitalClock
                      hour={option.hour}
                      minute={option.minute}
                      use24={use24 || option.hour === 0 || option.hour > 12}
                      interactive={false}
                      minuteStep={60}
                      testId={`option-digital-${optionIndex}`}
                      size="mini"
                    />
                  </button>
                )
              })}
            </div>
          )}

          {phase === 'correct' || phase === 'reveal' ? (
            <button type="button" className="btn btn-green btn-block" data-testid="next" onClick={onNext}>
              Weiter
            </button>
          ) : (
            <button type="button" className="btn btn-green btn-block" data-testid="check" onClick={onCheck}>
              <CheckIcon /> Prüfen
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
