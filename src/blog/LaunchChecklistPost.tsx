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
 * Body of "The React + Supabase Launch Checklist" — the full pre-launch
 * checklist grouped by area (security, auth, payments, data, reliability,
 * performance, deployment) with a 10-minute self-check and a FAQ.
 */
export function LaunchChecklistPost() {
  return (
    <>
      <p>
        You built something real with AI, and you are close to putting it in front of actual
        users, or an investor. Before you do, it is worth an hour to run through the things that
        are invisible in the demo but decide whether your app survives contact with real people.
      </p>
      <p>
        This is that list. It is written for founders, not engineers, so each item explains what
        to check and why it matters. None of this is meant to scare you. AI builders are
        genuinely great at getting you here, and they simply do not handle this last layer. For
        context: Veracode&rsquo;s{' '}
        <Ext href="https://www.veracode.com/blog/genai-code-security-report/">
          2025 GenAI Code Security Report
        </Ext>{' '}
        found that 45% of AI-generated code shipped with a known security vulnerability, so if a
        few of these items apply to your app, you are in very normal company. Work through them
        and you launch with confidence instead of crossed fingers.
      </p>

      <h2>Security (do these first)</h2>
      <p>These are the items that turn into data leaks and headlines if you skip them.</p>
      <ul>
        <li>
          <strong>Row-Level Security is on for every table with user data.</strong> Without it,
          anyone with your app&rsquo;s public key, which is everyone, can read or change every
          user&rsquo;s data. This is the single most common and most dangerous gap in AI-built
          apps. (<Link to="/blog/supabase-rls-not-working">How to check and fix RLS.</Link>)
        </li>
        <li>
          <strong>No &ldquo;allow everything&rdquo; policies.</strong> A policy that lets
          everyone through is the illusion of security. Make sure each private table has
          specific, owner-scoped rules.
        </li>
        <li>
          <strong>Your secret key is not in the frontend.</strong> The Supabase{' '}
          <code>service_role</code> (secret) key bypasses all security and must never ship to
          the browser. (
          <Link to="/blog/supabase-api-key-exposed">How to check whether your keys are exposed.</Link>
          )
        </li>
        <li>
          <strong>Storage buckets holding private files are set to private.</strong> Public
          buckets mean every uploaded file is reachable by anyone with the link.
        </li>
        <li>
          <strong>No secrets committed to your repo.</strong> Make sure your <code>.env</code>{' '}
          file was never committed and no API keys are sitting in your code or its history.
        </li>
      </ul>

      <h2>Authentication</h2>
      <ul>
        <li>
          <strong>Protected data is protected at the data layer, not just hidden in the UI.</strong>{' '}
          Hiding a &ldquo;members only&rdquo; button does not protect the data behind it if the
          page or API can still be reached directly. Enforce access with security rules and
          server checks.
        </li>
        <li>
          <strong>Your login URLs are set for production.</strong> Set your Supabase Site URL to
          your real domain and allow your production and preview URLs, or login and email links
          will break once you deploy. (
          <Link to="/blog/lovable-app-works-in-preview-not-production">
            Why your app breaks in production.
          </Link>
          )
        </li>
        <li>
          <strong>Email confirmation and sensible session settings are on</strong>, especially
          if you store anything personal.
        </li>
      </ul>

      <h2>Payments (if you charge)</h2>
      <ul>
        <li>
          <strong>Payment results come from verified Stripe webhooks, not the browser.</strong>{' '}
          If your app grants paid access based on a success-page redirect, someone can unlock
          paid features for free. Verify the webhook signature server-side and grant access only
          from verified events. (
          <Link to="/blog/secure-stripe-payments-supabase">
            How to secure Stripe in a Supabase app.
          </Link>
          )
        </li>
        <li>
          <strong>Entitlements are decided server-side.</strong> Do not trust a price or plan
          sent from the browser.
        </li>
        <li>
          <strong>Duplicate events are handled</strong> so a perk or order is never fulfilled
          twice.
        </li>
      </ul>

      <h2>Data and integrity</h2>
      <ul>
        <li>
          <strong>Migrations are tracked</strong>, so your schema changes are repeatable and you
          are not editing the live database by hand.
        </li>
        <li>
          <strong>Every table has a primary key</strong> and your important relationships have
          indexes, so the app stays fast as data grows.
        </li>
        <li>
          <strong>User input is validated</strong> before it is written, both in the app and
          with database constraints, so bad or malicious data cannot corrupt your records.
        </li>
      </ul>

      <h2>Reliability and operations</h2>
      <ul>
        <li>
          <strong>The app does not white-screen on a single error.</strong> Add error boundaries
          and proper loading, empty, and error states so one hiccup does not take down the whole
          experience.
        </li>
        <li>
          <strong>You have error monitoring in production.</strong> A tool like Sentry tells you
          when real users hit failures, instead of finding out through churn.
        </li>
        <li>
          <strong>You have basic logging</strong> on your key server paths, so when something
          goes wrong you can actually diagnose it.
        </li>
      </ul>

      <h2>Performance and scale</h2>
      <ul>
        <li>
          <strong>No N+1 query patterns on your busy pages.</strong> Loops that fire one query
          per row will slow to a crawl as data grows. Batch them into single queries.
        </li>
        <li>
          <strong>Lists are paginated and queries are bounded.</strong> Avoid loading an entire
          growing table at once.
        </li>
        <li>
          <strong>Indexes exist on the columns you filter and join on.</strong> This is what
          keeps response times flat as you scale.
        </li>
      </ul>

      <h2>Deployment and configuration</h2>
      <ul>
        <li>
          <strong>Environment variables are set for every environment and you have redeployed.</strong>{' '}
          Variables are baked in at build time, so a change does nothing until you redeploy. (
          <Link to="/blog/lovable-app-works-in-preview-not-production">More on this.</Link>)
        </li>
        <li>
          <strong>You have run a real production build</strong> and confirmed it works, not
          just the preview.
        </li>
        <li>
          <strong>Your custom domain is live with HTTPS</strong>, and you have set basic
          security headers.
        </li>
      </ul>

      <h2>The 10-minute self-check</h2>
      <p>
        If you only have a few minutes before launch, do these four, because they cover the
        scariest gaps:
      </p>
      <ol>
        <li>
          Open your Supabase Table Editor and confirm RLS is enabled on every table with user
          data.
        </li>
        <li>
          Open your live app&rsquo;s developer tools and search the code for{' '}
          <code>service_role</code> and <code>secret</code>. They should not be there.
        </li>
        <li>
          Confirm any paid access is granted by a verified webhook, not a success-page redirect.
        </li>
        <li>Make sure your Supabase Site URL points to your production domain.</li>
      </ol>
      <p>These four alone prevent the majority of the disasters we see.</p>

      <h2>Frequently asked questions</h2>

      <h3>Is my Lovable app ready to launch?</h3>
      <p>
        It can be, but AI-built apps are usually not safe by default. Work through the security,
        payments, and reliability items above first. The most common blockers are missing
        Row-Level Security, an exposed secret key, and payments that trust the browser.
      </p>

      <h3>What is the most important thing to check before launching?</h3>
      <p>
        Row-Level Security. If it is off, your database is effectively public, which is the
        worst and most common issue. Start there, then exposed keys, then payments.
      </p>

      <h3>Do I need to do all of this before I have users?</h3>
      <p>
        The security and payments items, yes, because the cost of getting them wrong scales with
        the number of users and the sensitivity of their data. Performance items can follow as
        you grow, but the security foundation should be in place before real people show up.
      </p>

      <h3>How do I know if my database is public?</h3>
      <p>
        Check whether Row-Level Security is enabled on your tables. If it is off on tables
        holding user data, anyone with your public key can read them. Here is{' '}
        <Link to="/blog/supabase-rls-not-working">how to check</Link>.
      </p>

      <h3>Can I check all of this myself?</h3>
      <p>
        Much of it, yes, and the linked guides walk you through the big ones. The parts that are
        harder to self-assess are whether your security policies are actually correct and
        whether your architecture will hold up, which is where a second set of expert eyes
        helps.
      </p>
    </>
  )
}

export function LaunchChecklistCTA() {
  return (
    <BlogCTA
      heading="Want a senior engineer to run this for you?"
      micro="No judgment, ever. You got further with AI than most people expect. This is just the last mile."
    >
      <p>
        This checklist is the founder-friendly version of what we do in depth. If you&rsquo;d
        rather have a senior engineer run the complete review and tell you exactly where your
        app stands, that&rsquo;s the audit.
      </p>
      <p>
        <strong>Drydock&rsquo;s Production-Readiness Audit</strong> checks your app against
        every item above and more, then hands you a plain-English report (usually 8 to 14
        findings) in 3 business days. <strong>$750</strong>, and the full amount comes off the
        price if you decide to have us fix what we find.
      </p>
    </BlogCTA>
  )
}
