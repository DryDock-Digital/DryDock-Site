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
 * Body of "Can Someone Fake a Payment in Your App? Securing Stripe in a Supabase App"
 * — answers the founder question "are my payments actually safe", walks through the
 * verified-webhook fix in a Supabase Edge Function, plus idempotency + server-side
 * entitlement notes.
 */
export function SecureStripePaymentsPost() {
  return (
    <>
      <p>
        Here is an uncomfortable question to ask about your app: when a user pays, how does your
        app actually know the payment happened? If the honest answer is &ldquo;the page redirected
        to a success URL,&rdquo; then a technical user can unlock your paid features for free,
        and you would never see it coming.
      </p>
      <p>
        This is one of the most common and most expensive mistakes in AI-built apps. The good
        news is that securing Stripe properly is a well-defined job, and once you understand the
        two rules below, it is straightforward. No judgment if your app is currently doing it the
        unsafe way. The tools wire it up that way to make the demo work, and almost nobody catches
        it until someone points it out.
      </p>

      <h2>Why AI-built apps trust the browser (and why that is the bug)</h2>
      <p>
        When you add payments with an AI builder, the flow it generates usually looks like this:
        the user clicks &ldquo;subscribe,&rdquo; Stripe Checkout opens, they pay, and Stripe
        sends them back to a success page in your app. On that success page, the app marks them
        as a paying customer.
      </p>
      <p>
        The problem is that the browser is not trustworthy. The success page is just a URL.
        Anyone can visit it directly, or fake the request that grants access, without ever
        paying. The browser saying &ldquo;the payment worked&rdquo; means nothing, because the
        browser is controlled by the user, not by Stripe.
      </p>
      <p>
        This is the same class of issue as hiding a &ldquo;members only&rdquo; button instead of
        protecting the data behind it. The lock looks real, but it is on the wrong side of the
        door.
      </p>

      <h2>The two rules that make payments safe</h2>
      <ol>
        <li>
          <strong>Trust Stripe, not the browser.</strong> The only thing that should ever grant a
          user paid access is a message that came directly from Stripe&rsquo;s servers and that
          you have verified is genuinely from Stripe. That message is a <strong>webhook</strong>.
        </li>
        <li>
          <strong>Verify the webhook signature, every time.</strong> Stripe signs every webhook
          it sends you. Your job is to check that signature before you act on the event. If the
          signature does not check out, you ignore the request.
        </li>
      </ol>
      <p>
        Get those two right and faking a payment becomes essentially impossible, because an
        attacker cannot forge a Stripe signature.
      </p>

      <h2>How to check if your app is vulnerable</h2>
      <p>
        Look in your code for the place where a user gets upgraded to paid (where you set
        something like <code>is_pro = true</code> or insert a subscription row). Then ask:
      </p>
      <ul>
        <li>
          Is that triggered by the user landing on a success page or by a redirect?{' '}
          <strong>That is the unsafe pattern.</strong>
        </li>
        <li>
          Or is it triggered by a server-side webhook handler that calls Stripe&rsquo;s signature
          verification first? <strong>That is the safe pattern.</strong>
        </li>
      </ul>
      <p>
        If you have a webhook handler, double-check that it actually verifies the signature and is
        not just reading the request body and trusting it. An unverified webhook is barely better
        than the redirect.
      </p>

      <h2>The fix: a verified webhook in a Supabase Edge Function</h2>
      <p>
        The standard, safe setup is a Supabase Edge Function that receives Stripe webhooks,
        verifies the signature, and only then updates your database. Stripe&rsquo;s own guidance
        is to always use their official library&rsquo;s verification method and never to
        hand-roll the check yourself (
        <Ext href="https://docs.stripe.com/webhooks">Stripe webhooks docs</Ext>).
      </p>
      <p>Here is the shape of it:</p>
      <pre>
        <code>{`import Stripe from 'https://esm.sh/stripe?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text() // raw body, do NOT JSON.parse it first

  let event
  try {
    // verify the signature; on Edge/Deno use the async version
    event = await stripe.webhooks.constructEventAsync(body, signature, signingSecret)
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    // Grant access in your database here, keyed to the user
    // (e.g. session.client_reference_id or the customer id).
  }

  return new Response('ok', { status: 200 })
})`}</code>
      </pre>
      <p>A few details that trip people up:</p>
      <ul>
        <li>
          <strong>Use the raw request body.</strong> Signature verification runs against the
          exact bytes Stripe sent. If anything parses the body into JSON before you verify, the
          check will fail. (
          <Ext href="https://docs.stripe.com/webhooks/signature">
            Stripe signature troubleshooting
          </Ext>
          )
        </li>
        <li>
          <strong>Use the right signing secret.</strong> It lives in your Stripe Dashboard under
          Developers, then Webhooks, then your endpoint, then &ldquo;Signing secret.&rdquo; Test
          mode and live mode have different secrets. The most common verification error is using
          the wrong one.
        </li>
        <li>
          <strong>Grant access from the event, not the client.</strong> Update your database
          inside the webhook handler, based on the verified event. Never grant access from the
          success page.
        </li>
      </ul>

      <h2>Two more things worth doing</h2>
      <p>
        <strong>Handle duplicates (idempotency).</strong> Stripe can send the same event more
        than once. If you grant a perk or fulfill an order twice, that is a real problem. Store
        the <code>event.id</code> of every webhook you process, and skip any you have already
        seen.
      </p>
      <p>
        <strong>Validate the amount server-side.</strong> Do not trust a price or plan that came
        from the browser. Decide what the user is entitled to based on what Stripe says they
        actually paid for, not what the client claimed.
      </p>

      <h2>Frequently asked questions</h2>

      <h3>Can someone really fake a payment in my app?</h3>
      <p>
        If your app grants paid access based on a success-page redirect rather than a verified
        Stripe webhook, then yes. A technical user can trigger the &ldquo;you paid&rdquo; path
        without paying. Verifying webhook signatures server-side closes this.
      </p>

      <h3>What is a Stripe webhook signature and why does it matter?</h3>
      <p>
        Stripe signs every webhook with a secret only you and Stripe know. Verifying the
        signature proves the message genuinely came from Stripe and was not forged. It is the
        difference between trusting Stripe and trusting the browser.
      </p>

      <h3>Where do I put the webhook handler in a Supabase app?</h3>
      <p>
        A Supabase Edge Function is the natural home. It runs server-side, can hold your Stripe
        secret key safely, and can write to your database after verifying the event.
      </p>

      <h3>Why does my signature verification keep failing?</h3>
      <p>
        The usual causes are using the wrong signing secret (test vs live), parsing the request
        body before verifying, or pointing the webhook at the wrong endpoint. Use the raw body
        and the exact secret for that endpoint.
      </p>

      <h3>Do I still need this if I use Stripe Checkout?</h3>
      <p>
        Yes. Checkout handles collecting the payment, but your app still has to learn the result
        in a trustworthy way, and that is the verified webhook. The redirect back to your app is
        for the user&rsquo;s experience, not for granting access.
      </p>

      <p style={{ marginTop: 32 }}>
        <em>
          Related reading:{' '}
          <Link to="/blog/supabase-rls-not-working">is your Supabase database public?</Link> and{' '}
          <Link to="/blog/supabase-api-key-exposed">is your Supabase API key exposed?</Link>
        </em>
      </p>
    </>
  )
}

export function SecureStripePaymentsCTA() {
  return (
    <BlogCTA
      heading="Confirm your payments are safe before real money flows"
      micro="No judgment. We see this every audit. It's the kind of thing that's invisible until it isn't."
    >
      <p>
        Payment handling is one of the three things we check first in any audit, alongside
        database security and exposed keys, because it&rsquo;s so commonly wrong and so costly
        when it is. If you&rsquo;d like a senior engineer to confirm your whole app is safe
        before real money flows through it, that&rsquo;s exactly what we do.
      </p>
      <p>
        <strong>Drydock&rsquo;s Production-Readiness Audit</strong> reviews your security,
        payments, data, and scalability, then hands you a plain-English report in 3 business
        days. <strong>$750</strong>, and the full amount comes off the price if you decide to
        have us fix what we find.
      </p>
    </BlogCTA>
  )
}
