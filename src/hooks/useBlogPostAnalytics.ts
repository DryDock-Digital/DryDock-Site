import { useEffect } from 'react'
import { track } from '../lib/analytics'

/**
 * Scroll-depth + completion tracking for a blog post.
 *
 * Vercel's built-in analytics already covers "they arrived" (pageviews by
 * path) and "they stayed N seconds" (Engagement tab). This hook adds the
 * piece those don't: how far through the post they actually scrolled.
 *
 * Events fired (each at most once per mount):
 *   blog_post_opened       — { slug }
 *   blog_post_read         — { slug, depth: 25 | 50 | 75 | 100 }
 *   blog_post_completed    — { slug, time_to_complete_seconds }
 *
 * Combined with the auto-tracked pageview + time-on-page, you can derive:
 *   - bounce rate per post (opened but no 25% read)
 *   - finish rate (opened → completed)
 *   - skim vs read time (time_to_complete distribution)
 */
export function useBlogPostAnalytics(slug: string) {
  useEffect(() => {
    if (!slug || typeof window === 'undefined') return

    track('blog_post_opened', { slug })

    const start = performance.now()
    const fired = new Set<number>()
    const MILESTONES = [25, 50, 75, 100] as const

    function check() {
      const article = document.querySelector<HTMLElement>('.blog-post')
      if (!article) return

      const rect = article.getBoundingClientRect()
      const articleTop = rect.top + window.scrollY
      const articleHeight = article.offsetHeight
      // How far into the article the viewport's bottom has reached
      const scrolledInto = window.scrollY + window.innerHeight - articleTop
      const pct = Math.max(
        0,
        Math.min(100, Math.round((scrolledInto / articleHeight) * 100)),
      )

      for (const m of MILESTONES) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m)
          track('blog_post_read', { slug, depth: m })
          if (m === 100) {
            track('blog_post_completed', {
              slug,
              time_to_complete_seconds: Math.round(
                (performance.now() - start) / 1000,
              ),
            })
          }
        }
      }
    }

    document.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    // Initial check — in case the article is shorter than the viewport,
    // or the user lands deep-linked at #some-section.
    requestAnimationFrame(check)
    const t = window.setTimeout(check, 400)

    return () => {
      document.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      window.clearTimeout(t)
    }
  }, [slug])
}
