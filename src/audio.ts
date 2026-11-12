export type SpeechSettings = {
  speechRate: number
  voiceURI: string | null
}

export type SpeakStatus = 'finished' | 'cancelled'
export type ClipInfo = { src: string; durationMs: number }

/** Pause after a finished praise or reveal before the next task starts. */
export const AFTER_SPEECH_PAUSE_MS = 800
/** Used when a clip's length is unknown or playback never starts. */
export const FALLBACK_SPEECH_MS = 3000
const CLIP_GAP_MS = 40
const WATCHDOG_EXTRA_MS = 1500

let audioCtx: AudioContext | null = null
let audioBroken = false
let manifest: Record<string, ClipInfo> | null = null
let current: HTMLAudioElement | null = null
let queueToken = 0
let cancelCurrent: (() => void) | null = null

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
    if (ctx && ctx.state === 'suspended')
      void ctx.resume().catch(() => {
        audioBroken = true
      })
  } catch {
    audioBroken = true
  }
  void loadManifest()
}

export function normalizeManifest(raw: unknown): Record<string, ClipInfo> {
  const out: Record<string, ClipInfo> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [text, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string') {
      out[text] = { src: value, durationMs: 0 }
      continue
    }
    if (value && typeof value === 'object' && 'src' in value) {
      const src = String((value as { src: unknown }).src)
      const durationMs = Number((value as { durationMs?: unknown }).durationMs) || 0
      if (src) out[text] = { src, durationMs: durationMs > 0 ? durationMs : 0 }
    }
  }
  return out
}

async function loadManifest(): Promise<Record<string, ClipInfo>> {
  if (manifest) return manifest
  try {
    const response = await fetch(new URL('audio/manifest.json', document.baseURI))
    if (response.ok) {
      manifest = normalizeManifest(await response.json())
      return manifest
    }
  } catch {
    /* Offline first-load or a missing file: the spoken fallback still works. */
  }
  manifest = {}
  return manifest
}

/** Expected playback time for a clip chain, from manifest lengths or a safe fallback. */
export function expectedSpeechMs(
  parts: string[],
  rate: number,
  map: Record<string, ClipInfo> = {},
): number {
  const cleaned = parts.map((part) => part.trim()).filter(Boolean)
  if (cleaned.length === 0) return 0
  const speed = Math.min(1.35, Math.max(0.7, rate || 1))
  let known = 0
  let knownCount = 0
  for (const part of cleaned) {
    const ms = map[part]?.durationMs ?? 0
    if (ms > 0) {
      known += ms
      knownCount += 1
    }
  }
  const gaps = Math.max(0, cleaned.length - 1) * CLIP_GAP_MS
  if (knownCount === cleaned.length) return Math.ceil((known + gaps) / speed)
  const chars = cleaned.join(' ').length
  const fromText = Math.ceil((Math.max(chars, 24) / 12) * 1000 / speed)
  const missing = cleaned.length - knownCount
  const fromKnown =
    knownCount > 0 ? Math.ceil((known + missing * FALLBACK_SPEECH_MS + gaps) / speed) : 0
  return Math.max(FALLBACK_SPEECH_MS, fromText, fromKnown)
}

function clipUrl(text: string, map: Record<string, ClipInfo>): string | null {
  const rel = map[text]?.src
  if (!rel) return null
  return new URL(`audio/${rel}`, document.baseURI).href
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

function sleepForToken(ms: number, token: number): Promise<SpeakStatus> {
  return new Promise((resolve) => {
    const started = Date.now()
    const tick = () => {
      if (token !== queueToken) {
        resolve('cancelled')
        return
      }
      const left = ms - (Date.now() - started)
      if (left <= 0) {
        resolve(token === queueToken ? 'finished' : 'cancelled')
        return
      }
      window.setTimeout(tick, Math.min(left, 100))
    }
    window.setTimeout(tick, Math.min(ms, 100))
  })
}

function fallbackSpeak(text: string, settings: SpeechSettings, token: number, waitMs: number): Promise<SpeakStatus> {
  const synth = window.speechSynthesis
  if (!synth || !text) return sleepForToken(waitMs, token)
  return new Promise((resolve) => {
    let watchdog = 0
    const finish = (status: SpeakStatus) => {
      window.clearTimeout(watchdog)
      resolve(status)
    }
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
      utter.rate = Math.min(1.3, Math.max(0.6, settings.speechRate || 1))
      utter.pitch = 1
      watchdog = window.setTimeout(() => {
        if (token !== queueToken) finish('cancelled')
        else finish('finished')
      }, waitMs + WATCHDOG_EXTRA_MS)
      utter.onend = () => {
        if (token !== queueToken) finish('cancelled')
        else finish('finished')
      }
      utter.onerror = () => {
        if (token !== queueToken) finish('cancelled')
        else void sleepForToken(waitMs, token).then(finish)
      }
      synth.speak(utter)
    } catch {
      void sleepForToken(waitMs, token).then(resolve)
    }
  })
}

