export type SpeechSettings = {
  speechRate: number
  voiceURI: string | null
}

let audioCtx: AudioContext | null = null
let audioBroken = false

function context(): AudioContext | null {
  if (audioBroken) return null
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  try {
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctx()
    return audioCtx
  } catch {
    audioBroken = true
    audioCtx = null
    return null
  }
}

export function unlockAudio(): void {
  try {
    const ctx = context()
    if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {
      audioBroken = true
    })
  } catch {
    audioBroken = true
  }
}

function tone(freq: number, at: number, dur: number, type: OscillatorType, gain: number): void {
  const ctx = context()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    const start = ctx.currentTime + at
    amp.gain.setValueAtTime(0.0001, start)
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + dur + 0.03)
  } catch {
    audioBroken = true
  }
}

export function playTap(): void {
  tone(680, 0, 0.07, 'sine', 0.045)
}

export function playSuccess(): void {
  tone(523, 0, 0.12, 'sine', 0.07)
  tone(659, 0.09, 0.12, 'sine', 0.07)
  tone(784, 0.18, 0.2, 'sine', 0.08)
}

export function playFanfare(): void {
  tone(523, 0, 0.12, 'triangle', 0.06)
  tone(659, 0.11, 0.12, 'triangle', 0.06)
  tone(784, 0.22, 0.12, 'triangle', 0.07)
  tone(1047, 0.33, 0.28, 'triangle', 0.07)
}

export function playTryAgain(): void {
  tone(392, 0, 0.14, 'sine', 0.045)
  tone(330, 0.12, 0.2, 'sine', 0.04)
}

function pickVoice(uri: string | null): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? []
  if (uri) {
    const chosen = voices.find((voice) => voice.voiceURI === uri)
    if (chosen) return chosen
  }
  return (
    voices.find((voice) => voice.lang === 'de-CH') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('de-de')) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('de')) ??
    null
  )
}

export function germanVoices(): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis?.getVoices() ?? []
  const german = voices.filter((voice) => voice.lang.toLowerCase().startsWith('de'))
  return german.length > 0 ? german : voices
}

/** Speak in the click that the child just made. iPad Safari ignores speech without a gesture. */
export function speak(text: string, settings: SpeechSettings): void {
  const synth = window.speechSynthesis
  if (!synth || !text) return
  try {
    if (synth.speaking) synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    const voice = pickVoice(settings.voiceURI)
    if (voice) {
      utter.voice = voice
      utter.lang = voice.lang
    } else {
      utter.lang = 'de-DE'
    }
    utter.rate = Math.min(1.3, Math.max(0.6, settings.speechRate || 0.9))
    utter.pitch = 1.05
    synth.speak(utter)
  } catch {
    /* The clock still works when this iPad has no German voice. */
  }
}

export function hush(): void {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}
