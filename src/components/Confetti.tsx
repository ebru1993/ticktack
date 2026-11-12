import { useEffect, useRef } from 'preact/hooks'

const COLORS = ['#ffc53d', '#ef3d5a', '#1f6feb', '#1fa971', '#7b61ff', '#ff7a59', '#fff']

type Bit = { x: number; y: number; vx: number; vy: number; size: number; color: string; spin: number; rot: number }

export function Confetti({ burst }: { burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (burst === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.floor(window.innerWidth * dpr)
    canvas.height = Math.floor(window.innerHeight * dpr)
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`

    const bits: Bit[] = Array.from({ length: 90 }, () => ({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 14 * dpr,
      vy: (-8 - Math.random() * 10) * dpr,
      size: (6 + Math.random() * 8) * dpr,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      spin: Math.random() * 0.3 - 0.15,
      rot: Math.random() * 6,
    }))

    let frame = 0
    let raf = 0
    const tick = () => {
      frame += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const bit of bits) {
        bit.vy += 0.28 * dpr
        bit.x += bit.vx
        bit.y += bit.vy
        bit.rot += bit.spin
        ctx.save()
        ctx.translate(bit.x, bit.y)
        ctx.rotate(bit.rot)
        ctx.fillStyle = bit.color
        ctx.fillRect(-bit.size / 2, -bit.size / 4, bit.size, bit.size / 2)
        ctx.restore()
      }
      if (frame < 110) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [burst])

  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}
