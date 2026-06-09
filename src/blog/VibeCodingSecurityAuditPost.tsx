import { BlogCTA } from '../components/blog/BlogCTA'
import { Link } from '../lib/router'

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

/**
 * Body of the "Vibe Coding Security: 7 Things I Found Auditing a Real Lovable App"
 * post — an anonymized teardown of a production-readiness audit.
 */
export function VibeCodingSecurityAuditPost() {
  return (
    <>
      <p>
        A founder came to us recently with an app they were genuinely proud of, and they should
        have been. They had built a working, good-looking SaaS product with Lovable and Supabase,
        landed their first paying users, and were about to do a bigger launch. No engineering
        background. That is a real achievement, and a year ago it would have been impossible.
      </p>
      <p>
        They had one nagging feeling, though:{' '}
        <em>&ldquo;I don&rsquo;t actually know if this thing is safe.&rdquo;</em>
      </p>
      <p>
        That question, &ldquo;is my Lovable app safe,&rdquo; is the whole reason vibe coding
        security matters once real users show up. And in this case the honest answer was no. Not
        because the founder did anything wrong, but because the tools that get you 80% of the way
        there don&rsquo;t handle the part that keeps an app standing once real people (and the
        occasional bad actor) arrive. Here are the seven things we found in this anonymized,
        real audit, shared with permission. If you built with AI on React and Supabase, treat it
        as a checklist to hold your own app against.
      </p>
      <p>
        First, some context so you know this is not a scare story. Veracode&rsquo;s{' '}
        <Ext href="https://www.veracode.com/blog/genai-code-security-report/">
          2025 GenAI Code Security Report
        </Ext>{' '}
        tested over 100 large language models and found that 45% of AI-generated code samples
        failed security tests and introduced OWASP Top 10 vulnerabilities. Bigger, newer models
        were no better. This is not a &ldquo;you&rdquo; problem. It is baked into how these tools
        generate code, which is exactly why a production-readiness pass exists.
      </p>

      <h2>1. The database was wide open (Supabase RLS not enabled)</h2>
      <p>
        The big one. Row-Level Security was off on most tables, which meant anyone with the
        app&rsquo;s public key (which ships in every browser) could read every user&rsquo;s data.
        Personal details, plans, the lot. In the demo it was invisible. From the outside it was a
        download link.
      </p>
      <p>
        This is not a rare edge case. In 2025, security researcher Matt Palmer disclosed{' '}
        <Ext href="https://securityonline.info/cve-2025-48757-lovables-row-level-security-breakdown-exposes-sensitive-data-across-hundreds-of-projects/">
          CVE-2025-48757
        </Ext>
        , a missing-RLS flaw that exposed sensitive data across 170+ Lovable apps, with a CVSS
        severity of 9.3. Same root cause, hundreds of real apps.
      </p>
      <p>
        <strong>Fix:</strong> enable RLS on every table and write policies scoping each row to
        its owner. <em>(More on <Link to="/blog/supabase-rls-not-working">why this happens</Link>.)</em>
      </p>

      <h2>2. The master database key was in the frontend (service_role exposed)</h2>
      <p>
        The Supabase <code>service_role</code> key, the one that bypasses all security, had been
        bundled into the app&rsquo;s browser code via an environment variable. Anyone could have
        lifted it from the JavaScript bundle and taken full control of the database. This is one
        of the most common vibe coding security mistakes, because AI tools happily wire up the
        powerful key to make an example work.
      </p>
      <p>
        <strong>Fix:</strong> rotate the key immediately, remove it from the frontend, and move
        privileged operations server-side.{' '}
        <em>
          (Here&rsquo;s{' '}
          <Link to="/blog/supabase-api-key-exposed">how to check your own keys</Link>.)
        </em>
      </p>

      <h2>3. Anyone could fake a payment (no Stripe webhook verification)</h2>
      <p>
        The app used Stripe, but it never verified that the &ldquo;payment succeeded&rdquo;
        messages actually came from Stripe. It trusted the browser. A technical user could have
        sent a forged success message and unlocked paid features for free, or worse, manipulated
        order records.
      </p>
      <p>
        <strong>Fix:</strong> verify the Stripe webhook signature on the server and grant access
        only from verified events, never from a client-side redirect.
      </p>

      <h2>4. The &ldquo;members only&rdquo; pages were not actually protected (frontend-only auth)</h2>
      <p>
        Premium and admin pages were hidden in the interface, but the data behind them was still
        reachable by anyone who knew the URL or called the API directly. The lock was on the door
        handle, not the door. This is the classic AI-built app trap: the UI looks secure because
        the buttons are hidden, but the data layer never got the same treatment.
      </p>
      <p>
        <strong>Fix:</strong> enforce access at the data layer (RLS plus server checks), not just
        by hiding buttons in the UI.
      </p>

      <h2>5. A storage bucket full of user uploads was public</h2>
      <p>
        Files users had uploaded, some of them personal, sat in a Supabase storage bucket set to
        public. Every file was accessible to anyone with the link, and links are guessable more
        often than people think.
      </p>
      <p>
        <strong>Fix:</strong> set the bucket to private and serve files through signed, expiring
        URLs with proper access rules.
      </p>

      <h2>6. One error could take down the whole app (no error boundaries)</h2>
      <p>
        There were no error boundaries. A single unexpected failure (a bad API response, a
        missing field) would white-screen the entire app for the user, with no graceful recovery.
        Fine in a demo where you only click the happy path. Rough the moment real users do
        unexpected things, which is most of what makes an app production-ready instead of
        demo-ready.
      </p>
      <p>
        <strong>Fix:</strong> add error boundaries and proper loading, empty, and error states so
        one hiccup does not take down the experience.
      </p>

      <h2>7. There was no way to know anything had gone wrong (no monitoring)</h2>
      <p>
        No error monitoring, no logging. If users were hitting failures, or if someone was poking
        at the open database, the founder would have had no idea until it showed up as churn or a
        headline.
      </p>
      <p>
        <strong>Fix:</strong> add error monitoring and basic logging so problems surface early,
        while they are still cheap to fix.
      </p>

      <h2>The part worth sitting with</h2>
      <p>
        Every one of these was invisible in the demo. The app <em>worked</em>. It looked done.
        That is exactly the trap: AI tools are brilliant at producing something that demos
        perfectly and is quietly fragile underneath. None of these issues were the
        founder&rsquo;s fault, and none of them required a rebuild. The foundation was fine. It
        took a focused production-readiness pass to make the app something they could actually
        launch behind without holding their breath.
      </p>
      <p>
        If you built with Lovable, Bolt, v0, or Cursor on React and Supabase, it is worth
        checking your own app against this list.
      </p>

      <h2>Vibe coding security FAQ</h2>

      <h3>Is my Lovable app safe to launch?</h3>
      <p>
        It can be, but it is usually not safe by default. The most common gaps are missing
        Supabase RLS, exposed keys, and unverified payments. None of these are visible in the
        demo, so the only way to know is to check the data layer directly or have someone audit
        it.
      </p>

      <h3>Is vibe coding safe for production?</h3>
      <p>
        Vibe coding is a great way to build the first 80%. The remaining 20% (security, error
        handling, monitoring) is where production readiness lives, and AI tools rarely add it
        unless you ask. Veracode found 45% of AI-generated code introduced OWASP Top 10
        vulnerabilities, so treat a security pass as part of the build, not an optional extra.
      </p>

      <h3>What are the most common vibe-coded app production-ready problems?</h3>
      <p>
        In our audits the same seven keep appearing: RLS not enabled, the service_role key in
        the frontend, no Stripe webhook verification, frontend-only access control, public
        storage buckets, no error boundaries, and no monitoring. All seven are fixable without a
        rebuild.
      </p>

      <h3>How do I know if my Supabase RLS is set up correctly?</h3>
      <p>
        A policy existing is not the same as a policy working. A rule written as{' '}
        <code>USING (true)</code> technically exists but protects nothing. Test it by querying
        your tables with the public anon key as if you were an outside user and confirming you
        cannot read data that is not yours.
      </p>

      <h3>Do I need to rebuild my AI-built app to make it secure?</h3>
      <p>
        Almost never. In this audit and most others, the foundation was sound. The fixes were
        targeted: turn on RLS, move the key server-side, verify webhooks, lock the bucket, add
        error boundaries and monitoring. Days of focused work, not a rebuild.
      </p>
    </>
  )
}

export function VibeCodingSecurityAuditCTA() {
  return (
    <BlogCTA
      heading="Want this kind of teardown on your app?"
      micro="No judgment, ever. You got further with AI than most people expect. Let's make it real."
    >
      <p>
        Drydock runs a Production-Readiness Audit on React + Supabase apps. A senior engineer
        reviews your whole app against every common failure mode (the seven above and the rest)
        and hands you a plain-English report, usually 8 to 14 findings, in 3 business days.{' '}
        <strong>$750</strong>, credited in full toward any fix if you decide to have us handle
        it.
      </p>
    </BlogCTA>
  )
}
