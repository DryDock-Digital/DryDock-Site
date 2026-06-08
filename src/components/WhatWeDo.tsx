// "What we do" — numbered process flow (not card grid).
// Per the design: distinct from pricing's tier cards by being a horizontal
// row stack with big light step numbers, hairline separators, and the price
// de-emphasized to the right.

type Service = {
  num: string
  Icon: () => JSX.Element
  title: string
  body: string
  price: string
  meta: string
}

const Search = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)
const WrenchTwist = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6a2 2 0 1 0 3 3l6-6a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-.6-.6-2.4 2.3-2.3z" />
  </svg>
)
const Tool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 1 0-2.8l.8-.8a2 2 0 0 0 0-2.8L13 .8" />
    <path d="M21 3 9 15l-3 3-3-3 3-3" />
  </svg>
)

const services: Service[] = [
  {
    num: '01',
    Icon: Search,
    title: 'Audit',
    body: 'A senior engineer reviews your whole app against the 30+ ways AI-built apps break. You get a clear, plain-English report — what’s wrong, how dangerous it is, and exactly how to fix it.',
    price: '$750',
    meta: '3 business days',
  },
  {
    num: '02',
    Icon: WrenchTwist,
    title: 'Fix',
    body: 'We harden the security, repair the data model, fix the front end, and get you deployed and production-ready. Fixed scope, fixed price, drawn straight from your audit.',
    price: 'From $3,500',
    meta: '1.5–2.5 weeks',
  },
  {
    num: '03',
    Icon: Tool,
    title: 'Keep building',
    body: 'Keep shipping features without breaking things. A fractional senior engineer reviews what you build and keeps it solid.',
    price: 'From $1,500/mo',
    meta: 'Monthly',
  },
]

export function WhatWeDo() {
  return (
    <section className="section bg-white border-y" id="what-we-do">
      <div className="container">
        <p className="eyebrow reveal">What we do</p>
        <h2 className="h-sec reveal">We fix the whole app — not just the database.</h2>
        <p className="lead reveal">
          We don&rsquo;t hand you a PDF of problems and wish you luck. We&rsquo;re React + Supabase
          specialists, and we fix the entire application — front end, back end, security, payments,
          and scale — and hand you back something you can ship with confidence.
        </p>

        <div className="service-grid">
          {services.map((s) => (
            <a className="service-card reveal" href="#pricing" key={s.num}>
              <div className="svc-lead">
                <span className="svc-num">{s.num}</span>
                <div className="ic">
                  <s.Icon />
                </div>
              </div>
              <div className="svc-main">
                <h3>{s.title}</h3>
                <p className="body">{s.body}</p>
              </div>
              <div className="svc-side">
                <div className="price">{s.price}</div>
                <div className="meta">{s.meta}</div>
                <span className="flow">See pricing →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