function playOne(
  url: string,
  rate: number,
  token: number,
  clipMs: number,
): Promise<'ended' | 'failed' | 'cancelled'> {
  return new Promise((resolve) => {
    if (token !== queueToken) {
      resolve('cancelled')
      return
    }
    const el = new Audio(url)
    el.preload = 'auto'
    el.playbackRate = rate
    current = el
    let settled = false
    let watchdog = 0
    const done = (status: 'ended' | 'failed' | 'cancelled') => {
      if (settled) return
      settled = true
      window.clearTimeout(watchdog)
      if (cancelCurrent === doneAsCancel) cancelCurrent = null
      if (current === el) current = null
      resolve(status)
    }
    const doneAsCancel = () => done('cancelled')
    cancelCurrent = doneAsCancel
    watchdog = window.setTimeout(
      () => done(token !== queueToken ? 'cancelled' : 'failed'),
      clipMs + WATCHDOG_EXTRA_MS,
    )
    el.addEventListener('ended', () => done(token !== queueToken ? 'cancelled' : 'ended'))
    el.addEventListener('error', () => done(token !== queueToken ? 'cancelled' : 'failed'))
    const start = el.play()
    if (start) void start.catch(() => done(token !== queueToken ? 'cancelled' : 'failed'))
  })
}

async function playQueue(
  parts: string[],
  urls: string[],
  rate: number,
  token: number,
  map: Record<string, ClipInfo>,
): Promise<SpeakStatus> {
  const started = Date.now()
  const expected = expectedSpeechMs(parts, rate, map)
  const speed = Math.min(1.35, Math.max(0.7, rate || 1))
  let heard = 0
  for (let index = 0; index < urls.length; index += 1) {
    if (token !== queueToken) return 'cancelled'
    const clipMs = Math.ceil((map[parts[index]]?.durationMs || FALLBACK_SPEECH_MS) / speed)
    const result = await playOne(urls[index], speed, token, clipMs)
    if (result === 'cancelled' || token !== queueToken) return 'cancelled'
    if (result === 'ended') heard += 1
    if (index < urls.length - 1) {
      const gap = await sleepForToken(CLIP_GAP_MS, token)
      if (gap === 'cancelled') return 'cancelled'
    }
  }
  if (token !== queueToken) return 'cancelled'
  if (heard === 0) {
    const left = Math.max(0, expected - (Date.now() - started))
    return sleepForToken(left || expected, token)
  }
  if (heard < urls.length) {
    const left = Math.max(0, expected - (Date.now() - started))
    if (left > 0) return sleepForToken(left, token)
  }
  return 'finished'
}

/** Speak one or more prepared clips. Resolves when the whole chain has ended, or after a fallback delay. */
export function speakParts(parts: string[], settings: SpeechSettings): Promise<SpeakStatus> {
  const cleaned = parts.map((part) => part.trim()).filter(Boolean)
  hush()
  if (cleaned.length === 0) return Promise.resolve('finished')
  const token = ++queueToken
  const rate = settings.speechRate || 1
  return loadManifest().then(async (map) => {
    if (token !== queueToken) return 'cancelled'
    const expected = expectedSpeechMs(cleaned, rate, map)
    const urls = cleaned.map((part) => clipUrl(part, map))
    if (urls.every((url): url is string => Boolean(url))) {
      return playQueue(cleaned, urls, rate, token, map)
    }
    return fallbackSpeak(cleaned.join(' ').replace(/\s+/g, ' '), settings, token, expected)
  })
}

/** Speak in the click that the child just made. iPad Safari ignores sound without a gesture. */
export function speak(text: string, settings: SpeechSettings): Promise<SpeakStatus> {
  return speakParts([text], settings)
}

export function hush(): void {
  queueToken += 1
  const cancel = cancelCurrent
  cancelCurrent = null
  cancel?.()
  if (current) {
    try {
      current.pause()
      current.src = ''
    } catch {
      /* ignore */
    }
    current = null
  }
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

/** Clears cached clips and stops playback so unit tests can start clean. */
export function resetAudioForTests(): void {
  manifest = null
  hush()
}
