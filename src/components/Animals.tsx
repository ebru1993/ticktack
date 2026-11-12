export type Animal = {
  id: number
  name: string
  bg: string
}

export const ANIMALS: Animal[] = [
  { id: 0, name: 'Fuchs', bg: '#ffe0c2' },
  { id: 1, name: 'Eule', bg: '#efe4d0' },
  { id: 2, name: 'Katze', bg: '#ffe9c7' },
  { id: 3, name: 'Hase', bg: '#ffe4f0' },
  { id: 4, name: 'Bär', bg: '#f3e0c8' },
  { id: 5, name: 'Igel', bg: '#e8f3d8' },
  { id: 6, name: 'Pinguin', bg: '#dcefff' },
  { id: 7, name: 'Frosch', bg: '#d9f5d6' },
  { id: 8, name: 'Reh', bg: '#f8e6d0' },
  { id: 9, name: 'Vogel', bg: '#d9f0ff' },
  { id: 10, name: 'Eichhörnchen', bg: '#ffe6cc' },
  { id: 11, name: 'Schildkröte', bg: '#d8f3ea' },
]

export function animalCount(): number {
  return ANIMALS.length
}

export function animalOf(id: number): Animal {
  const n = ANIMALS.length
  return ANIMALS[((id % n) + n) % n]
}

export function Avatar({ id, size = 120 }: { id: number; size?: number }) {
  const animal = animalOf(id)
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="avatar"
      aria-hidden="true"
      role="img"
    >
      <title>{animal.name}</title>
      <circle cx="60" cy="60" r="58" fill={animal.bg} />
      <AnimalArt id={animal.id} />
    </svg>
  )
}

