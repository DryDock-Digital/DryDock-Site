# Drydock — marketing site

Single-page marketing site for **Drydock**, the React + Supabase production-readiness
service. One conversion goal: get a worried founder to book a $750 audit.

Stack: **Vite + React + TypeScript + Tailwind CSS**. Deploys to **Vercel** as a static site.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

- `npm run build` — typecheck + production bundle to `dist/`
- `npm run preview` — serve the production build locally
- `npm run typecheck` — `tsc --noEmit`

---

## The booking flow (no automatic payments)

The site does not charge for anything. Every "book" CTA drops the visitor onto the inline
**Calendly** embed (`#book`). After the free 20-min intro call, you decide together whether the
audit is a fit — if so, you send a $750 invoice manually. This is reflected in copy across the
hero, header, sample-report footer, pricing, How-it-works, FAQ, and final CTA.

## Wire up the integrations

All endpoints live in [`src/constants.ts`](src/constants.ts):

| Constant                | What it does                                                                          | Currently                              |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| `CALENDLY_URL`          | The inline Calendly embed in the booking section                                      | `calendly.com/hello-drydock/30min`     |
| `LEAD_FORM_ENDPOINT`    | POST target for the lead form                                                         | Formspree `xbdeyrzk`                   |
| `TRIAGE_FORM_ENDPOINT`  | POST target for the emergency triage form                                             | Formspree `xjgdrbaa`                   |
| `SAMPLE_REPORT_URL`     | Sample audit report PDF (link in hero/footer)                                         | Drop the file in `public/`             |
| `CONTACT_EMAIL`         | Single email all comms route to                                                       | `hello@drydock.digital`                |
| `EMERGENCY_EMAIL`       | Alias of `CONTACT_EMAIL` — kept separate so you can split the inbox later             | same as `CONTACT_EMAIL`                |
| `BOOK_HREF`             | In-page anchor every "book" CTA uses (drops the visitor on the Calendly embed)        | `#book`                                |

### Calendly

The booking section uses Calendly's official inline-embed widget (no npm dep — loaded from
their CDN). It picks up `CALENDLY_URL` and renders an iframe themed to the Linen palette
(`primary_color=BC6038`, `text_color=2C241B`, `background_color=FCF8F1`). While `CALENDLY_URL`
contains the `YOUR-CALENDLY-HANDLE` placeholder, an inline note is shown instead of the embed.

### Forms (mailto fallback by default)

The lead form and the emergency triage form both go through
[`src/lib/submitForm.ts`](src/lib/submitForm.ts). If `LEAD_FORM_ENDPOINT` is still the
placeholder, submission opens the user's email client with a pre-filled message to
`CONTACT_EMAIL` — so every form on the site reaches `hello@drydock.digital` with **zero**
backend setup.

To switch to a real HTTP endpoint:

1. Create a form (Formspree, Basin, Web3Forms, etc.) configured to deliver to `hello@drydock.digital`.
2. Replace `LEAD_FORM_ENDPOINT` with the endpoint URL.
3. The submit helper auto-detects the change and switches from mailto to a JSON POST.

---

## Deploy to Vercel

This is a plain Vite SPA — Vercel detects it automatically.

1. Push to GitHub.
2. **Import Project** in Vercel.
3. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
4. No env vars required for v1 (integration endpoints are public constants).
5. Add `drydock.digital` as the production domain.

A `vercel.json` is included with sensible long-cache headers for static assets.

---

## Project layout

```
.
├── index.html               # SEO/OG tags, Google Fonts
├── public/
│   └── favicon.svg          # Brand mark on navy tile
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Section order lives here
│   ├── index.css            # Tailwind + .btn-primary / .card / .eyebrow / .waterline
│   ├── constants.ts         # Stripe / Calendly / form endpoint / emails
│   ├── lib/
│   │   └── submitForm.ts    # POST to endpoint OR mailto fallback to CONTACT_EMAIL
│   ├── hooks/
│   │   ├── usePageInteractions.ts  # html.anim, scroll progress, reveal-on-scroll, triage route
│   │   └── useGaugeAndCounter.ts   # animated SVG gauge + count-up helpers
│   └── components/
│       ├── SiteHeader.tsx
│       ├── Logo.tsx         # Mark SVG, recolored via CSS for header/footer/triage
│       ├── Hero.tsx         # Centered hero + dark scan panel + waterline wave
│       ├── Problem.tsx      # Stat banner (45%) + 4 hairline-grid cards
│       ├── Emergency.tsx    # Amber strip — opens the triage view
│       ├── WhatWeDo.tsx     # Numbered process flow (01/02/03)
│       ├── SampleReport.tsx # Centerpiece — gauge, before/after, filters, expandable findings
│       ├── WhyDrydock.tsx   # 2-column editorial (sticky intro + hairline list)
│       ├── SocialProof.tsx  # Honest placeholder; fill in real testimonials
│       ├── Pricing.tsx
│       ├── HowItWorks.tsx
│       ├── FAQ.tsx
│       ├── FinalCTA.tsx     # Headline + Calendly embed + lead form
│       ├── CalendlyEmbed.tsx   # Inline Calendly widget themed to Linen
│       ├── LeadForm.tsx
│       ├── Triage.tsx       # Dedicated /#triage view
│       └── Footer.tsx
├── tailwind.config.js       # Brand tokens (navy/teal/cyan/fog/severity colors)
└── vercel.json
```

## Brand tokens

The design system is **CSS-variable-driven** (see `:root` in [`src/index.css`](src/index.css)).
Linen is the locked palette; to reskin, change the tokens once and the whole site follows.

- Surface: `--bg` `#F6F0E7` (warm cream) · `--bg-2` `#FCF8F1` · `--panel` `#FFFFFF`
- Ink: `--ink` `#2C241B` · `--ink-2` `#5E5345` · `--ink-3` `#978872`
- Accent (clay): `--teal` `#BC6038` · `--cyan` `#CE744A`
- Severity (audit report): `--hazard` `#F2727F` · `--buoy` `#F2A33C` · `--caution` `#F4CE5E` · `--sea` `#3CC98A`
- Fonts: `--display` and `--sans` = Geist · `--mono` = Geist Mono

The hero code panel and the triage view scope their own dark token set (`.scanpanel, .triage`)
so they read as elegant insets against the warm Linen page.

## Extending toward `/blog`

Routing is intentionally not installed (one-page site). When you're ready for `/blog`, add
`react-router-dom`, lift the current single page to a `<Home>` route, and add a `<Blog>` route
that reads MDX or markdown files from `src/content/`.
