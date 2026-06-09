import type { ComponentType } from 'react'
import { SupabaseRLSPost } from './SupabaseRLSPost'

/**
 * Blog post registry. To add a new post:
 *   1. Drop a `<Slug>Post.tsx` file in this directory exporting the content component
 *   2. Add an entry below with slug, metadata, and the imported component
 *
 * Order in the array = order shown on the blog index (newest first).
 */
export type BlogPostMeta = {
  /** URL slug after /blog/ */
  slug: string
  /** <title> tag + index card title */
  title: string
  /** Short summary for the index card AND the meta description */
  description: string
  /** ISO date — used for sort + display */
  date: string
  /** Approximate read time in minutes */
  readMinutes: number
  /** Category chip on the index card */
  category: string
  /** Primary SEO title (can be more keyword-heavy than the display title) */
  seoTitle: string
  /** The post body component */
  Body: ComponentType
}

export const posts: BlogPostMeta[] = [
  {
    slug: 'supabase-rls-not-working',
    title: "Supabase RLS Not Working? Why Your Lovable App's Data Might Be Public",
    seoTitle: "Supabase RLS Not Working? Fix Your Lovable App's Exposed Data",
    description:
      "Supabase RLS not working in your Lovable, Bolt, or Cursor app? Your database may be public. Here's how Row-Level Security works and how to lock it down today.",
    date: '2026-06-08',
    readMinutes: 6,
    category: 'Security',
    Body: SupabaseRLSPost,
  },
]

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return posts.find((p) => p.slug === slug)
}
