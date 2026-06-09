import type { ComponentType } from 'react'
import {
  SupabaseAPIKeyExposedCTA,
  SupabaseAPIKeyExposedPost,
} from './SupabaseAPIKeyExposedPost'
import { SupabaseRLSCTA, SupabaseRLSPost } from './SupabaseRLSPost'
import {
  VibeCodingSecurityAuditCTA,
  VibeCodingSecurityAuditPost,
} from './VibeCodingSecurityAuditPost'

/**
 * Blog post registry. To add a new post:
 *   1. Drop a `<Slug>Post.tsx` file in this directory that exports BOTH a
 *      body component and a CTA component
 *   2. Add an entry below with slug, metadata, body, and CTA
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
  /** The end-of-post conversion block, post-specific copy */
  CTA: ComponentType
}

export const posts: BlogPostMeta[] = [
  {
    slug: 'vibe-coding-security-audit-7-findings',
    title:
      'Vibe Coding Security: 7 Things I Found Auditing a Real Lovable App',
    seoTitle:
      'Vibe Coding Security: 7 Things I Found Auditing a Lovable App',
    description:
      'A real, anonymized vibe coding security audit of a Lovable + Supabase app. Seven issues invisible in the demo that would have been a disaster in production, and the fix for each.',
    date: '2026-06-09',
    readMinutes: 6,
    category: 'Audit teardown',
    Body: VibeCodingSecurityAuditPost,
    CTA: VibeCodingSecurityAuditCTA,
  },
  {
    slug: 'supabase-api-key-exposed',
    title: 'Supabase API Key Exposed? anon vs service_role, and the Fix',
    seoTitle: 'Supabase API Key Exposed? anon vs service_role, and the Fix',
    description:
      'Your Supabase service_role key in the frontend hands over your whole database. Learn anon vs service_role, check your app in 5 minutes, and fix it fast.',
    date: '2026-06-09',
    readMinutes: 5,
    category: 'Security',
    Body: SupabaseAPIKeyExposedPost,
    CTA: SupabaseAPIKeyExposedCTA,
  },
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
    CTA: SupabaseRLSCTA,
  },
]

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return posts.find((p) => p.slug === slug)
}
