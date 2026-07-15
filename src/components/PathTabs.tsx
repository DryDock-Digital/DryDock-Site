import { type KeyboardEvent, useRef } from 'react'
import { useServicePath, type ServicePath } from '../lib/servicePath'

/**
 * The two-path switcher: a vertical rail of option cards that fills the
 * right half of the hero split. The left half is whichever hero the
 * selected path owns, so the rail is the control that swaps the page.
 *
 * Rendered INSIDE each hero (Hero, BuildHero) rather than around them,
 * because each path owns its own hero layout.
 */
type CardDef = {
  id: ServicePath
  kicker: string
  title: string
  desc: string
  meta: string
}

const CARDS: CardDef[] = [
  {
    id: 'refit',
    kicker: 'Path 01 · Refit',
    title: 'Finish what you built',
    desc: 'You got 80% there with Lovable, Bolt, v0, or Cursor. We audit it, secure it, and take it the last 20% to production.',
    meta: '$750 audit · report in 3 business days',
  },
  {
    id: 'build',
    kicker: 'Path 02 · Shipyard',
    title: 'Build it from scratch',
    desc: 'You bring the idea. A senior crew builds it keel-up to the same production bar our audits enforce. No 80% trap.',
    meta: 'From $12,000 · fixed-price proposal, 4–8 weeks',
  },
]

export function PathTabs() {
  const { path, select } = useServicePath()
  const cardRefs = useRef<Partial<Record<ServicePath, HTMLButtonElement | null>>>({})

  function onSelect(next: ServicePath) {
    select(next, { source: 'tabs' })
    // The rail lives at the top of the hero, so a click almost always
    // happens near the top already. If not, snap back so the newly chosen
    // path opens on its own hero. Instant, not smooth: the panel swap
    // changes page height mid-scroll.
    if (window.scrollY > 140) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }

  // Vertical tablist: Up/Down are primary, Left/Right also accepted.
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    e.preventDefault()
    const next: ServicePath = path === 'refit' ? 'build' : 'refit'
    onSelect(next)
    cardRefs.current[next]?.focus()
  }

  return (
    <div className="path-rail" id="paths">
      <p className="path-rail-label reveal">Two ways into the dock</p>
      <div role="tablist" aria-orientation="vertical" aria-label="Service paths">
        {CARDS.map((c) => {
          const selected = path === c.id
          return (
            <button
              key={c.id}
              ref={(node) => {
                cardRefs.current[c.id] = node
              }}
              type="button"
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={selected}
              aria-controls={`panel-${c.id}`}
              tabIndex={selected ? 0 : -1}
              className="path-card reveal"
              onClick={() => onSelect(c.id)}
              onKeyDown={onKeyDown}
            >
              <span className="kicker">{c.kicker}</span>
              <span className="title">{c.title}</span>
              <span className="desc">{c.desc}</span>
              <span className="meta">{c.meta}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
