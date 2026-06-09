import { BlogCTA } from '../components/blog/BlogCTA'
import { Link } from '../lib/router'

/** External-link shortcut — always opens in a new tab with proper rel. */
function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

/**
 * Body of the "Supabase API Key Exposed?" blog post.
 * Covers anon vs service_role, how to check exposure, and the rotate/migrate fix.
 */
export function SupabaseAPIKeyExposedPost() {
  return (
    <>
      <p>
        If your Supabase API key is exposed, the only question that matters is <em>which</em>{' '}
        key. Supabase gives your app two, and the gap between them is the gap between
        &ldquo;perfectly safe&rdquo; and &ldquo;anyone can download my entire database.&rdquo; If
        you built your app with Lovable, Bolt, v0, or Cursor, one of these keys is already wired
        into your frontend, and it is worth five minutes to confirm the tool picked the right
        one. No judgment here. This is one of the most common mix-ups in AI-built React and
        Supabase apps, and it is genuinely easy to fix once you know what you are looking at.
      </p>
      <p>Let&rsquo;s make this simple.</p>

      <h2>anon vs service_role key: which one is dangerous</h2>
      <p>There are two keys, and only one of them belongs in your browser.</p>
      <p>
        <strong>The anon key (newer projects call it the &ldquo;publishable&rdquo; key).</strong>{' '}
        This one is designed to live in your app&rsquo;s browser code. It is public on purpose,
        and on its own it cannot do much harm, as long as Row Level Security is protecting your
        tables (more on that in a second). Shipping this key is normal and fine.
      </p>
      <p>
        <strong>The service_role key (newer projects call it the &ldquo;secret&rdquo; key).</strong>{' '}
        This one is the master key. It <strong>bypasses all your security rules</strong> and can
        read, change, or delete anything in your database. Per{' '}
        <Ext href="https://supabase.com/docs/guides/api/api-keys">Supabase&rsquo;s own docs</Ext>,
        it is meant to live only on a server, inside a Supabase Edge Function or your own
        backend, and <strong>never</strong> in code that reaches a browser.
      </p>
      <p>
        The catastrophe is when the service_role key ends up in your frontend. At that point it
        does not matter how well you have configured everything else. Anyone who opens your app
        can lift that key and own your database. Row Level Security gives you zero protection
        here, because the service_role key is built to ignore it.
      </p>

      <h2>Is the Supabase anon key safe to expose?</h2>
      <p>
        Yes, with one condition. The anon key is public by design, and Supabase intends for it to
        ship in your browser. Its safety does not come from secrecy. It comes from Row Level
        Security doing its job on every table.
      </p>
      <p>
        That condition is not optional. In 2025, a disclosed vulnerability (
        <Ext href="https://www.superblocks.com/blog/lovable-vulnerabilities">
          CVE-2025-48757
        </Ext>
        ) showed what happens when it is skipped: researchers found that 170-plus Lovable-built
        apps had tables readable by anyone holding the public anon key, exposing emails,
        addresses, and payment details. The keys were not the problem. Missing RLS was. So the
        anon key in your browser is fine, as long as RLS is actually on and actually correct. (
        <Link to="/blog/supabase-rls-not-working">Here is how to check and fix RLS.</Link>)
      </p>

      <h2>Why this happens in AI-built apps</h2>
      <p>
        It usually comes down to environment variables. In a typical React and Vite app, any
        variable prefixed with <code>VITE_</code> gets bundled into the code shipped to the
        browser. In Next.js, it is <code>NEXT_PUBLIC_</code>. If the service_role key gets stored
        under one of those prefixes, an easy mistake for a tool that is racing to make things
        &ldquo;just work,&rdquo; it quietly travels all the way to your users&rsquo; browsers.
      </p>
      <p>
        This is not a sign you did anything wrong. It is a default that bites a lot of people,
        and it is exactly the kind of thing a fast code generator gets wrong without flagging it.
      </p>

      <h2>How to check if your Supabase key is exposed in 5 minutes</h2>

      <p>
        <strong>Check 1: Your app in the browser.</strong>
      </p>
      <ol>
        <li>Open your live app in Chrome.</li>
        <li>
          Right-click, choose <strong>Inspect</strong>, then open the <strong>Sources</strong>{' '}
          tab (or the <strong>Network</strong> tab and reload).
        </li>
        <li>
          Hit <code>Cmd/Ctrl + F</code> to search the loaded files for: <code>service_role</code>
        </li>
        <li>
          Also search for <code>secret</code>, <code>sb_secret_</code>, and <code>eyJ</code>{' '}
          (legacy Supabase keys are long strings that start with <code>eyJ</code>; newer secret
          keys start with <code>sb_secret_</code>).
        </li>
      </ol>
      <p>If you find the service_role or secret key in there, it is exposed.</p>

      <p>
        <strong>Check 2: Your code and environment variables.</strong>
      </p>
      <ul>
        <li>
          Search your project for <code>service_role</code> and <code>SERVICE_ROLE</code>.
        </li>
        <li>
          Look at how your keys are named. Anything like{' '}
          <code>VITE_SUPABASE_SERVICE_ROLE_KEY</code> or <code>NEXT_PUBLIC_...SERVICE...</code> is
          a problem. That prefix makes it public.
        </li>
      </ul>

      <p>
        <strong>Check 3: Your repository.</strong>
      </p>
      <ul>
        <li>
          Make sure your <code>.env</code> file is in <code>.gitignore</code> and was never
          committed. If your repo is public (or ever was), search its history for the key too.
          Git keeps the full history, so a key you deleted last month can still be sitting in an
          old commit.
        </li>
      </ul>

      <h2>How to rotate a Supabase service_role key (the emergency fix)</h2>
      <p>
        If the service_role key is exposed, treat it as a live incident and work in this order.
      </p>
      <ol>
        <li>
          <strong>Replace the key immediately.</strong> Open the Supabase dashboard, go to{' '}
          <strong>Settings</strong> then <strong>API Keys</strong>. If you are on the newer
          publishable and secret keys, create a fresh <code>sb_secret_</code> key, swap it in,
          then delete the compromised one. If you are still on the legacy keys, note that legacy{' '}
          <code>anon</code> and <code>service_role</code> keys can no longer be rotated in place.
          The current path is to{' '}
          <Ext href="https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys">
            migrate to the new publishable and secret keys
          </Ext>{' '}
          and disable the legacy ones, which invalidates the leaked key. (See{' '}
          <Ext href="https://supabase.com/docs/guides/troubleshooting/rotating-anon-service-and-jwt-secrets-1Jq6yd">
            Supabase&rsquo;s guide to rotating secrets
          </Ext>{' '}
          for the exact steps.) Heads up: this will break anything currently using the old key.
          That is expected, and you will update those next.
        </li>
        <li>
          <strong>
            Remove it from all frontend code and any <code>VITE_</code> or{' '}
            <code>NEXT_PUBLIC_</code> variables.
          </strong>{' '}
          The browser should only ever see the anon or publishable key.
        </li>
        <li>
          <strong>Move privileged operations to the server.</strong> Anything that genuinely
          needs the secret key (admin tasks, trusted server logic) belongs in a Supabase Edge
          Function or your backend, where the key stays secret. The frontend calls that function
          with the public key.
        </li>
        <li>
          <strong>Confirm RLS is on</strong> for your tables, so the public key alone cannot be
          abused. (
          <Link to="/blog/supabase-rls-not-working">Here is how to check and fix RLS.</Link>)
        </li>
        <li>
          <strong>Assume the old key was seen.</strong> If it was public for a while, treat any
          data it could reach as potentially accessed, and respond accordingly.
        </li>
      </ol>

      <h2>How to keep it from happening again</h2>
      <ul>
        <li>
          Only the <strong>anon or publishable</strong> key goes anywhere near the browser.
        </li>
        <li>
          The <strong>service_role or secret</strong> key lives server-side only, never in a
          client-exposed environment variable.
        </li>
        <li>
          Keep <code>.env</code> out of your repo, always.
        </li>
        <li>
          Let RLS, not the secrecy of the public key, be what actually protects your data.
        </li>
      </ul>

      <h2>FAQ</h2>

      <h3>Is it safe to put a Supabase API key in the frontend?</h3>
      <p>
        Only the anon or publishable key. That one is meant to be public and ships in the browser
        by design. The service_role or secret key must never reach the frontend, because it
        bypasses every security rule and gives full access to your database.
      </p>

      <h3>What can someone do with my service_role key?</h3>
      <p>
        Everything. The service_role key ignores Row Level Security, so anyone holding it can
        read, edit, or delete any row, any table, and your storage buckets. An exposed
        service_role key is effectively root access to your data.
      </p>

      <h3>Can someone steal my anon key, and does it matter?</h3>
      <p>
        They can copy it from your app, and that is fine, as long as RLS is configured correctly
        on every table. The anon key is public by design. The thing that actually protects your
        data is RLS, not hiding the key.
      </p>

      <h3>What is the difference between Supabase publishable and secret keys?</h3>
      <p>
        They are the new names for the same two roles. The publishable key (
        <code>sb_publishable_...</code>) replaces the anon key and is safe for the browser. The
        secret key (<code>sb_secret_...</code>) replaces the service_role key and stays
        server-side only. Supabase is phasing out the legacy <code>eyJ...</code> keys, so newer
        projects use these names.
      </p>

      <h3>I committed my service_role key to GitHub. What now?</h3>
      <p>
        Treat it as compromised even if the repo is private. Replace the key (or migrate to new
        keys and disable the legacy ones), pull the key out of your code and environment
        variables, and assume anything it could reach was seen. Deleting the commit is not
        enough, because the key still lives in your Git history.
      </p>
    </>
  )
}

export function SupabaseAPIKeyExposedCTA() {
  return (
    <BlogCTA
      heading="Not sure you caught everything?"
      micro="No judgment. We've seen this exact issue a hundred times, and it's always fixable."
      footer={
        <p>
          <em>
            If your key is exposed right now and you need it handled fast, we also offer{' '}
            <Link to="/triage">48-hour emergency triage</Link>. No judgment. Let&rsquo;s just get
            it locked down.
          </em>
        </p>
      }
    >
      <p>
        Exposed keys usually travel in a pack with other issues: RLS gaps, unverified payments,
        auth that is only enforced in the UI. If you would like a senior engineer to check the
        whole app, not just the keys, that is exactly what we do.
      </p>
      <p>
        <strong>Drydock&rsquo;s Production-Readiness Audit</strong> reviews your entire React and
        Supabase app against every common failure mode and gives you a clear, plain-English
        report in 3 business days. <strong>$750</strong>, credited in full toward any fix if you
        decide to have us handle it.
      </p>
    </BlogCTA>
  )
}
