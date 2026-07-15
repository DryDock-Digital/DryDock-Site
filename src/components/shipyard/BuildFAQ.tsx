import { FaqList, type FaqItem } from '../FaqList'

// Shipyard path — FAQ. Shares the #faq id with the Refit FAQ (only one
// panel is mounted at a time).

const faqs: FaqItem[] = [
  {
    q: 'Do you use AI to build?',
    a: 'Yes, and that should reassure you. Senior engineers driving AI tools with production judgment is the fastest way to build today. You get the speed without the 80% trap: we know exactly where the tools cut corners, because auditing those corners is our other business.',
  },
  {
    q: 'How is this different from hiring an agency?',
    a: 'No project-manager layers, no hourly meter, no six-week discovery phase. You talk directly to the engineer building your product, the price is fixed in writing before we start, and you see working software every week instead of status decks.',
  },
  {
    q: 'Who owns the code?',
    a: 'You do, from the first week. The repo, the Supabase project, and the hosting accounts are all created in your name. If we stopped working together tomorrow, you would lose nothing.',
  },
  {
    q: 'Why React + Supabase and not something else?',
    a: 'Because it is all we do, and that focus is your speed. It is also one of the largest hiring pools in the industry, so when you eventually bring engineering in-house, you will not be stuck with an exotic stack nobody wants to maintain.',
  },
  {
    q: 'I only have a rough idea. Is that enough?',
    a: 'Yes. That is what the discovery call is for: we help you cut the idea down to the smallest version that proves the concept. If you want to test demand before committing to a full build, the two-week Prototype Sprint exists for exactly that.',
  },
  {
    q: 'When do I pay? Is anything charged through the site?',
    a: 'Nothing automatic. After the free discovery call, if we both want to proceed, you approve a written proposal and we invoice per milestone. No deposits through the site, no subscriptions, no surprises.',
  },
  {
    q: 'What happens after launch?',
    a: 'Every build ships with a 14-day warranty. After that you can take the wheel yourself (the docs are written for that), or keep us on as a fractional product team to keep shipping features without breaking things.',
  },
]

export function BuildFAQ() {
  return (
    <section className="section bg-fog" id="faq">
      <div className="container">
        <p className="eyebrow reveal">FAQ</p>
        <h2 className="h-sec reveal">Questions, answered straight.</h2>
        <FaqList items={faqs} />
      </div>
    </section>
  )
}
