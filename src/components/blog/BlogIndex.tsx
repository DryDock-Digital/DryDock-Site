import { useEffect } from 'react'
import { Link } from '../../lib/router'
import { posts } from '../../blog/posts'

const SITE_TITLE = 'Blog — Drydock'
const SITE_DESC =
  'Practical guides on making React + Supabase apps production-ready — RLS, auth, payments, scale.'

export function BlogIndex() {
  // Update <title> and meta description per route.
  useEffect(() => {
    document.title = SITE_TITLE
    setMeta('description', SITE_DESC)
  }, [])

  return (
    <main className="blog-page">
      <section className="section blog-index">
        <div className="container container-narrow">
          <p className="eyebrow reveal">Blog</p>
          <h1 className="blog-h1 reveal">
            Field notes from the dry dock.
          </h1>
          <p className="lead reveal">
            How AI-built React + Supabase apps break in production, and how to fix them — written
            for founders.
          </p>

          <ul className="blog-list">
            {posts.map((p) => (
              <li key={p.slug} className="blog-card reveal">
                <Link to={`/blog/${p.slug}`} className="blog-card-link">
                  <div className="blog-card-meta">
                    <span className="blog-card-category">{p.category}</span>
                    <span className="blog-card-date">{formatDate(p.date)}</span>
                    <span className="blog-card-read">{p.readMinutes} min read</span>
                  </div>
                  <h2 className="blog-card-title">{p.title}</h2>
                  <p className="blog-card-desc">{p.description}</p>
                  <span className="blog-card-cta">Read the guide →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
