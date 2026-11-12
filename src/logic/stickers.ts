export type StickerMeta = {
  id: string
  name: string
  bg: string
}

export const STICKERS: StickerMeta[] = [
  { id: 'sonne', name: 'Sonne', bg: '#ffe08a' },
  { id: 'mond', name: 'Mond', bg: '#d9e4ff' },
  { id: 'vogel', name: 'Vogel', bg: '#c8f3ff' },
  { id: 'blume', name: 'Blume', bg: '#ffd6e8' },
  { id: 'regenbogen', name: 'Regenbogen', bg: '#fff1c9' },
  { id: 'kafer', name: 'Käfer', bg: '#ffd0d4' },
  { id: 'fisch', name: 'Fisch', bg: '#c9f2ff' },
  { id: 'falter', name: 'Falter', bg: '#ffe7c2' },
  { id: 'apfel', name: 'Apfel', bg: '#ffd9d2' },
  { id: 'ballon', name: 'Ballon', bg: '#e4d9ff' },
  { id: 'wolke', name: 'Wolke', bg: '#e7f4ff' },
  { id: 'pilz', name: 'Pilz', bg: '#ffe3c4' },
  { id: 'schildkroete', name: 'Schildkröte', bg: '#d8f5d4' },
  { id: 'eule', name: 'Eule', bg: '#efe2cf' },
  { id: 'herz', name: 'Herz', bg: '#ffd6e0' },
  { id: 'rakete', name: 'Rakete', bg: '#dce6ff' },
  { id: 'biene', name: 'Biene', bg: '#fff3b0' },
  { id: 'stern', name: 'Stern', bg: '#fff6cc' },
  { id: 'frosch', name: 'Frosch', bg: '#d5f6c8' },
  { id: 'eis', name: 'Eis', bg: '#ffe0f0' },
]

export function stickerForIndex(index: number): string {
  const count = STICKERS.length
  const safe = ((index % count) + count) % count
  return STICKERS[safe].id
}

export function stickerMeta(id: string): StickerMeta {
  return STICKERS.find((item) => item.id === id) ?? STICKERS[0]
}
