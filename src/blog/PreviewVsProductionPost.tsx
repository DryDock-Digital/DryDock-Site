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
 * Body of "Your Lovable App Works in Preview but Breaks in Production. Here Is Why" —
 * seven concrete causes (env vars first), how to debug, FAQ.
 */
export function PreviewVsProductionPost() {
  return (
    <>
      <p>
        Few things are more frustrating than an app that works flawlessly in the preview window
        and then breaks the moment it is live. Blank screen, login that loops, features that
        500, data that will not load. You changed nothing, and yet.
      </p>
      <p>
        If your Lovable, Bolt, or Cursor app works in preview but not in production, you are not
        doing anything wrong. Preview and production are genuinely different environments, and AI
        builders optimize for the preview working, not for the handful of things that differ once
        you deploy. Here are the real reasons, most common first, and exactly how to fix each
        one.
      </p>

      <h2>1. Environment variables (the number one cause)</h2>
      <p>
        This is behind most &ldquo;works in preview, breaks in prod&rdquo; reports. Your app
        reads configuration from environment variables: your Supabase URL, your keys, your Stripe
        key, and so on. When those are missing or wrong in production, the app reaches for values
        that are not there and falls over.
      </p>
      <p>Three things make this sneaky:</p>
      <ul>
        <li>
          <strong>They are baked in at build time.</strong> Variables like <code>VITE_...</code>{' '}
          or <code>NEXT_PUBLIC_...</code> get inlined into your app when it is built, not read
          live. So changing one in your dashboard does nothing until you redeploy (
          <Ext href="https://vercel.com/docs/environment-variables/framework-environment-variables">
            Vercel docs
          </Ext>
          ).
        </li>
        <li>
          <strong>They are scoped per environment.</strong> A variable set only for Production
          reads as undefined in Preview deployments, and the other way around. If you added a key
          to one scope and not the other, one environment works and the other breaks.
        </li>
        <li>
          <strong>Local development uses a different file.</strong> Your <code>.env</code> file
          locally is not what production uses. Production uses the values in your host&rsquo;s
          dashboard.
        </li>
      </ul>
      <p>
        <strong>The fix:</strong> make sure every variable your app needs is set in your host
        (for example Vercel) for the right environments, then <strong>redeploy</strong>. After
        any change to an environment variable, redeploy, because a live build never picks up new
        values on its own.
      </p>

      <h2>2. Authentication redirects to the wrong place (or fails)</h2>
      <p>
        If login works in preview but in production it loops, lands on the wrong page, or throws
        an error, the cause is almost always Supabase&rsquo;s URL configuration.
      </p>
      <p>
        Supabase has a <strong>Site URL</strong> and a list of{' '}
        <strong>Additional Redirect URLs</strong>. If the Site URL is still set to{' '}
        <code>http://localhost:3000</code> and your allowed redirect URLs do not include your
        real domain, then after a user logs in or clicks an email confirmation link, Supabase
        sends them somewhere invalid (
        <Ext href="https://supabase.com/docs/guides/auth/redirect-urls">
          Supabase redirect URLs docs
        </Ext>
        ).
      </p>
      <p>
        <strong>The fix:</strong> in your Supabase dashboard under Authentication, then URL
        Configuration:
      </p>
      <ul>
        <li>
          Set the <strong>Site URL</strong> to your production domain (for example{' '}
          <code>https://yourapp.com</code>).
        </li>
        <li>
          Add your production domain, and your preview URLs, to{' '}
          <strong>Additional Redirect URLs</strong>. A wildcard like{' '}
          <code>https://*.vercel.app</code> covers preview deployments.
        </li>
      </ul>
      <p>
        This single setting fixes a large share of &ldquo;login is broken in production&rdquo;
        problems.
      </p>

      <h2>3. Hardcoded localhost or dev URLs</h2>
      <p>
        AI builders sometimes hardcode <code>http://localhost:3000</code> or a specific preview
        URL directly into the code, for an API call, a redirect, or a callback. It works while
        you are on that exact URL and breaks everywhere else.
      </p>
      <p>
        <strong>The fix:</strong> search your code for <code>localhost</code> and for any
        hardcoded preview domain. Replace them with values that come from environment variables
        or that are derived from the current site, so the app uses the right URL in every
        environment.
      </p>

      <h2>4. CORS and API origins</h2>
      <p>
        If your app calls a Supabase Edge Function or another API, that endpoint may be
        configured to allow requests only from <code>localhost</code>. In production, the request
        comes from your real domain, gets blocked, and the feature quietly fails.
      </p>
      <p>
        <strong>The fix:</strong> update the allowed origins (the CORS configuration) on your
        functions and APIs to include your production domain.
      </p>

      <h2>5. It builds differently than it runs in dev</h2>
      <p>
        The preview and your local dev server are forgiving. A real production build is stricter:
        it minifies, removes unused code, and is less tolerant of small mistakes. Things that
        work in dev can break in a production build, including:
      </p>
      <ul>
        <li>
          <strong>Case-sensitive file paths.</strong> Your computer might treat{' '}
          <code>Header.tsx</code> and <code>header.tsx</code> as the same file. The Linux servers
          that build your production app do not. A mismatched import works locally and fails in
          the build.
        </li>
        <li>
          <strong>Missing dependencies.</strong> A package that happens to be installed locally
          but is not properly listed in your project will be absent in production.
        </li>
        <li>
          <strong>Dev-only assumptions.</strong> Code that relied on the dev server&rsquo;s
          behavior may not survive the optimized build.
        </li>
      </ul>
      <p>
        <strong>The fix:</strong> run a real production build on your own machine before you
        deploy (for most projects, <code>npm run build</code> followed by a preview of that
        build). If it breaks locally, you can fix it without guessing in production.
      </p>

      <h2>6. A small difference becomes a blank screen</h2>
      <p>
        Often the underlying problem is minor, but it shows up as a totally blank page because
        the app has no error handling. One missing value throws an error, and with nothing to
        catch it, the whole app white-screens.
      </p>
      <p>
        <strong>The fix:</strong> add error boundaries and proper loading and error states, so a
        small production hiccup shows a useful message instead of taking the entire app down.
        This is one of the items in our{' '}
        <Link to="/blog/vibe-coding-security-audit-7-findings">audit teardown</Link>.
      </p>

      <h2>7. Data behaves differently in production</h2>
      <p>
        Sometimes the app works locally because it is reading data in a way that quietly
        bypasses your security, and in production, with Row-Level Security actually enforced,
        those queries return nothing. The app is not broken so much as it was never reading data
        the safe way. If your data loads locally but is empty in production, check your{' '}
        <Link to="/blog/supabase-rls-not-working">Supabase RLS setup</Link>.
      </p>

      <h2>How to debug it quickly</h2>
      <p>
        When something breaks only in production, three places tell you almost everything:
      </p>
      <ol>
        <li>
          <strong>The browser console and network tab</strong> on the live site. Errors and
          failed requests usually name the exact problem (a missing variable, a blocked request,
          a bad redirect).
        </li>
        <li>
          <strong>Your host&rsquo;s build and function logs</strong> (for example
          Vercel&rsquo;s deployment and function logs). A failed build or a crashing function
          shows up here.
        </li>
        <li>
          <strong>A local production build.</strong> Reproduce the production build on your
          machine. If it breaks there too, you can iterate quickly and safely.
        </li>
      </ol>

      <h2>Frequently asked questions</h2>

      <h3>Why does my app work in preview but not in production?</h3>
      <p>
        The most common reason by far is environment variables that are missing, scoped to the
        wrong environment, or not redeployed. After that come auth redirect URLs, hardcoded
        localhost values, CORS, and differences between the dev server and a real production
        build.
      </p>

      <h3>I changed an environment variable but nothing changed. Why?</h3>
      <p>
        Variables like <code>VITE_</code> and <code>NEXT_PUBLIC_</code> are baked in when the
        app is built. A live deployment will not pick up the new value until you redeploy.
        Always redeploy after changing one.
      </p>

      <h3>My login works locally but breaks after deploying.</h3>
      <p>
        Set your Supabase Site URL to your production domain and add your real domain (and
        preview URLs) to the Additional Redirect URLs. A localhost Site URL is the usual
        culprit.
      </p>

      <h3>Why is my production app just a blank white screen?</h3>
      <p>
        Something threw an error and there was nothing to catch it. The root cause is often
        small (a missing variable), but with no error boundaries the whole app goes blank. Fix
        the underlying issue and add error handling so it fails gracefully next time.
      </p>

      <h3>How do I test production behavior before deploying?</h3>
      <p>
        Run a real production build locally (commonly <code>npm run build</code> then preview
        it). The optimized build catches issues the dev server hides, like case-sensitive
        imports and missing dependencies.
      </p>
    </>
  )
}

export function PreviewVsProductionCTA() {
  return (
    <BlogCTA
      heading="Rather not chase production bugs yourself?"
      micro="No judgment. Preview-vs-production is one of the most common things we sort out."
    >
      <p>
        &ldquo;Works in preview, breaks in production&rdquo; is usually a symptom of a few
        config and hardening gaps rather than one big bug. If you&rsquo;d like a senior engineer
        to get your app deploying cleanly and ready for real users, that&rsquo;s what we do.
      </p>
      <p>
        <strong>Drydock&rsquo;s Production-Readiness Audit</strong> takes your app from
        &ldquo;works in the demo&rdquo; to genuinely production-ready. A senior engineer reviews
        the whole app and hands you a plain-English report in 3 business days.{' '}
        <strong>$750</strong>, credited toward any fix.
      </p>
    </BlogCTA>
  )
}
