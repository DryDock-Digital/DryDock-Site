import { BlogCTA } from '../components/blog/BlogCTA'

/**
 * Body of the "Supabase RLS Not Working" blog post.
 * Rendered inside the .prose container in BlogPost — see src/index.css for
 * the long-form typography styles.
 */
export function SupabaseRLSPost() {
  return (
    <>
      <p>
        If your Supabase RLS is not working, or you&rsquo;re not sure it&rsquo;s enabled, check
        this today: there&rsquo;s a good chance anyone on the internet can read and possibly
        modify your database.
      </p>
      <p>
        It is not because you did anything wrong. The tool simply didn&rsquo;t enable the one
        setting that prevents it, and it never warned you.
      </p>
      <p>
        Row-Level Security (RLS) is that setting, and when it is off, your data is wide open. The
        good news: it is usually a 20-minute fix. Let&rsquo;s walk through it.
      </p>

      <h2>What Supabase Row-Level Security actually is (in plain English)</h2>
      <p>
        Supabase gives your app a database, and it automatically creates an API so your app can
        read and write to it. That API is reachable from the public internet using a key that
        ships inside your app, which means it is visible to anyone who opens their browser&rsquo;s
        developer tools.
      </p>
      <p>That is by design, and it is fine, as long as Row-Level Security is doing its job.</p>
      <p>
        RLS is the bouncer at the door. With it enabled and configured, the database checks every
        single request and asks: &ldquo;Is this person allowed to see this specific row?&rdquo; A
        user can see their own data, not everyone else&rsquo;s. (Supabase&rsquo;s own docs put it
        plainly: RLS must always be enabled on any table in an exposed schema, which by default is
        the public schema.)
      </p>
      <p>
        With RLS switched off, there is no bouncer. The door is open. Anyone holding that public
        key (which is everyone) can ask the database for all of it, and it hands it over.
      </p>

      <h2>Why AI builders leave RLS off</h2>
      <p>
        AI coding tools are optimized to get you to a working demo fast. In a demo, RLS being off
        is invisible. Everything works, the data shows up, it looks perfect. The problem only
        becomes visible from the attacker&rsquo;s perspective, and the tool has no reason to
        surface it.
      </p>
      <p>
        There is also a real technical reason this slips through. Tables you create in the
        Supabase Table Editor get RLS turned on by default, but tables created through raw SQL or
        the SQL Editor do not. AI builders generate a lot of SQL, so a lot of tables land with the
        bouncer missing.
      </p>
      <p>
        So you ship something that looks finished, and the security hole rides along silently.
        This is not a rare edge case. In May 2025, security researcher Matt Palmer disclosed{' '}
        <strong>CVE-2025-48757</strong>, a critical vulnerability (CVSS 9.3) covering 303
        endpoints across 170 Lovable projects, roughly <strong>10.3 percent</strong> of the apps
        analyzed, where Supabase tables were readable by anyone with the public key.
      </p>
      <p>
        Emails, payment details, and personal data, all dumpable without logging in. The root
        cause was missing or misconfigured RLS.
      </p>

      <h2>Is my Supabase database public? How to check in 2 minutes</h2>
      <p>You can confirm this for yourself in two ways.</p>

      <p>
        <strong>From the dashboard:</strong>
      </p>
      <ol>
        <li>Open your Supabase dashboard, then <strong>Table Editor</strong>.</li>
        <li>
          Look at each table that holds user or sensitive data (<code>users</code>,{' '}
          <code>profiles</code>, <code>orders</code>, <code>messages</code>, anything private).
        </li>
        <li>
          If you see a warning that &ldquo;RLS is disabled&rdquo; or an unlocked indicator on the
          table, that table is exposed.
        </li>
      </ol>

      <p>
        <strong>From the database side.</strong> In the SQL Editor, run:
      </p>
      <pre>
        <code>{`select tablename, rowsecurity
from pg_tables
where schemaname = 'public';`}</code>
      </pre>
      <p>
        Any table where <code>rowsecurity</code> is <code>false</code> is open to the public.
        Supabase also runs a built-in Security Advisor that flags{' '}
        <code>rls_disabled_in_public</code> for you, so check that too.
      </p>

      <h2>How to enable RLS in Supabase (the fix)</h2>

      <p>
        <strong>Step 1: Turn the bouncer on.</strong> For each exposed table:
      </p>
      <pre>
        <code>alter table profiles enable row level security;</code>
      </pre>
      <p>
        Important: enabling RLS with no policies denies all access by default. That is the safe
        starting point, and it is confirmed in Supabase&rsquo;s docs: once RLS is on, no data is
        accessible via the public key until you create policies. Nothing gets through until you
        explicitly allow it.
      </p>

      <p>
        <strong>Step 2: Write a Supabase RLS policy that lets the right people in.</strong> For
        example, &ldquo;a user can read only their own profile&rdquo;:
      </p>
      <pre>
        <code>{`create policy "Users can view their own profile"
on profiles
for select
to authenticated
using ( (select auth.uid()) = user_id );`}</code>
      </pre>
      <p>And to let them update only their own row:</p>
      <pre>
        <code>{`create policy "Users can update their own profile"
on profiles
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );`}</code>
      </pre>
      <p>
        You will repeat this for each table and each action (<code>select</code>,{' '}
        <code>insert</code>, <code>update</code>, <code>delete</code>), matching your app&rsquo;s
        real rules. One detail that trips people up: an UPDATE needs a matching SELECT policy too,
        or it will quietly fail to work as expected.
      </p>

      <h2>Two traps to watch for</h2>
      <ul>
        <li>
          <strong>The &ldquo;allow everything&rdquo; policy.</strong> AI tools sometimes
          &ldquo;fix&rdquo; RLS errors by adding a policy like <code>using ( true )</code>. That
          technically turns RLS on, then waves everyone straight through. It is the illusion of
          security. If you see <code>true</code> in a policy on a private table, that is a red
          flag.
        </li>
        <li>
          <strong>The service_role key in your frontend.</strong> There is a second Supabase key,
          the <code>service_role</code> (or &ldquo;secret&rdquo;) key, that bypasses RLS entirely.
          Per Supabase&rsquo;s API key docs, it uses the <code>BYPASSRLS</code> attribute and is
          meant to live only on a server, never in your app&rsquo;s browser code. If it is in
          your frontend, all the RLS in the world will not help.
        </li>
      </ul>

      <h2>Supabase anon key vs service_role: which one matters here</h2>
      <p>
        This is worth keeping straight, because it is the difference between safe and exposed.
      </p>
      <ul>
        <li>
          <strong>The anon key</strong> (now called the publishable key) is the public one. It is
          safe to ship in your frontend because RLS stands behind it. With RLS off, the anon key
          becomes a skeleton key to your whole database.
        </li>
        <li>
          <strong>The service_role key</strong> (now called the secret key) has full,
          RLS-bypassing access. It belongs only on a server or in an Edge Function, never in the
          browser.
        </li>
      </ul>
      <p>
        So &ldquo;is my anon key public&rdquo; is the wrong question. The anon key is supposed to
        be public. The real question is whether RLS is on behind it.
      </p>

      <h2>Frequently asked questions</h2>

      <h3>Why is my Supabase RLS not working even though I enabled it?</h3>
      <p>
        The most common cause is that RLS is on but you have no policies, so every query returns
        nothing. That is RLS working correctly: deny by default until you write a policy that
        allows access. The second most common cause is the reverse, an overly broad{' '}
        <code>using ( true )</code> policy that lets everyone in. Check that each private table
        has at least one specific, correct policy.
      </p>

      <h3>How do I know if RLS is enabled on a Supabase table?</h3>
      <p>
        Run <code>select tablename, rowsecurity from pg_tables where schemaname = &lsquo;public&rsquo;;</code>{' '}
        in the SQL Editor. A value of <code>true</code> means enabled, <code>false</code> means
        exposed. Or look in the Table Editor for an &ldquo;RLS disabled&rdquo; warning on the
        table.
      </p>

      <h3>Does the Supabase anon key being public mean my app is insecure?</h3>
      <p>
        No. The anon key is designed to be public and ship in your frontend. It only becomes a
        problem when RLS is disabled, because then the key can read and write everything. Keep
        RLS on and the public key is fine.
      </p>

      <h3>Why do Lovable, Bolt, and Cursor apps ship with RLS off?</h3>
      <p>
        AI builders generate tables via raw SQL, and SQL-created tables do not get RLS by default
        the way Table Editor tables do. The tool also has no reason to flag it, because the app
        looks and works fine in a demo. This was the root cause behind CVE-2025-48757.
      </p>

      <h3>Can I just turn on RLS without writing any policies?</h3>
      <p>
        You can, and it is a safe first move because it immediately blocks all public access. But
        your app&rsquo;s real features will break until you add policies that let logged-in users
        reach their own data. Enabling RLS and writing correct policies are two separate steps.
      </p>

      <h2>When to get a second set of eyes</h2>
      <p>
        Turning RLS on is the easy part. Writing policies that are actually correct, ones that do
        not accidentally lock out real users or quietly leave a side door open, is where it gets
        fiddly. Especially across a dozen tables with relationships between them. One wrong{' '}
        <code>using</code> clause and you are either broken or exposed.
      </p>
      <p>
        If you&rsquo;re not completely sure every table, policy, API key, and payment flow is
        locked down correctly, having a second set of eyes can save you from discovering a
        problem after your users do.
      </p>
    </>
  )
}

export function SupabaseRLSCTA() {
  return (
    <BlogCTA
      heading="Want a second set of eyes on your RLS?"
      micro="No judgment. We've seen this exact issue a hundred times, and it's always fixable."
    >
      <p>
        Drydock runs a Production-Readiness Audit on React + Supabase apps. A senior engineer
        reviews your app against every common failure mode, including the exact RLS issue behind
        CVE-2025-48757, and hands you a plain-English report in 3 business days.
      </p>
      <p>
        It&rsquo;s <strong>$750</strong>, and the full amount comes off the price if you decide
        to have us fix what we find.
      </p>
    </BlogCTA>
  )
}
