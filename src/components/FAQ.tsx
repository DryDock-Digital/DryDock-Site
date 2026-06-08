import { useState } from 'react'

const faqs = [
  {
    q: 'Will you judge my code / my AI-built app?',
    a: 'Never. Honestly, we love AI-built apps — they’re why we exist, and you got further than most people expect. Our job is to make it real, not to critique how you got here.',
  },
  {
    q: 'I’m not technical. Will I understand the report?',
    a: 'Yes — that’s the whole point. We write for founders, not engineers. Plain English, ranked by what actually matters, with clear next steps.',
  },
  {
    q: 'What if my app needs a full rebuild?',
    a: 'We’ll tell you honestly. Sometimes the fastest path is rebuilding the foundation, and if so we’ll say so and quote it — but most AI-built apps don’t need that. The audit tells you for sure.',
  },
  {
    q: 'Do you only work with Lovable apps?',
    a: 'We specialize in React + Supabase apps, which covers most apps built with Lovable, Bolt, v0, and Cursor. Not sure what you’ve got? Book an audit and we’ll figure it out together.',
  },
  {
    q: 'What do you need from me to start?',
    a: 'A 20-minute intro call so we can see whether it’s a fit. If we both agree, read access to your code repository and a short description of what the app does. That’s it.',
  },
  {
    q: 'When do I pay? Is there anything charged through the site?',
    a: 'Nothing automatic — the site doesn’t charge you for anything. After our free intro call, if we agree the audit makes sense, we send a single $750 invoice. You pay it, we get to work. No surprise charges, no subscriptions.',
  },
  {
    q: 'Is the $750 really credited?',
    a: 'Yes — in full, toward any fix booked within 14 days of your audit.',
  },
]

export function FAQ() {
  // Single-open accordion, first item open by default (matches the design).
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="section bg-fog" id="faq">
      <div className="container">
        <p className="eyebrow reveal">FAQ</p>
        <h2 className="h-sec reveal">Questions, answered straight.</h2>
        <div className="faq-list reveal">
          {faqs.map((item, i) => {
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
      </div>
    </section>
  )
}
