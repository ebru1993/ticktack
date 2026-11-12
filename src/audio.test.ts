import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  AFTER_SPEECH_PAUSE_MS,
  expectedSpeechMs,
  FALLBACK_SPEECH_MS,
  hush,
  normalizeManifest,
  resetAudioForTests,
  speakParts,
} from './audio.ts'

const SAMPLE_MAP = {
  'Super! Es ist': { src: 'clips/super-es-ist.mp3', durationMs: 2520 },
  'zwanzig nach eins': { src: 'clips/zwanzig-nach-eins.mp3', durationMs: 2280 },
}

describe('expectedSpeechMs', () => {
  test('sums manifest clip lengths and the short gap, scaled by rate', () => {
    const ms = expectedSpeechMs(['Super! Es ist', 'zwanzig nach eins'], 1, SAMPLE_MAP)
    expect(ms).toBe(2520 + 2280 + 40)
    expect(ms).toBeGreaterThan(AFTER_SPEECH_PAUSE_MS)
    expect(expectedSpeechMs(['Super! Es ist', 'zwanzig nach eins'], 2, SAMPLE_MAP)).toBe(
      Math.ceil((2520 + 2280 + 40) / 1.35),
    )
  })

  test('falls back to at least 3 seconds when no durations are known', () => {
    expect(expectedSpeechMs(['Super! Es ist'], 1, {})).toBeGreaterThanOrEqual(FALLBACK_SPEECH_MS)
    expect(expectedSpeechMs(['ok'], 1, {})).toBe(FALLBACK_SPEECH_MS)
  })

  test('normalizeManifest accepts the new objects and the old path strings', () => {
    const mixed = normalizeManifest({
      A: { src: 'clips/a.mp3', durationMs: 1100 },
      B: 'clips/b.mp3',
    })
    expect(mixed.A).toEqual({ src: 'clips/a.mp3', durationMs: 1100 })
    expect(mixed.B).toEqual({ src: 'clips/b.mp3', durationMs: 0 })
  })
})

type Listener = () => void

class FakeAudio {
  static instances: FakeAudio[] = []
  static playImpl: (audio: FakeAudio) => Promise<void> = () => Promise.resolve()
  src: string
  preload = ''
  playbackRate = 1
  private listeners: Record<string, Listener[]> = {}

  constructor(src = '') {
    this.src = src
    FakeAudio.instances.push(this)
  }

  addEventListener(type: string, fn: Listener) {
    ;(this.listeners[type] ??= []).push(fn)
  }

  play() {
    return FakeAudio.playImpl(this)
  }

  pause() {}

  emit(type: string) {
    for (const fn of this.listeners[type] ?? []) fn()
  }
}

const settings = { speechRate: 1, voiceURI: null }

async function waitForClips(count: number): Promise<void> {
  await vi.waitFor(() => {
    expect(FakeAudio.instances.length).toBeGreaterThanOrEqual(count)
  })
}


describe('speakParts', () => {
  afterEach(() => {
    resetAudioForTests()
    vi.unstubAllGlobals()
    FakeAudio.instances = []
    FakeAudio.playImpl = () => Promise.resolve()
  })

  function stubPlayback(manifest: unknown) {
    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal(
      'document',
      { baseURI: 'http://ticktack.test/app/' } satisfies Pick<Document, 'baseURI'>,
    )
    vi.stubGlobal(
      'window',
      Object.assign(globalThis, {
        speechSynthesis: { speaking: false, cancel() {}, getVoices: () => [], speak() {} },
      }),
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => manifest }) as Response),
    )
  }

  test('resolves only after every clip in the chain has ended', async () => {
    stubPlayback({
      'Super! Es ist': { src: 'clips/super.mp3', durationMs: 2520 },
      'zwanzig nach eins': { src: 'clips/time.mp3', durationMs: 2280 },
    })
    const done = speakParts(['Super! Es ist', 'zwanzig nach eins'], settings)
    let settled = ''
    void done.then((status) => {
      settled = status
    })
    await waitForClips(1)
    expect(settled).toBe('')
    FakeAudio.instances[0].emit('ended')
    await waitForClips(2)
    expect(settled).toBe('')
    FakeAudio.instances[1].emit('ended')
    await expect(done).resolves.toBe('finished')
    expect(settled).toBe('finished')
  })

  test('waits the expected duration when playback never starts', async () => {
    vi.useFakeTimers()
    stubPlayback({
      'Super! Es ist': { src: 'clips/super.mp3', durationMs: 2520 },
      'zwanzig nach eins': { src: 'clips/time.mp3', durationMs: 2280 },
    })
    FakeAudio.playImpl = () => Promise.reject(new Error('NotAllowedError'))
    const done = speakParts(['Super! Es ist', 'zwanzig nach eins'], settings)
    const expected = expectedSpeechMs(['Super! Es ist', 'zwanzig nach eins'], 1, SAMPLE_MAP)
    await vi.advanceTimersByTimeAsync(100)
    let settled = false
    void done.then(() => {
      settled = true
    })
    await vi.advanceTimersByTimeAsync(expected - 200)
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(400)
    await expect(done).resolves.toBe('finished')
    expect(settled).toBe(true)
    vi.useRealTimers()
  })

  test('hush cancels a running chain so the next task can speak', async () => {
    stubPlayback({
      'Super! Es ist': { src: 'clips/super.mp3', durationMs: 2520 },
    })
    const first = speakParts(['Super! Es ist'], settings)
    await waitForClips(1)
    hush()
    await expect(first).resolves.toBe('cancelled')
  })
})
