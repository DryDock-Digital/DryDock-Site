import { type KeyboardEvent, useRef } from 'react'
import { useServicePath, type ServicePath } from '../lib/servicePath'

/**
 * The two-path switcher: a slim segmented bar that sits directly under the
 * sticky site header (and sticks with it), like a second header. Selecting
 * a path swaps the whole page below, each path bringing its own hero.
 */
type TabDef = {
  id: ServicePath
  num: string
  name: string
  hint: string
}

const TABS: TabDef[] = [
  { id: 'refit', num: '01', name: 'Refit', hint: 'Finish what you built' },
  { id: 'build', num: '02', name: 'Shipyard', hint: 'Build it from scratch' },
]

export function PathTabs() {
  const { path, select } = useServicePath()
  const tabRefs = useRef<Partial<Record<ServicePath, HTMLButtonElement | null>>>({})

  function onSelect(next: ServicePath) {
    select(next, { source: 'tabs' })
    // If the visitor was scrolled down into the old panel, jump back to the
    // top so the newly selected path opens on its own hero. Instant, not
    // smooth: the panel swap changes the page height mid-scroll.
    if (window.scrollY > 140) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }

  // Standard tablist keyboard behavior: arrow keys move + activate.
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next: ServicePath = path === 'refit' ? 'build' : 'refit'
    onSelect(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="paths" id="paths">
      <div className="container">
        <div className="path-tabs" role="tablist" aria-label="Service paths">
          {TABS.map((t) => {
            const selected = path === t.id
            return (
              <button
                key={t.id}
                ref={(node) => {
                  tabRefs.current[t.id] = node
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                className="path-tab"
                onClick={() => onSelect(t.id)}
                onKeyDown={onKeyDown}
              >
                <span className="num">{t.num}</span>
                <span className="name">{t.name}</span>
                <span className="hint">{t.hint}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
