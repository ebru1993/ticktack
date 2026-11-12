import type { ComponentChildren } from 'preact'
import { periodIcon } from '../logic/clockMath.ts'
import { stickerMeta } from '../logic/stickers.ts'

type IconProps = { children?: ComponentChildren }

function SvgIcon({ children }: { children: ComponentChildren }) {
  return (
    <svg viewBox="0 0 48 48" className="ico" aria-hidden="true">
      {children}
    </svg>
  )
}

export function SpeakerIcon() {
  return (
    <SvgIcon>
      <path d="M8 18h8l10-8v28L16 30H8z" fill="currentColor" />
      <path d="M32 18a8 8 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 12a16 16 0 0 1 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function BackIcon() {
  return (
    <SvgIcon>
      <path d="M30 8 L14 24 L30 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function StarIcon() {
  return (
    <SvgIcon>
      <path d="M24 6l4.8 10.6L40 18.2l-8 7.4L34 38l-10-6-10 6 2-12.4-8-7.4 11.2-1.6z" fill="currentColor" />
    </SvgIcon>
  )
}

export function LockIcon() {
  return (
    <SvgIcon>
      <rect x="12" y="20" width="24" height="18" rx="4" fill="currentColor" />
      <path d="M17 20v-4a7 7 0 0 1 14 0v4" fill="none" stroke="currentColor" strokeWidth="4" />
    </SvgIcon>
  )
}

export function EarIcon() {
  return (
    <SvgIcon>
      <path d="M10 20h8l8-7v22l-8-7h-8z" fill="currentColor" />
      <path d="M32 18a8 8 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 12a14 14 0 0 1 0 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function EyeIcon() {
  return (
    <SvgIcon>
      <path d="M6 24s7-12 18-12 18 12 18 12-7 12-18 12S6 24 6 24z" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="24" cy="24" r="5" fill="currentColor" />
    </SvgIcon>
  )
}

export function CheckIcon() {
  return (
    <SvgIcon>
      <path d="M10 25l9 9 19-20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function ParentIcon() {
  return (
    <SvgIcon>
      <circle cx="24" cy="14" r="6" fill="currentColor" />
      <path d="M10 40c1-8 6-12 14-12s13 4 14 12" fill="currentColor" />
    </SvgIcon>
  )
}

export function AlbumIcon() {
  return (
    <SvgIcon>
      <rect x="8" y="10" width="32" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M8 18h32M20 10v28" stroke="currentColor" strokeWidth="4" />
    </SvgIcon>
  )
}

export function PlayIcon() {
  return (
    <SvgIcon>
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M20 16l14 8-14 8z" fill="currentColor" />
    </SvgIcon>
  )
}

export function ArrowUp() {
  return (
    <SvgIcon>
      <path d="M24 36V12M12 22l12-12 12 12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function ArrowDown() {
  return (
    <SvgIcon>
      <path d="M24 12v24M12 26l12 12 12-12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function PlusIcon() {
  return (
    <SvgIcon>
      <path d="M24 10v28M10 24h28" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function PencilIcon() {
  return (
    <SvgIcon>
      <path d="M30 8l10 10L18 40H8v-10z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function NumbersIcon() {
  return (
    <SvgIcon>
      <rect x="6" y="12" width="16" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="26" y="12" width="16" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M14 20v8M34 20v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function HandsIcon() {
  return (
    <SvgIcon>
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M24 24V12M24 24l8 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function SunMoon({ hour }: { hour: number }) {
  const kind = periodIcon(hour)
  if (kind === 'moon') {
    return (
      <svg viewBox="0 0 64 64" className="period-svg" aria-label="Mond">
        <circle cx="32" cy="32" r="30" fill="#24324a" />
        <path d="M36 12a18 18 0 1 0 16 22 14 14 0 1 1-16-22z" fill="#f4e7a8" />
        <circle cx="22" cy="40" r="2" fill="#f4e7a8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 64" className="period-svg" aria-label="Sonne">
      <circle cx="32" cy="32" r="30" fill="#ffd15c" />
      <circle cx="32" cy="32" r="12" fill="#fff4c2" />
      <g stroke="#ef9f00" strokeWidth="4" strokeLinecap="round">
        <path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6" />
      </g>
    </svg>
  )
}

const HAIR = ['#5b3a29', '#2a211c', '#1a1a1a', '#c47b2b', '#3b2414', '#111', '#4a3428', '#6b3f2a']
const SHIRT = ['#3dbe7a', '#b07cff', '#4aa3ff', '#ff7a59', '#2ec4b6', '#ffd166', '#ef476f', '#118ab2']
const SKIN = ['#ffd1b8', '#f3c6a8', '#e8b896', '#ffd8c2', '#d9a57a', '#c68642', '#8d5524', '#ffcba4']
const BACK = ['#ffe08a', '#ffd0e8', '#c8f0ff', '#ffe1c4', '#fff3b0', '#d6f5d6', '#fde2e4', '#e0f2ff']

export function Avatar({ id, size = 120 }: { id: number; size?: number }) {
  const i = ((id % 8) + 8) % 8
  const long = i % 2 === 1
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="avatar" aria-hidden="true">
      <circle cx="60" cy="60" r="58" fill={BACK[i]} />
      <circle cx="60" cy="78" r="28" fill={SHIRT[i]} />
      {long ? (
        <path d="M34 58c2-28 10-40 26-40s24 12 26 40c-8 10-16 14-26 14s-18-4-26-14z" fill={HAIR[i]} />
      ) : (
        <path d="M36 52c2-22 10-32 24-32s22 10 24 32c-8-8-16-10-24-10s-16 2-24 10z" fill={HAIR[i]} />
      )}
      <circle cx="60" cy="54" r="22" fill={SKIN[i]} />
      {long && <path d="M40 46c2-14 8-20 20-20s18 6 20 20c-6-8-12-10-20-10s-14 2-20 10z" fill={HAIR[i]} />}
      <circle cx="52" cy="50" r="2.4" fill="#1c2742" />
      <circle cx="68" cy="50" r="2.4" fill="#1c2742" />
      <path d="M54 58q6 6 12 0" fill="none" stroke="#1c2742" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Motif({ id }: { id: string }) {
  switch (id) {
    case 'sonne':
      return (
        <g>
          <circle cx="40" cy="40" r="14" fill="#ffb703" />
          <g stroke="#ef9f00" strokeWidth="3" strokeLinecap="round">
            <path d="M40 16v6M40 58v6M16 40h6M58 40h6M23 23l4 4M53 53l4 4M57 23l-4 4M27 53l-4 4" />
          </g>
          <circle cx="35" cy="38" r="1.5" fill="#1c2742" />
          <circle cx="45" cy="38" r="1.5" fill="#1c2742" />
          <path d="M35 44q5 4 10 0" fill="none" stroke="#1c2742" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )
    case 'mond':
      return <path d="M46 18a16 16 0 1 0 14 24A12 12 0 1 1 46 18z" fill="#f4e7a8" />
    case 'vogel':
      return (
        <g>
          <ellipse cx="40" cy="44" rx="16" ry="12" fill="#4aa3ff" />
          <circle cx="52" cy="34" r="8" fill="#4aa3ff" />
          <circle cx="55" cy="33" r="1.5" fill="#1c2742" />
          <path d="M58 36l8 2-8 2z" fill="#ffb703" />
          <path d="M28 40c-8-8-6-2 0 2" fill="none" stroke="#1f6feb" strokeWidth="3" />
        </g>
      )
    case 'blume':
      return (
        <g>
          <circle cx="40" cy="28" r="8" fill="#ff7ab6" />
          <circle cx="28" cy="38" r="8" fill="#ff9ecb" />
          <circle cx="52" cy="38" r="8" fill="#ff9ecb" />
          <circle cx="32" cy="50" r="8" fill="#ff7ab6" />
          <circle cx="48" cy="50" r="8" fill="#ff7ab6" />
          <circle cx="40" cy="40" r="6" fill="#ffc53d" />
        </g>
      )
    case 'regenbogen':
      return (
        <g fill="none" strokeWidth="4" strokeLinecap="round">
          <path d="M16 48a24 24 0 0 1 48 0" stroke="#ef3d5a" />
          <path d="M22 48a18 18 0 0 1 36 0" stroke="#ffb703" />
          <path d="M28 48a12 12 0 0 1 24 0" stroke="#1fa971" />
        </g>
      )
    case 'kafer':
      return (
        <g>
          <circle cx="40" cy="28" r="8" fill="#1c2742" />
          <ellipse cx="40" cy="46" rx="16" ry="14" fill="#ef3d5a" />
          <path d="M40 34v24" stroke="#1c2742" strokeWidth="2" />
          <circle cx="32" cy="44" r="3" fill="#1c2742" />
          <circle cx="48" cy="48" r="3" fill="#1c2742" />
        </g>
      )
    case 'fisch':
      return (
        <g>
          <ellipse cx="36" cy="40" rx="16" ry="10" fill="#2ec4b6" />
          <path d="M50 40l12-10v20z" fill="#1fa2a0" />
          <circle cx="28" cy="38" r="2" fill="#1c2742" />
        </g>
      )
    case 'falter':
      return (
        <g>
          <ellipse cx="28" cy="34" rx="10" ry="12" fill="#b07cff" />
          <ellipse cx="52" cy="34" rx="10" ry="12" fill="#7b61ff" />
          <ellipse cx="30" cy="50" rx="8" ry="8" fill="#ff9ecb" />
          <ellipse cx="50" cy="50" rx="8" ry="8" fill="#ff9ecb" />
          <rect x="38" y="28" width="4" height="24" rx="2" fill="#1c2742" />
        </g>
      )
    case 'apfel':
      return (
        <g>
          <circle cx="40" cy="44" r="16" fill="#ef3d5a" />
          <path d="M40 28c4-8 12-8 12-2" fill="none" stroke="#1fa971" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="34" cy="40" rx="3" ry="5" fill="#fff" opacity="0.45" />
        </g>
      )
    case 'ballon':
      return (
        <g>
          <ellipse cx="40" cy="32" rx="14" ry="16" fill="#7b61ff" />
          <path d="M40 48l-2 10h8l-2-10" fill="#5b45d6" />
          <path d="M40 58c6 4 4 8 0 10" fill="none" stroke="#1c2742" strokeWidth="2" />
        </g>
      )
    case 'wolke':
      return <path d="M24 48h32a10 10 0 0 0 0-20 14 14 0 0 0-26-4A10 10 0 0 0 24 48z" fill="#fff" />
    case 'pilz':
      return (
        <g>
          <path d="M14 40c0-14 12-22 26-22s26 8 26 22z" fill="#ef3d5a" />
          <rect x="32" y="40" width="16" height="16" rx="4" fill="#ffe0c2" />
          <circle cx="28" cy="34" r="3" fill="#fff" />
          <circle cx="48" cy="32" r="3" fill="#fff" />
        </g>
      )
    case 'schildkroete':
      return (
        <g>
          <ellipse cx="40" cy="42" rx="16" ry="12" fill="#1fa971" />
          <circle cx="58" cy="36" r="6" fill="#8d5524" />
          <circle cx="22" cy="50" r="4" fill="#1fa971" />
          <circle cx="58" cy="50" r="4" fill="#1fa971" />
        </g>
      )
    case 'eule':
      return (
        <g>
          <ellipse cx="40" cy="42" rx="16" ry="18" fill="#c47b2b" />
          <circle cx="33" cy="40" r="6" fill="#fff6dd" />
          <circle cx="47" cy="40" r="6" fill="#fff6dd" />
          <circle cx="33" cy="40" r="2" fill="#1c2742" />
          <circle cx="47" cy="40" r="2" fill="#1c2742" />
          <path d="M38 48l2 3 2-3z" fill="#ef9f00" />
        </g>
      )
    case 'herz':
      return <path d="M40 58C18 44 14 32 22 26c6-4 12 0 18 8 6-8 12-12 18-8 8 6 4 18-18 32z" fill="#ef476f" />
    case 'rakete':
      return (
        <g>
          <path d="M40 12c10 8 12 20 12 28H28c0-8 2-20 12-28z" fill="#e8eefc" />
          <circle cx="40" cy="30" r="4" fill="#4aa3ff" />
          <path d="M28 40l-8 10 10-4M52 40l8 10-10-4" fill="#ef3d5a" />
        </g>
      )
    case 'biene':
      return (
        <g>
          <ellipse cx="40" cy="42" rx="14" ry="10" fill="#ffc53d" />
          <path d="M34 34v16M40 32v20M46 34v16" stroke="#1c2742" strokeWidth="2" />
          <ellipse cx="28" cy="34" rx="8" ry="5" fill="#fff" opacity="0.9" />
          <ellipse cx="52" cy="34" rx="8" ry="5" fill="#fff" opacity="0.9" />
          <circle cx="52" cy="42" r="4" fill="#1c2742" />
        </g>
      )
    case 'stern':
      return <path d="M40 14l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z" fill="#ffc53d" />
    case 'frosch':
      return (
        <g>
          <ellipse cx="40" cy="46" rx="16" ry="12" fill="#7bc67e" />
          <circle cx="28" cy="32" r="7" fill="#7bc67e" />
          <circle cx="52" cy="32" r="7" fill="#7bc67e" />
          <circle cx="28" cy="32" r="2.5" fill="#1c2742" />
          <circle cx="52" cy="32" r="2.5" fill="#1c2742" />
          <path d="M34 48q6 5 12 0" fill="none" stroke="#1c2742" strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    default:
      return (
        <g>
          <path d="M40 18c8 0 10 8 10 8s6 2 6 10-6 16-16 16-16-8-16-16 6-10 6-10 2-8 10-8z" fill="#ffd0ea" />
          <circle cx="40" cy="28" r="4" fill="#fff" />
          <rect x="36" y="28" width="8" height="16" fill="#ff9ecb" />
        </g>
      )
  }
}

export function StickerArt({ id, locked = false }: { id: string; locked?: boolean }) {
  const meta = stickerMeta(id)
  return (
    <svg viewBox="0 0 80 80" className={locked ? 'sticker is-locked' : 'sticker'} aria-label={locked ? 'Noch zu' : meta.name}>
      <rect x="4" y="4" width="72" height="72" rx="20" fill={locked ? '#d5dbe6' : meta.bg} />
      {locked ? (
        <text x="40" y="48" textAnchor="middle" fontSize="28" fontWeight="800" fill="#8b97ad">
          ?
        </text>
      ) : (
        <Motif id={id} />
      )}
    </svg>
  )
}

export function IconButton({
  label,
  onClick,
  testId,
  children,
  className = '',
}: {
  label: string
  onClick: () => void
  testId?: string
  children: ComponentChildren
  className?: string
} & IconProps) {
  return (
    <button type="button" className={`icon-btn ${className}`} aria-label={label} data-testid={testId} onClick={onClick}>
      {children}
    </button>
  )
}
