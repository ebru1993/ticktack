import { Component } from 'preact'
import type { ComponentChildren } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { hush, playFanfare, speak } from './audio.ts'
import { Confetti } from './components/Confetti.tsx'
import { makeRound, type LevelId, type Mode, type Task } from './logic/levels.ts'
import { taskSpeech } from './logic/phrases.ts'
import { awardStars, recordResult } from './logic/progress.ts'
import { stickerForIndex } from './logic/stickers.ts'
import { FreePlay } from './screens/FreePlay.tsx'
import { Album, Home, Profiles, RoundEnd, Welcome } from './screens/Menus.tsx'
import { ParentScreen } from './screens/Parent.tsx'
import { PlayScreen } from './screens/Play.tsx'
import { StoreProvider, useStore } from './store.tsx'

type PlayMode = Exclude<Mode, 'free'>

type Route =
  | { name: 'welcome' }
  | { name: 'profiles' }
  | { name: 'home' }
  | { name: 'album' }
  | { name: 'parent' }
  | { name: 'free' }
  | { name: 'play'; mode: PlayMode; level: LevelId; tasks: Task[] }
  | {
      name: 'end'
      mode: PlayMode
      level: LevelId
      stars: number
      correct: number
      stickerId: string
      unlocked: boolean
    }

class Guard extends Component<{ children: ComponentChildren }, { failed: boolean }> {
  state = { failed: false }
  componentDidCatch() {
    this.setState({ failed: true })
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="screen center-screen">
          <p>Das hat nicht geklappt.</p>
          <button type="button" className="btn btn-sun" onClick={() => location.reload()}>
            Nochmal laden
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function Shell() {
  const { active, setActive, updateActive } = useStore()
  const [route, setRoute] = useState<Route>({ name: 'welcome' })
  const [burst, setBurst] = useState(0)
  const unlockedRef = useRef(false)
  const parentBack = useRef<'home' | 'profiles'>('home')

  function home() {
    hush()
    setRoute({ name: 'home' })
  }

  function startMode(mode: PlayMode, level = active.selectedLevel) {
    unlockedRef.current = false
    const tasks = makeRound(level, mode)
    setRoute({ name: 'play', mode, level, tasks })
    speak(taskSpeech(mode, level, tasks[0].target), active.settings)
  }

  return (
    <div className="sky" data-screen={route.name}>
      <div className="sky-deco" aria-hidden="true">
        <span className="sun-blob" />
        <span className="cloud cloud-a" />
        <span className="cloud cloud-b" />
        <span className="hill" />
      </div>
      <Confetti burst={burst} />
      {route.name === 'welcome' && <Welcome onStart={() => setRoute({ name: 'profiles' })} />}
      {route.name === 'profiles' && (
        <Profiles
          onChoose={(id) => {
            setActive(id)
            setRoute({ name: 'home' })
          }}
          onParent={() => {
            parentBack.current = 'profiles'
            setRoute({ name: 'parent' })
          }}
        />
      )}
      {route.name === 'home' && (
        <Home
          onMode={startMode}
          onFree={() => {
            speak('Spiel mit der Uhr.', active.settings)
            setRoute({ name: 'free' })
          }}
          onAlbum={() => setRoute({ name: 'album' })}
          onParent={() => {
            parentBack.current = 'home'
            setRoute({ name: 'parent' })
          }}
        />
      )}
      {route.name === 'album' && <Album onExit={home} />}
      {route.name === 'parent' && (
        <ParentScreen
          onExit={() => setRoute(parentBack.current === 'profiles' ? { name: 'profiles' } : { name: 'home' })}
        />
      )}
      {route.name === 'free' && <FreePlay onExit={home} />}
      {route.name === 'play' && (
        <PlayScreen
          mode={route.mode}
          level={route.level}
          tasks={route.tasks}
          onExit={home}
          onFinishedTask={(correct, stars) => {
            updateActive((profile) => {
              const rec = recordResult(profile, route.level, correct)
              if (rec.unlocked) unlockedRef.current = true
              return awardStars(rec.profile, stars)
            })
          }}
          onRoundDone={(info) => {
            const stickerId = stickerForIndex(active.stickers.length)
            const unlocked = unlockedRef.current
            unlockedRef.current = false
            updateActive((profile) => ({
              ...profile,
              stickers: [...profile.stickers, stickerForIndex(profile.stickers.length)],
            }))
            setBurst((value) => value + 1)
            setRoute({
              name: 'end',
              mode: route.mode,
              level: route.level,
              stars: info.stars,
              correct: info.correct,
              stickerId,
              unlocked,
            })
            playFanfare()
            speak(
              unlocked
                ? 'Runde geschafft! Ein neuer Sticker. Neues Level ist offen!'
                : 'Runde geschafft! Ein neuer Sticker für dich.',
              active.settings,
            )
          }}
        />
      )}
      {route.name === 'end' && (
        <RoundEnd
          stars={route.stars}
          correct={route.correct}
          stickerId={route.stickerId}
          unlocked={route.unlocked}
          onAgain={() => startMode(route.mode, route.level)}
          onDone={home}
        />
      )}
    </div>
  )
}

export function App() {
  return (
    <StoreProvider>
      <Guard>
        <Shell />
      </Guard>
    </StoreProvider>
  )
}
