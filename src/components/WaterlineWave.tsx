import { useEffect, useRef } from 'react'

/**
 * A multi-layer animated waterline — quiet ambient motion in the background
 * of a section. Two filled wave layers drift at different phases for depth,
 * with a thin stroke line on top. Color follows the active accent (`--teal`,
 * which is clay on the Linen palette).
 *
 * Respects prefers-reduced-motion (renders a still curve and skips rAF).
 */
const W = 1440
const SVG_H = 100

export function WaterlineWave({ className = '' }: { className?: string }) {
  const back = useRef<SVGPathElement>(null)
  const front = useRef<SVGPathElement>(null)
  const line = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const baseY = 56
    let phase = 0
    let stopped = false

    function build(offset: number, amp: number, closed: boolean) {
      const segs = 6
      const step = W / segs
      const p = phase + offset
      let d = `M0,${(baseY + Math.sin(p) * amp).toFixed(1)}`
      for (let i = 1; i <= segs; i++) {
        const x = i * step
        const y = baseY + Math.sin(p + i * 0.9) * amp
        const cx = x - step / 2
        const cy = baseY + Math.sin(p + (i - 0.5) * 0.9) * amp * 1.4
        d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`
      }
      if (closed) d += ` L${W},${SVG_H} L0,${SVG_H} Z`
      return d
    }

    function frame() {
      if (stopped) return
      phase += 0.012
      if (back.current) back.current.setAttribute('d', build(0, 11, true))
      if (front.current) front.current.setAttribute('d', build(1.7, 7, true))
      if (line.current) line.current.setAttribute('d', build(0, 11, false))
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
    return () => {
      stopped = true
    }
  }, [])

  return (
    <div className={`waterline-wave ${className}`.trim()} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${SVG_H}`} preserveAspectRatio="none">
        {/* Back layer — larger amplitude, soft fill */}
        <path ref={back} d="" className="wl-back" />
        {/* Front layer — smaller amplitude, slightly more opaque */}
        <path ref={front} d="" className="wl-front" />
        {/* Crisp surface line */}
        <path ref={line} d="" className="wl-line" />
      </svg>
    </div>
  )
}
