import { useEffect } from 'react'
import { Link } from '../../lib/router'
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
  const CTA = post.CTA

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

            {/* End-of-post conversion block — copy lives in the post's CTA component */}
            <CTA />
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
