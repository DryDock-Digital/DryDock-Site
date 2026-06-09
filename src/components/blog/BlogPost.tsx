import { useEffect } from 'react'
import { Link, navigate } from '../../lib/router'
import { getPostBySlug } from '../../blog/posts'
import { WaterlineWave } from '../WaterlineWave'

type Props = { slug: string }

export function BlogPost({ slug }: Props) {
  const post = getPostBySlug(slug)

  // Update <title>, meta description, and OG tags per post.
  useEffect(() => {
    if (!post) return
    document.title = post.seoTitle
    setMeta('description', post.description)
    setOg('og:title', post.seoTitle)
    setOg('og:description', post.description)
    setOg('og:type', 'article')
    setOg('og:url', `https://drydock.digital/blog/${post.slug}`)
    setMeta('twitter:title', post.seoTitle)
    setMeta('twitter:description', post.description)
  }, [post])

  if (!post) {
    return (
      <main className="blog-page">
        <section className="section">
          <div className="container container-narrow">
            <p className="eyebrow">404</p>
            <h1 className="blog-h1">That post isn&rsquo;t here.</h1>
            <p className="lead">
              It may have moved, or the link may have a typo. Head back to{' '}
              <Link to="/blog">the blog index</Link>.
            </p>
          </div>
        </section>
      </main>
    )
  }

  const Body = post.Body

  return (
    <main className="blog-page">
      <article className="blog-post">
        <header className="section blog-post-header">
          <div className="container container-narrow">
            <Link to="/blog" className="blog-backlink">
              ← Back to blog
            </Link>
            <p className="eyebrow reveal">{post.category}</p>
            <h1 className="blog-h1 reveal">{post.title}</h1>
            <div className="blog-post-meta reveal">
              <span>{formatDate(post.date)}</span>
              <span className="dot-sep" aria-hidden>
                ·
              </span>
              <span>{post.readMinutes} min read</span>
              <span className="dot-sep" aria-hidden>
                ·
              </span>
              <span>By Drydock</span>
            </div>
          </div>
        </header>

        <div className="blog-body">
          <div className="container container-narrow">
            <div className="prose reveal">
              <Body />
            </div>

            {/* End-of-post conversion block — drops the reader on Calendly. */}
            <aside className="blog-cta">
              <div className="blog-cta-inner">
                <p className="eyebrow teal">Production-Readiness Audit</p>
                <h2>Want a second set of eyes on your RLS?</h2>
                <p>
                  Drydock runs a Production-Readiness Audit on React + Supabase apps. A senior
                  engineer reviews your app against every common failure mode, including the exact
                  RLS issue behind CVE-2025-48757, and hands you a plain-English report in 3
                  business days.
                </p>
                <p>
                  It&rsquo;s <strong>$750</strong>, and the full amount comes off the price if you
                  decide to have us fix what we find.
                </p>
                <div className="blog-cta-row">
                  <a
                    href="/#book"
                    className="btn btn-teal"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/#book')
                    }}
                  >
                    Book your audit →
                  </a>
                  <p className="blog-cta-micro">
                    No judgment. We&rsquo;ve seen this exact issue a hundred times, and it&rsquo;s
                    always fixable.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
      <WaterlineWave />
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

function setOg(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
