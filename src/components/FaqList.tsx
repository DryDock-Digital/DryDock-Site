import { useState, type ReactNode } from 'react'

export type FaqItem = { q: string; a: ReactNode }

/**
 * Single-open FAQ accordion, first item open by default (matches the
 * design). Shared by the Refit FAQ and the Shipyard (build) FAQ, which
 * differ only in their items.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="faq-list reveal">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div className={`faq-item ${isOpen ? 'open' : ''}`} key={item.q}>
            <button
              className="faq-q"
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {item.q}
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            <div className="faq-a">
              <div className="faq-a-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
