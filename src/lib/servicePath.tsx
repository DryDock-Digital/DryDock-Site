import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { track } from './analytics'

/**
 * The two service paths under the Drydock parent brand:
 *   refit — audit / security / the last 20% of an existing (AI-built) app
 *   build — ground-up "Shipyard" builds from an idea
 *
 * Selected via the PathTabs switcher under the hero. The choice swaps the
 * landing page's section stack (see App.tsx) and the header nav anchors.
 */
export type ServicePath = 'refit' | 'build'

const STORAGE_KEY = 'drydock.path'

// Section ids that exist in exactly one panel. Used to pick the right tab
// when the page loads with a deep-link hash (shared ids like #pricing,
// #how, #faq and #book resolve on either tab).
const REFIT_ONLY_IDS = new Set(['problem', 'what-we-do', 'report', 'why', 'proof'])
const BUILD_ONLY_IDS = new Set(['build-problem', 'build-scope'])

function initialPath(): ServicePath {
  if (typeof window === 'undefined') return 'refit'
  const hash = window.location.hash.slice(1)
  if (BUILD_ONLY_IDS.has(hash) || hash === 'build') return 'build'
  if (REFIT_ONLY_IDS.has(hash) || hash === 'refit') return 'refit'
  try {
    if (window.sessionStorage.getItem(STORAGE_KEY) === 'build') return 'build'
  } catch {
    /* storage blocked — default below */
  }
  return 'refit'
}

type SelectOptions = {
  /** Section id (no '#') to scroll to once the panel has mounted. */
  scrollTo?: string
  /** Where the switch came from, for analytics. */
  source?: string
}

type ServicePathContextValue = {
  path: ServicePath
  select: (next: ServicePath, opts?: SelectOptions) => void
}

const ServicePathContext = createContext<ServicePathContextValue | null>(null)

function jumpTo(id: string) {
  // Instant (not smooth): the panel swap changes the page height mid-scroll,
  // which makes smooth scrolling land short (same reason router.tsx scrolls
  // instantly).
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
}

export function ServicePathProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<ServicePath>(initialPath)

  // Cross-panel anchor jumps have to wait until the target panel has
  // actually mounted, so they're carried out in the effect below (which
  // runs right after the swapped panel commits).
  const pendingScroll = useRef<string | null>(null)

  const select = useCallback(
    (next: ServicePath, opts?: SelectOptions) => {
      if (next !== path) {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, next)
        } catch {
          /* non-fatal */
        }
        track('path_selected', { path: next, source: opts?.source ?? 'tabs' })
        if (opts?.scrollTo) pendingScroll.current = opts.scrollTo
        setPath(next)
      } else if (opts?.scrollTo) {
        // Same panel — the target already exists.
        jumpTo(opts.scrollTo)
      }
    },
    [path],
  )

  useEffect(() => {
    if (pendingScroll.current) {
      jumpTo(pendingScroll.current)
      pendingScroll.current = null
    }
  }, [path])

  return (
    <ServicePathContext.Provider value={{ path, select }}>
      {children}
    </ServicePathContext.Provider>
  )
}

export function useServicePath(): ServicePathContextValue {
  const ctx = useContext(ServicePathContext)
  if (!ctx) throw new Error('useServicePath must be used inside <ServicePathProvider>')
  return ctx
}
