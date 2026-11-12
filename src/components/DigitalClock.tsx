import { bumpHour, cycleMinute, formatDigital, type Time } from '../logic/clockMath.ts'
import { ArrowDown, ArrowUp } from './Art.tsx'

type Props = {
  hour: number
  minute: number
  use24: boolean
  interactive: boolean
  minuteStep: number
  onChange?: (next: Time) => void
  wrongHour?: boolean
  wrongMinute?: boolean
  testId?: string
  size?: 'large' | 'mini'
}

export function DigitalClock({
  hour,
  minute,
  use24,
  interactive,
  minuteStep,
  onChange,
  wrongHour = false,
  wrongMinute = false,
  testId = 'digital',
  size = 'large',
}: Props) {
  const [hText, mText] = formatDigital(hour, minute, use24).split(':')
  const showMinutes = interactive && minuteStep < 60

  function changeHour(dir: 1 | -1) {
    onChange?.({ hour: bumpHour(hour, dir, use24), minute })
  }

  function changeMinute(dir: 1 | -1) {
    onChange?.({ hour, minute: cycleMinute(minute, minuteStep, dir) })
  }

  return (
    <div
      className={`digital digital-${size}`}
      data-testid={testId}
      data-hour={hour}
      data-minute={minute}
      aria-label={`Digitaluhr ${hText} Uhr ${mText}`}
    >
      <div className={`digit-col${wrongHour ? ' is-wrong' : ''}`}>
        {interactive && (
          <button type="button" className="arrow" data-testid="hour-up" onClick={() => changeHour(1)} aria-label="Stunde höher">
            <ArrowUp />
          </button>
        )}
        <div className={`digit${wrongHour ? ' wrong' : ''}`}>{hText}</div>
        {interactive && (
          <button type="button" className="arrow" data-testid="hour-down" onClick={() => changeHour(-1)} aria-label="Stunde tiefer">
            <ArrowDown />
          </button>
        )}
      </div>
      <div className="colon" aria-hidden="true">
        :
      </div>
      <div className={`digit-col${wrongMinute ? ' is-wrong' : ''}`}>
        {showMinutes && (
          <button type="button" className="arrow" data-testid="minute-up" onClick={() => changeMinute(1)} aria-label="Minute höher">
            <ArrowUp />
          </button>
        )}
        <div className={`digit${wrongMinute ? ' wrong' : ''}`}>{mText}</div>
        {showMinutes && (
          <button type="button" className="arrow" data-testid="minute-down" onClick={() => changeMinute(-1)} aria-label="Minute tiefer">
            <ArrowDown />
          </button>
        )}
      </div>
    </div>
  )
}
