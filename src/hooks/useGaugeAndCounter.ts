import { useEffect, useRef } from 'react'

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

/** Count up an integer with an eased ramp. */
export function animateCount(
  el: HTMLElement,
  target: number,
  opts: { dur?: number; from?: number; prefix?: string; suffix?: string; snap?: boolean } = {},
) {
  const { dur = 1200, from = 0, prefix = '', suffix = '', snap = false } = opts
  if (snap) {
    el.textContent = prefix + target + suffix
    return
  }
  const start = performance.now()
  function frame(now: number) {
    const t = Math.min(1, (now - start) / dur)
    const val = Math.round(from + (target - from) * ease(t))
    el.textContent = prefix + val + suffix
    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

/** Animate a stroke-dashoffset circular gauge to a 0–100 score. */
export function setGauge(
  circle: SVGCircleElement,
  score: number,
  radius: number,
  opts: { snap?: boolean } = {},
) {
  const C = 2 * Math.PI * radius
  circle.style.strokeDasharray = C.toFixed(1)
  const offset = C * (1 - score / 100)
  circle.style.transition = opts.snap
    ? 'none'
    : 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease'
  // force reflow then set
  void circle.getBoundingClientRect()
  circle.style.strokeDashoffset = offset.toFixed(1)
  circle.style.stroke = score >= 80 ? '#2FB67A' : score >= 50 ? '#F4CE5E' : '#F2A33C'
}

/** Run `cb` once the element enters the viewport by `ratio`. Returns a ref to attach. */
export function useOnceInView(cb: () => void, ratio = 0.3) {
  const ref = useRef<HTMLElement | null>(null)
  const fired = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    function check() {
      if (fired.current) return
      const r = el!.getBoundingClientRect()
      if (r.height === 0) return
      const vh = window.innerHeight
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0)
      if (visible > 0 && visible / Math.min(r.height, vh) >= ratio) {
        fired.current = true
        cb()
      }
    }
    document.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    // run after layout settles + a failsafe
    requestAnimationFrame(check)
    const t1 = window.setTimeout(check, 300)
    const t2 = window.setTimeout(() => {
      if (!fired.current) {
        fired.current = true
        cb()
      }
    }, 1800)
    return () => {
      document.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [cb, ratio])
  return ref
}