function AnimalArt({ id }: { id: number }) {
  switch (id) {
    case 0: // Fuchs
      return (
        <g>
          <ellipse cx="60" cy="78" rx="28" ry="18" fill="#f08a2c" />
          <path d="M32 48l14-22 16 16 16-16 14 22-16 10-14-8-14 8z" fill="#f08a2c" />
          <path d="M36 40l10-16 8 14zM84 40L74 24l-8 14z" fill="#f08a2c" />
          <path d="M40 36l6-10 4 10zM80 36l-6-10-4 10z" fill="#ffe9d6" />
          <circle cx="60" cy="58" r="20" fill="#f08a2c" />
          <ellipse cx="60" cy="68" rx="10" ry="8" fill="#ffe9d6" />
          <circle cx="52" cy="54" r="3" fill="#1c2742" />
          <circle cx="68" cy="54" r="3" fill="#1c2742" />
          <ellipse cx="60" cy="62" rx="3.2" ry="2.2" fill="#1c2742" />
          <path d="M56 68q4 4 8 0" fill="none" stroke="#1c2742" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 78h16v10H26zM78 78h16v10H78z" fill="#f08a2c" />
        </g>
      )
    case 1: // Eule
      return (
        <g>
          <ellipse cx="60" cy="72" rx="26" ry="28" fill="#8a5a2b" />
          <ellipse cx="60" cy="76" rx="16" ry="18" fill="#d7a15a" />
          <path d="M34 38l26-16 26 16-10 12H44z" fill="#8a5a2b" />
          <circle cx="48" cy="56" r="12" fill="#fff6dd" />
          <circle cx="72" cy="56" r="12" fill="#fff6dd" />
          <circle cx="48" cy="57" r="4.5" fill="#1c2742" />
          <circle cx="72" cy="57" r="4.5" fill="#1c2742" />
          <circle cx="49.5" cy="55.5" r="1.4" fill="#fff" />
          <circle cx="73.5" cy="55.5" r="1.4" fill="#fff" />
          <path d="M56 68l4 8 4-8z" fill="#ef9f00" />
          <path d="M36 86l8 16M84 86l-8 16" stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
    case 2: // Katze
      return (
        <g>
          <ellipse cx="60" cy="80" rx="26" ry="20" fill="#f0b25a" />
          <circle cx="60" cy="58" r="22" fill="#f0b25a" />
          <path d="M40 42l-2-22 16 14zM80 42l2-22-16 14z" fill="#f0b25a" />
          <path d="M42 36l2-12 8 10zM78 36l-2-12-8 10z" fill="#ffd8c2" />
          <circle cx="52" cy="56" r="3.2" fill="#1c2742" />
          <circle cx="68" cy="56" r="3.2" fill="#1c2742" />
          <path d="M60 62l-4 4 4 2 4-2z" fill="#e37a8a" />
          <path d="M48 66q12 8 24 0" fill="none" stroke="#1c2742" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 70c16 8 18 2 22-6M100 70c-16 8-18 2-22-6" fill="none" stroke="#f0b25a" strokeWidth="4" strokeLinecap="round" />
          <path d="M86 90c10 6 16 4 20-2" fill="none" stroke="#f0b25a" strokeWidth="6" strokeLinecap="round" />
        </g>
      )
    case 3: // Hase
      return (
        <g>
          <ellipse cx="60" cy="84" rx="24" ry="18" fill="#f3d2c1" />
          <circle cx="60" cy="64" r="20" fill="#f3d2c1" />
          <ellipse cx="48" cy="32" rx="8" ry="24" fill="#f3d2c1" />
          <ellipse cx="72" cy="32" rx="8" ry="24" fill="#f3d2c1" />
          <ellipse cx="48" cy="34" rx="4" ry="16" fill="#f7b7c8" />
          <ellipse cx="72" cy="34" rx="4" ry="16" fill="#f7b7c8" />
          <circle cx="52" cy="62" r="3" fill="#1c2742" />
          <circle cx="68" cy="62" r="3" fill="#1c2742" />
          <ellipse cx="60" cy="70" rx="4" ry="3" fill="#e37a8a" />
          <path d="M54 74q6 5 12 0" fill="none" stroke="#1c2742" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="42" cy="92" rx="8" ry="6" fill="#f3d2c1" />
          <ellipse cx="78" cy="92" rx="8" ry="6" fill="#f3d2c1" />
        </g>
      )
    case 4: // Bär
      return (
        <g>
          <ellipse cx="60" cy="80" rx="28" ry="20" fill="#8d5524" />
          <circle cx="38" cy="40" r="12" fill="#8d5524" />
          <circle cx="82" cy="40" r="12" fill="#8d5524" />
          <circle cx="38" cy="40" r="6" fill="#e8b896" />
          <circle cx="82" cy="40" r="6" fill="#e8b896" />
          <circle cx="60" cy="60" r="24" fill="#8d5524" />
          <ellipse cx="60" cy="70" rx="12" ry="10" fill="#e8b896" />
          <circle cx="50" cy="56" r="3.2" fill="#1c2742" />
          <circle cx="70" cy="56" r="3.2" fill="#1c2742" />
          <ellipse cx="60" cy="66" rx="4" ry="3" fill="#1c2742" />
          <path d="M54 74q6 5 12 0" fill="none" stroke="#1c2742" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )
    case 5: // Igel
      return (
        <g>
          <path d="M28 74c2-28 16-44 32-44s30 16 32 44c-8 16-20 22-32 22s-24-6-32-22z" fill="#c47b2b" />
          <g fill="#8d5524">
            <path d="M40 40l-6-16 12 10zM52 34l-2-18 12 12zM66 34l2-18 8 14zM78 40l8-16 4 16zM34 52l-14-10 16 4zM86 52l14-10-16 4z" />
          </g>
          <ellipse cx="72" cy="78" rx="16" ry="12" fill="#e8b896" />
          <circle cx="78" cy="74" r="2.6" fill="#1c2742" />
          <ellipse cx="86" cy="80" rx="3.4" ry="2.4" fill="#1c2742" />
          <path d="M76 84q4 3 8 0" fill="none" stroke="#1c2742" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="44" cy="90" rx="6" ry="4" fill="#8d5524" />
          <ellipse cx="70" cy="92" rx="6" ry="4" fill="#8d5524" />
        </g>
      )
    case 6: // Pinguin
      return (
        <g>
          <ellipse cx="60" cy="70" rx="24" ry="32" fill="#1c2742" />
          <ellipse cx="60" cy="76" rx="16" ry="22" fill="#fffaf2" />
          <circle cx="60" cy="40" r="16" fill="#1c2742" />
          <circle cx="54" cy="38" r="3" fill="#fffaf2" />
          <circle cx="66" cy="38" r="3" fill="#fffaf2" />
          <circle cx="54" cy="38.5" r="1.5" fill="#1c2742" />
          <circle cx="66" cy="38.5" r="1.5" fill="#1c2742" />
          <path d="M54 46l6 6 6-6z" fill="#ffb703" />
          <path d="M28 70l16-6-4 14zM92 70L76 64l4 14z" fill="#1c2742" />
          <path d="M50 100l10 8 10-8z" fill="#ffb703" />
        </g>
      )
    case 7: // Frosch
      return (
        <g>
          <ellipse cx="60" cy="74" rx="30" ry="22" fill="#5dbb63" />
          <circle cx="42" cy="50" r="14" fill="#5dbb63" />
          <circle cx="78" cy="50" r="14" fill="#5dbb63" />
          <circle cx="42" cy="50" r="8" fill="#fffaf2" />
          <circle cx="78" cy="50" r="8" fill="#fffaf2" />
          <circle cx="42" cy="51" r="3.5" fill="#1c2742" />
          <circle cx="78" cy="51" r="3.5" fill="#1c2742" />
          <path d="M50 80q10 10 20 0" fill="none" stroke="#1c2742" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="32" cy="92" rx="10" ry="6" fill="#3e9a4a" />
          <ellipse cx="88" cy="92" rx="10" ry="6" fill="#3e9a4a" />
          <path d="M58 70h4" stroke="#1c2742" strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 8: // Reh
      return (
        <g>
          <ellipse cx="60" cy="84" rx="24" ry="16" fill="#c68642" />
          <circle cx="60" cy="62" r="20" fill="#c68642" />
          <path d="M46 28c-2-12 6-18 8-8M74 28c2-12-6-18-8-8" fill="none" stroke="#6b3f2a" strokeWidth="4" strokeLinecap="round" />
          <path d="M42 48l-8-16 14 10zM78 48l8-16-14 10z" fill="#c68642" />
          <ellipse cx="60" cy="70" rx="10" ry="8" fill="#f3d2c1" />
          <circle cx="52" cy="58" r="2.8" fill="#1c2742" />
          <circle cx="68" cy="58" r="2.8" fill="#1c2742" />
          <ellipse cx="60" cy="66" rx="3.4" ry="2.6" fill="#1c2742" />
          <path d="M30 86c-10 0-14 8-12 12M90 86c10 0 14 8 12 12" fill="none" stroke="#c68642" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
    case 9: // Vogel
      return (
        <g>
          <ellipse cx="58" cy="72" rx="26" ry="18" fill="#3d9be9" />
          <circle cx="76" cy="50" r="16" fill="#3d9be9" />
          <circle cx="80" cy="48" r="3" fill="#1c2742" />
          <path d="M90 50l16 4-16 6z" fill="#ffb703" />
          <path d="M40 66c-16-18-8-8 2 2" fill="none" stroke="#1f6feb" strokeWidth="6" strokeLinecap="round" />
          <path d="M44 86l8 14M64 88l4 14" stroke="#ef9f00" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="52" cy="70" rx="8" ry="6" fill="#7cc4ff" />
          <circle cx="81.2" cy="46.5" r="1" fill="#fff" />
        </g>
      )
    case 10: // Eichhörnchen
      return (
        <g>
          <path d="M88 86c16-8 22-28 8-40-2 16-10 24-18 28z" fill="#d9782c" />
          <ellipse cx="56" cy="78" rx="22" ry="18" fill="#e0893a" />
          <circle cx="64" cy="56" r="16" fill="#e0893a" />
          <path d="M52 46l-4-16 12 10zM74 44l8-16 2 16z" fill="#e0893a" />
          <circle cx="58" cy="54" r="2.6" fill="#1c2742" />
          <circle cx="70" cy="54" r="2.6" fill="#1c2742" />
          <ellipse cx="66" cy="62" rx="3.2" ry="2.4" fill="#1c2742" />
          <ellipse cx="40" cy="74" rx="6" ry="5" fill="#f3d2c1" />
          <path d="M36 92h16M60 94h14" stroke="#c46b20" strokeWidth="4" strokeLinecap="round" />
        </g>
      )
    default: // Schildkröte
      return (
        <g>
          <ellipse cx="60" cy="70" rx="28" ry="22" fill="#2e8f62" />
          <path d="M40 62l12-10 16 0 12 10-8 16H48z" fill="#67c29a" />
          <path d="M52 58l8 14M68 58l-8 14M48 70h24" stroke="#2e8f62" strokeWidth="2" />
          <circle cx="86" cy="58" r="10" fill="#7bc67e" />
          <circle cx="88" cy="56" r="2.2" fill="#1c2742" />
          <ellipse cx="36" cy="86" rx="8" ry="5" fill="#7bc67e" />
          <ellipse cx="76" cy="88" rx="8" ry="5" fill="#7bc67e" />
          <ellipse cx="48" cy="90" rx="7" ry="5" fill="#7bc67e" />
          <ellipse cx="86" cy="82" rx="7" ry="5" fill="#7bc67e" />
        </g>
      )
  }
}
