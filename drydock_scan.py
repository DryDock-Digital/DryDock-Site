#!/usr/bin/env python3
"""
DryDock.Digital - Ethical Vibe-App Surface Scanner
==================================================

Drop in a URL; this reports what the app *already ships to every visitor's
browser* so you can give the founder a free, specific heads-up.

ETHICS - READ THIS (this tool is 100% PASSIVE, on purpose):
  This tool ONLY performs unauthenticated GET requests for the target's own
  published assets - the page, its linked + lazy-loaded JS/CSS, published source
  maps, and common misconfig paths on the app's own origin - plus a header check.

  It NEVER uses any credential it discovers to make a request. It does not log
  in, query a database or backend API, enumerate users, submit forms, or send
  any payload. Reading a published .map file is reading a file the app chose to
  publish. Decoding a discovered JWT (to tell a harmless `anon` key from a
  catastrophic `service_role` key) is pure local base64 - no request is made.

  This is read-only reconnaissance of the PUBLIC surface - the digital
  equivalent of noticing a door is unlocked, never trying the handle. For
  lead-gen and responsible disclosure: report privately, lead with the fix,
  give the owner time to patch, never post a live key. You verify before you send.

  (Confirming what's actually in the database requires the owner's permission -
  that's what the authorized DryDock audit is for, not this tool.)

Usage:
  python3 drydock_scan.py https://someapp.lovable.app
  python3 drydock_scan.py url1 url2 url3            # batch
  python3 drydock_scan.py --csv leads.csv --save    # scan every URL in a CSV
  python3 drydock_scan.py --paste                    # paste a list interactively
  python3 drydock_scan.py URL --json                 # machine-readable output
  python3 drydock_scan.py URL --no-misconfig         # skip path probing (page+assets only)

Stdlib only - no pip install required. Python 3.8+.
"""

import sys
import re
import os
import csv
import gzip
import zlib
import time
import json
import base64
import argparse
import urllib.request
import urllib.error
from urllib.parse import urljoin, urlparse
from datetime import datetime, timezone

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SKIP_DOMAINS = ("x.com", "twitter.com", "reddit.com", "producthunt.com",
                "linkedin.com", "github.com", "youtube.com", "facebook.com",
                "instagram.com", "tiktok.com", "medium.com")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
TIMEOUT = 15
MAX_ASSETS = 40        # cap number of JS/asset files fetched (politeness)
MAX_MAPS = 12          # cap number of source maps mined
MAX_BYTES = 6_000_000  # per-asset cap

CRIT, HIGH, MED, INFO = "CRITICAL", "HIGH", "MEDIUM", "INFO"
ORDER = {CRIT: 0, HIGH: 1, MED: 2, INFO: 3}

# ---- secret patterns (label, regex, default_severity, note) -----------------
PATTERNS = [
    ("Supabase project URL", r"https://[a-z0-9]{20}\.supabase\.co", INFO,
     "Confirms a Supabase backend - check the key that accompanies it."),
    ("Stripe SECRET key", r"sk_live_[0-9a-zA-Z]{20,}", CRIT,
     "Live Stripe secret key in client code - full payment API access. Could be drained."),
    ("Stripe restricted key", r"rk_live_[0-9a-zA-Z]{20,}", HIGH,
     "Live Stripe restricted key exposed client-side."),
    ("Stripe publishable key", r"pk_live_[0-9a-zA-Z]{20,}", INFO,
     "Publishable key - meant to be public. No action, just context."),
    # Real OpenAI keys are sk-proj-... or sk-<48 alphanumerics> with NO internal hyphens.
    # The hyphen-free body is what keeps CSS class fragments (sk-image-linear-...) from matching.
    ("OpenAI API key", r"sk-(?:proj-[A-Za-z0-9_-]{20,}|[A-Za-z0-9]{40,})", CRIT,
     "OpenAI key called from the browser - visible in DevTools, billable abuse risk."),
    ("Anthropic API key", r"sk-ant-[A-Za-z0-9_\-]{20,}", CRIT,
     "Anthropic key exposed client-side - billable abuse risk."),
    ("Google API key", r"AIza[0-9A-Za-z_\-]{35}", HIGH,
     "Google API key in client - check if unrestricted (Maps/other). Restrict by referrer/API."),
    ("AWS access key id", r"AKIA[0-9A-Z]{16}", CRIT,
     "AWS access key id in client code - typically paired with a secret; serious if so."),
    ("AWS secret access key", r"(?i)aws_secret_access_key\s*[:=]\s*[\"']?[A-Za-z0-9/+=]{40}", CRIT,
     "AWS secret access key exposed - full programmatic AWS access risk."),
    ("GitHub token", r"gh[pousr]_[A-Za-z0-9]{36,}", CRIT,
     "GitHub token exposed - repo/account access."),
    ("GitHub fine-grained PAT", r"github_pat_[A-Za-z0-9_]{60,}", CRIT,
     "GitHub fine-grained PAT exposed."),
    ("Slack token", r"xox[baprs]-[A-Za-z0-9-]{10,}", HIGH,
     "Slack token exposed client-side."),
    ("Slack webhook", r"https://hooks\.slack\.com/services/[A-Za-z0-9/]{20,}", MED,
     "Slack incoming webhook exposed - spam/abuse into their workspace."),
    ("SendGrid key", r"SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}", HIGH,
     "SendGrid API key exposed - email-sending abuse / spoofing risk."),
    # Body is alphanumeric (no underscore) so it can't match re_snake_case_identifiers;
    # the plausibility gate below is a second line of defense.
    ("Resend key", r"re_[A-Za-z0-9]{20,}", HIGH,
     "Resend email API key exposed."),
    ("Postmark token", r"(?i)postmark[a-z_]*token[\"']?\s*[:=]\s*[\"'][0-9a-f\-]{30,}", HIGH,
     "Postmark server token exposed - email abuse."),
    ("Twilio API key (SK)", r"\bSK[0-9a-fA-F]{32}\b", HIGH,
     "Twilio API key exposed."),
    ("Twilio Account SID", r"\bAC[0-9a-f]{32}\b", MED,
     "Twilio Account SID exposed (pairs with auth token)."),
    ("Mapbox SECRET token", r"sk\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+", HIGH,
     "Mapbox SECRET token exposed."),
    ("Private key block", r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----", CRIT,
     "A private key is embedded in client assets."),
    ("DB connection string", r"(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis)://[^\s'\"]+:[^\s'\"]+@[^\s'\"]+", CRIT,
     "Database connection string WITH credentials exposed - direct DB access."),
    ("Supabase sb_secret key", r"sb_secret_[A-Za-z0-9_\-]{10,}", CRIT,
     "Supabase secret (service) key exposed - bypasses all Row Level Security."),
    ("Firebase config", r"apiKey\s*:\s*[\"'][A-Za-z0-9_\-]{30,}[\"']", INFO,
     "Firebase web config (apiKey is public by design) - real risk is open Security Rules; worth a note."),
    ("JWT secret / signing key", r"(?i)(?:jwt[_-]?secret|signing[_-]?key)\s*[:=]\s*[\"'][^\"']{12,}[\"']", CRIT,
     "A JWT signing secret in client code lets anyone forge auth tokens."),
]

# Generic "SECRET_NAME = 'long-value'" assignment - conservative, INFO-level, public ones excluded.
GENERIC_SECRET_RE = re.compile(
    r"""(?P<name>[A-Za-z0-9_.]*(?:SECRET|PRIVATE[_]?KEY|API[_]?KEY|ACCESS[_]?TOKEN|AUTH[_]?TOKEN|PASSWORD)[A-Za-z0-9_.]*)"""
    r"""\s*[:=]\s*["'](?P<val>[A-Za-z0-9+/_=\-.]{20,})["']""", re.I)
PUBLIC_NAME_HINT = re.compile(r"(?i)(VITE_|NEXT_PUBLIC_|REACT_APP_|PUBLIC_|PUBLISHABLE|ANON)")

JWT_RE = re.compile(r"eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+")

# ---- false-positive gate ----------------------------------------------------
# Loose-prefix patterns (re_, etc.) match real keys AND ordinary code identifiers
# like `re_depth_multisampled_2d`. Real keys are high-entropy random strings, not
# snake_case words. These labels only fire if the captured value LOOKS like a key.
GATED_LABELS = {"Resend key", "Slack token", "SendGrid key"}
_SNAKE = re.compile(r"^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$")  # re_depth_multisampled_2d, my_var_name

def _entropy(s):
    if not s:
        return 0.0
    n = len(s)
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    import math
    return -sum((c / n) * math.log2(c / n) for c in freq.values())

def looks_like_key(val):
    """True only if val resembles a random credential, not a code identifier/word."""
    if len(val) < 16:
        return False
    if _SNAKE.match(val):                      # snake_case identifier, never a key
        return False
    has_digit = any(ch.isdigit() for ch in val)
    has_upper = any(ch.isupper() for ch in val)
    if not has_digit and not has_upper:        # all-lowercase letters => a word, not a token
        return False
    return _entropy(val) >= 3.0                # real tokens are high-entropy

# Backend tables the code references (passive - extracted from published JS, never queried).
TABLE_RE = [
    re.compile(r"""\.from\(\s*["'`]([A-Za-z_][A-Za-z0-9_]*)["'`]"""),
    re.compile(r"""/rest/v1/([A-Za-z_][A-Za-z0-9_]*)"""),
]
TABLE_IGNORE = {"v1", "rest", "rpc", "auth", "storage"}

# Stack / service fingerprints: (label, regex-or-substring)
STACK_FINGERPRINTS = [
    ("Lovable (builder)", r"lovable\.(app|dev)|gpteng|lovable-error|lovable-tagger|lovable-uploads"),
    ("Bolt.new (builder)", r"bolt\.new|stackblitz"),
    ("v0.dev (builder)", r"v0\.dev|generated by v0"),
    ("Cursor / Replit", r"replit|repl\.co"),
    ("React", r"react(?:-dom)?(?:\.production)?|__REACT|_jsxDEV|createElement"),
    ("Vue", r"__vue__|createApp\(|vue\.runtime"),
    ("Svelte", r"__svelte|svelte/internal|SvelteComponent"),
    ("Angular", r"ng-version|@angular"),
    ("Next.js", r"__NEXT_DATA__|/_next/|next/dist"),
    ("Vite", r"/assets/index-|@vite/client|import\.meta\.env"),
    ("TanStack Router/Query", r"@tanstack/(react-)?(router|query)|tanstackRouter"),
    ("Supabase", r"supabase\.co|@supabase/supabase-js|createClient"),
    ("Firebase", r"firebaseapp\.com|firebaseio\.com|firebase/app"),
    ("Stripe", r"js\.stripe\.com|@stripe/stripe-js|pk_live_|pk_test_"),
    ("Clerk (auth)", r"clerk\.(com|dev|accounts)|@clerk/"),
    ("Auth0", r"auth0\.com|@auth0/"),
    ("PostHog", r"posthog|i\.posthog\.com"),
    ("Sentry", r"sentry\.io|@sentry/"),
    ("Segment", r"segment\.com|analytics\.js"),
    ("Mixpanel", r"mixpanel"),
    ("OpenAI (client-side)", r"api\.openai\.com"),
    ("Anthropic (client-side)", r"api\.anthropic\.com"),
    ("Mapbox", r"api\.mapbox\.com|mapbox-gl"),
]

MISCONFIG_PATHS = [
    "/.env", "/.env.local", "/.env.production", "/.env.development", "/.env.example",
    "/.git/config", "/.git/HEAD", "/.firebaserc", "/firebase.json",
    "/config.json", "/credentials.json", "/.aws/credentials",
    "/.DS_Store", "/.vscode/sftp.json", "/docker-compose.yml",
    "/supabase/config.toml", "/backup.sql", "/dump.sql", "/database.sqlite",
]

# ---- fetching ---------------------------------------------------------------
def fetch(url, method="GET"):
    """Unauthenticated GET/HEAD of a published asset. Asks for identity encoding
    so we never scan compressed bytes; decompresses defensively if the server
    ignores that. Returns (status, headers_dict, body_bytes)."""
    req = urllib.request.Request(url, method=method, headers={
        "User-Agent": UA,
        "Accept-Encoding": "identity",
        "Accept": "*/*",
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            raw = r.read(MAX_BYTES) if method == "GET" else b""
            enc = (r.headers.get("Content-Encoding") or "").lower()
            raw = _decompress(raw, enc)
            return r.status, dict(r.headers), raw
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers or {}), b""
    except Exception as e:
        return None, {}, str(e).encode()

def _decompress(raw, enc):
    try:
        if "gzip" in enc:
            return gzip.decompress(raw)
        if "deflate" in enc:
            try:
                return zlib.decompress(raw)
            except zlib.error:
                return zlib.decompress(raw, -zlib.MAX_WBITS)
    except Exception:
        pass
    return raw

def b64url_decode(seg):
    seg += "=" * (-len(seg) % 4)
    return base64.urlsafe_b64decode(seg.encode())

def decode_jwt(token):
    try:
        return json.loads(b64url_decode(token.split(".")[1]))
    except Exception:
        return None

# ---- scanning ---------------------------------------------------------------
def scan_text(text, source, findings):
    for label, rx, sev, note in PATTERNS:
        for m in set(re.findall(rx, text)):
            val = m if isinstance(m, str) else m[0]
            if label in GATED_LABELS and not looks_like_key(val):
                continue  # looks like a code identifier, not a real key — skip
            findings.append({"sev": sev, "label": label, "value": val[:64],
                             "source": source, "note": note})
    for m in GENERIC_SECRET_RE.finditer(text):
        name, val = m.group("name"), m.group("val")
        if PUBLIC_NAME_HINT.search(name):
            continue  # public-by-design env var, skip the noise
        if not looks_like_key(val):
            continue  # a word/identifier assigned to a key-ish name, not an actual secret
        findings.append({"sev": INFO, "label": f"Possible secret ({name})",
                         "value": (val[:12] + "..."), "source": source,
                         "note": "A secret-looking value is assigned in client code. Verify it's not a live credential."})
    for tok in set(JWT_RE.findall(text)):
        payload = decode_jwt(tok)
        if not payload:
            continue
        role = str(payload.get("role", "")).lower()
        ref = payload.get("ref", "")
        if role == "service_role":
            findings.append({"sev": CRIT, "label": "Supabase SERVICE_ROLE key",
                             "value": tok[:24] + "...", "source": source,
                             "note": (f"service_role JWT (project ref: {ref}) in client code. "
                                      "Bypasses ALL Row Level Security - anyone can read/write/"
                                      "delete every table. This is the #1 critical finding.")})
        elif role == "anon":
            findings.append({"sev": INFO, "label": "Supabase anon key",
                             "value": tok[:24] + "...", "source": source,
                             "note": (f"anon/public key (project ref: {ref}) - expected to be "
                                      "client-side. SAFE *only if* Row Level Security is enabled "
                                      "on every table. The usual gap - lead your outreach here.")})
        else:
            findings.append({"sev": MED, "label": "JWT token",
                             "value": tok[:24] + "...", "source": source,
                             "note": f"JWT with role='{role or 'unknown'}' exposed - inspect."})

def extract_tables(text, tables):
    for rx in TABLE_RE:
        for m in rx.findall(text):
            if m and m not in TABLE_IGNORE and not m.startswith("_"):
                tables.add(m)

def fingerprint_stack(text, stack):
    for label, rx in STACK_FINGERPRINTS:
        if label in stack:
            continue
        if re.search(rx, text, re.I):
            stack.add(label)

# ---- asset discovery --------------------------------------------------------
def extract_assets(base_url, html):
    urls = set()
    for m in re.findall(r"""<script[^>]+src=["']([^"']+)["']""", html, re.I):
        urls.add(urljoin(base_url, m))
    for m in re.findall(r"""<link[^>]+(?:href)=["']([^"']+\.(?:js|mjs|css))["']""", html, re.I):
        urls.add(urljoin(base_url, m))
    for m in re.findall(r"""["']([^"'\s]+\.(?:js|mjs))["']""", html):
        urls.add(urljoin(base_url, m))
    return [u for u in urls if u.startswith("http")]

def discover_chunks(js_text, asset_url):
    """Find lazy-loaded chunk filenames referenced inside a bundle (Vite/webpack).
    These aren't in the HTML, so this is where extra secrets/tables often hide."""
    chunks = set()
    for m in re.findall(r"""["'`](?:\.{0,2}/)?((?:assets/|chunks/|static/)?[\w.\-]+\.(?:js|mjs))["'`]""", js_text):
        if "node_modules" in m:
            continue
        chunks.add(urljoin(asset_url, m))
    for m in re.findall(r"""import\(\s*["']([^"']+\.(?:js|mjs))["']""", js_text):
        chunks.add(urljoin(asset_url, m))
    return chunks

def mine_source_map(asset_url, js_text, out):
    """If a published source map exists, fetch it and return the ORIGINAL source.
    Reading a file the app chose to publish - still strictly passive."""
    map_urls = []
    m = re.search(r"sourceMappingURL=([^\s'\"]+\.map)", js_text)
    if m:
        map_urls.append(urljoin(asset_url, m.group(1)))
    map_urls.append(asset_url + ".map")  # common convention even when not referenced
    for map_url in dict.fromkeys(map_urls):
        s, _, b = fetch(map_url)
        if s != 200 or not b:
            continue
        try:
            data = json.loads(b.decode("utf-8", "ignore"))
        except Exception:
            continue
        out["maps_mined"].append(map_url.split("/")[-1][:50])
        sources = data.get("sourcesContent") or []
        names = data.get("sources") or []
        combined = "\n".join(s for s in sources if isinstance(s, str))
        if combined:
            out["findings_text"].append((map_url.split("/")[-1][:40] + " (source map)", combined))
        # original file paths reveal app structure (e.g. src/integrations/supabase/client.ts)
        interesting = [n for n in names if isinstance(n, str)
                       and re.search(r"(supabase|stripe|auth|api|admin|secret|config|\.env)", n, re.I)
                       and "node_modules" not in n]
        if interesting:
            out["source_files"].update(interesting[:40])
        return True
    return False

def check_headers(headers):
    issues = []
    h = {k.lower(): v for k, v in headers.items()}
    csp = h.get("content-security-policy", "")
    if not csp:
        issues.append((MED, "No Content-Security-Policy header",
                       "No CSP - weaker defense against injected/exfil scripts (XSS)."))
    if "strict-transport-security" not in h:
        issues.append((INFO, "No HSTS header",
                       "No Strict-Transport-Security - enforce HTTPS."))
    if "x-frame-options" not in h and "frame-ancestors" not in csp:
        issues.append((INFO, "No X-Frame-Options / frame-ancestors",
                       "Clickjacking protection absent."))
    if "x-content-type-options" not in h:
        issues.append((INFO, "No X-Content-Type-Options",
                       "MIME-sniffing protection absent (minor)."))
    aco = h.get("access-control-allow-origin", "")
    if aco == "*":
        issues.append((MED, "Wildcard CORS (Access-Control-Allow-Origin: *)",
                       "Any origin can read responses - risky if any endpoint is credentialed."))
    return issues

# ---- orchestration ----------------------------------------------------------
def run(url, do_misconfig=True):
    if not url.startswith("http"):
        url = "https://" + url
    base = url
    out = {"url": url, "when": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
           "findings": [], "header_issues": [], "misconfig": [], "errors": [],
           "assets_scanned": [], "maps_mined": [], "tables": set(), "stack": set(),
           "source_files": set(), "findings_text": []}

    status, headers, body = fetch(url)
    if status is None:
        out["errors"].append(f"Could not reach {url}: {body.decode(errors='ignore')[:120]}")
        return out
    out["status"] = status
    out["header_issues"] = check_headers(headers)
    html = body.decode(errors="ignore")
    out["findings_text"].append(("page HTML", html))

    # Breadth-first asset crawl: HTML assets, then chunks they reference (bounded).
    queue = extract_assets(base, html)
    visited = set()
    while queue and len(out["assets_scanned"]) < MAX_ASSETS:
        a = queue.pop(0)
        if a in visited:
            continue
        visited.add(a)
        s, _, b = fetch(a)
        if s != 200 or not b:
            continue
        out["assets_scanned"].append(a)
        txt = b.decode(errors="ignore")
        out["findings_text"].append((a.split("/")[-1][:40], txt))
        if len(out["maps_mined"]) < MAX_MAPS:
            mine_source_map(a, txt, out)
        for c in discover_chunks(txt, a):
            if c not in visited and len(visited) + len(queue) < MAX_ASSETS * 2:
                queue.append(c)

    # Scan all collected text (HTML + assets + mined source) for secrets, tables, stack.
    for source, txt in out["findings_text"]:
        scan_text(txt, source, out["findings"])
        extract_tables(txt, out["tables"])
        fingerprint_stack(txt, out["stack"])

    if do_misconfig:
        p = urlparse(base)
        root = f"{p.scheme}://{p.netloc}"
        for path in MISCONFIG_PATHS:
            s, _, b = fetch(root + path)
            txt = b.decode(errors="ignore")[:400]
            looks_real = s == 200 and b and "<html" not in txt.lower() and "<!doctype" not in txt.lower()
            if looks_real:
                out["misconfig"].append({"sev": HIGH if "/.env" in path or "credential" in path or ".sql" in path else MED,
                                         "path": path,
                                         "note": "Returned 200 with non-HTML content - POSSIBLY exposed. Verify manually before claiming."})

    # de-dupe findings
    seen, uniq = set(), []
    for f in out["findings"]:
        k = (f["label"], f["value"])
        if k not in seen:
            seen.add(k); uniq.append(f)
    uniq.sort(key=lambda f: ORDER[f["sev"]])
    out["findings"] = uniq
    del out["findings_text"]  # drop raw text before returning/serializing
    return out

# ---- report -----------------------------------------------------------------
def angle_for(top_sev, findings):
    labels = {f["label"] for f in findings}
    if "Supabase SERVICE_ROLE key" in labels:
        return ("Template A (critical). Lead: 'your Supabase service_role key is in the "
                "front-end JS - anyone can read/write your whole DB regardless of RLS.'")
    if any(l in labels for l in ("Stripe SECRET key", "OpenAI API key", "Anthropic API key",
                                 "AWS access key id", "AWS secret access key", "DB connection string",
                                 "Private key block", "Supabase sb_secret key", "JWT secret / signing key")):
        return ("Template B (high). A live secret key is called from the browser - visible in "
                "DevTools, abuse/billing risk. Point to the exact file + the edge-function fix.")
    if "Supabase anon key" in labels:
        return ("No leaked secret, but it's Supabase-backed. Template C: offer a free once-over "
                "and ask whether Row Level Security is on for every table (the usual gap). "
                "If we found table names below, name one or two - it shows you actually looked.")
    if top_sev in (MED,):
        return "Template C (reply-to-help). Minor hardening notes; build rapport, offer the free audit."
    return ("Nothing exposed on the public surface. Switch to a genuine product-feedback reply "
            "(Template C) rather than a security angle.")

C = {CRIT: "\033[91m", HIGH: "\033[93m", MED: "\033[96m", INFO: "\033[90m", "R": "\033[0m"}
def col(sev, s, plain): return s if plain else f"{C.get(sev, '')}{s}{C['R']}"

def all_sevs(out):
    return [f["sev"] for f in out["findings"]] + [i[0] for i in out["header_issues"]] + [m["sev"] for m in out["misconfig"]]

def top_sev(out):
    sevs = all_sevs(out)
    return min(sevs, key=lambda s: ORDER[s]) if sevs else INFO

def render(out, plain=False):
    L = []
    L.append("=" * 70)
    L.append(f"  DryDock surface scan - {out['url']}")
    L.append(f"  {out['when']}   (100% passive; no credentials used, backend never queried)")
    L.append("=" * 70)
    if out.get("errors"):
        return "\n".join(L + ["", "ERROR: " + "; ".join(out["errors"])])
    top = top_sev(out)
    L.append(f"  HTTP {out.get('status')} | {len(out['assets_scanned'])} asset(s), "
             f"{len(out['maps_mined'])} source map(s) mined | highest severity: " + col(top, top, plain))
    if out["stack"]:
        L += ["", "STACK / SERVICES DETECTED:", "  " + ", ".join(sorted(out["stack"]))]
    L.append("")
    if out["findings"]:
        L.append("SECRETS / KEYS:")
        for f in out["findings"]:
            L.append("  " + col(f["sev"], f"[{f['sev']}]", plain) + f" {f['label']}  ({f['source']})")
            L.append(f"        value: {f['value']}")
            L.append(f"        {f['note']}")
    else:
        L.append("SECRETS / KEYS: none found in the public surface.")
    if out["tables"]:
        ts = sorted(out["tables"])
        L += ["", f"BACKEND TABLES REFERENCED IN CODE ({len(ts)}) - we did NOT query them:",
              "  " + ", ".join(ts[:30]) + ("  ..." if len(ts) > 30 else ""),
              "  -> Ask the founder to confirm Row Level Security is ON and owner-scoped on each."]
    if out["source_files"]:
        sf = sorted(out["source_files"])
        L += ["", f"PUBLISHED SOURCE FILES (from source maps, {len(sf)} sensitive paths):",
              "  " + "\n  ".join(sf[:12]) + ("\n  ..." if len(sf) > 12 else "")]
    if out["header_issues"]:
        L += ["", "SECURITY HEADERS:"]
        for sev, name, note in out["header_issues"]:
            L.append("  " + col(sev, f"[{sev}]", plain) + f" {name} - {note}")
    if out["misconfig"]:
        L += ["", "POSSIBLE EXPOSED PATHS (verify manually - flagged, not confirmed):"]
        for m in out["misconfig"]:
            L.append("  " + col(m["sev"], f"[{m['sev']}]", plain) + f" {m['path']} - {m['note']}")
    L += ["", "-" * 70, "SUGGESTED OUTREACH ANGLE:", "  " + angle_for(top, out["findings"]),
          "", "REMINDER: 100% passive recon. You confirm each finding yourself before messaging.",
          "Lead with the fix, never paste a live key, give them time to patch. - DryDock.Digital", "-" * 70]
    return "\n".join(L)

def jsonable(out):
    o = dict(out)
    for k in ("tables", "stack", "source_files"):
        o[k] = sorted(out.get(k, []))
    o["top_severity"] = top_sev(out) if not out.get("errors") else "ERROR"
    return o

# ---- batch / input helpers --------------------------------------------------
def normalize(u):
    u = (u or "").strip().strip('"').strip("'")
    if not u or u.lower() in ("url", "n/a", "-", "website", "link"):
        return None
    if not u.startswith("http"):
        u = "https://" + u
    return u

def urls_from_csv(path):
    found, seen = [], set()
    tld = re.compile(r"\.(com|app|dev|io|ai|co|net|org|xyz|me|pm|tech|site|store)(/|$)", re.I)
    with open(path, newline="", encoding="utf-8", errors="ignore") as f:
        for row in csv.reader(f):
            for cell in row:
                c = cell.strip()
                if not c or " " in c:
                    continue
                if c.lower().startswith("http") or tld.search(c):
                    u = normalize(c)
                    if u and u not in seen:
                        seen.add(u); found.append(u)
    return found

def urls_from_list(path):
    out, seen = [], set()
    with open(path, encoding="utf-8", errors="ignore") as f:
        for line in f:
            u = normalize(line)
            if u and u not in seen:
                seen.add(u); out.append(u)
    return out

def is_scannable(u):
    host = urlparse(u).netloc.lower()
    return not any(host == d or host.endswith("." + d) for d in SKIP_DOMAINS)

def read_pasted():
    print("Paste your URLs below (one per line).")
    print("When you're done, press Enter on an empty line to start scanning:\n")
    urls, seen = [], set()
    try:
        while True:
            line = input()
            if not line.strip():
                break
            u = normalize(line)
            if u and u not in seen:
                seen.add(u); urls.append(u)
    except EOFError:
        pass
    return urls

def batch(urls, do_misconfig, plain, save, as_json, delay=1.0):
    urls = [u for u in urls if is_scannable(u)]
    results = []
    print(f"\nScanning {len(urls)} app URL(s)...  (socials/profiles auto-skipped)\n", file=sys.stderr)
    for i, u in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] {u}", file=sys.stderr)
        out = run(u, do_misconfig=do_misconfig)
        results.append(out)
        time.sleep(delay)

    rank = {CRIT: 0, HIGH: 1, MED: 2, INFO: 3, "ERROR": 9}
    results.sort(key=lambda o: rank.get("ERROR" if o.get("errors") else top_sev(o), 5))

    if as_json:
        print(json.dumps([jsonable(o) for o in results], indent=2))
        return

    print("\n" + "=" * 70)
    print("  BATCH SUMMARY - message the top of this list first")
    print("=" * 70)
    for o in results:
        if o.get("errors"):
            print(f"  [ERROR]    {o['url']}  ({o['errors'][0][:50]})"); continue
        t = top_sev(o)
        keys = ", ".join(sorted({f['label'] for f in o['findings'] if f['sev'] in (CRIT, HIGH)})) or "-"
        line = f"  [{t:<8}] {o['url']}"
        print(col(t, line, plain) if t in C else line)
        if keys != "-":
            print(f"             -> {keys}")
    print("=" * 70 + "\n  Full per-app detail below.\n")

    full = []
    for o in results:
        print("\n" + render(o, plain=plain))
        full.append(render(o, plain=True))

    if save:
        fn = f"scan_batch_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
        with open(fn, "w") as f:
            f.write("# DryDock batch scan - " + datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n")
            f.write("```\n" + "\n\n".join(full) + "\n```\n")
        print(f"\nSaved combined report: {fn}")

def main():
    ap = argparse.ArgumentParser(description="DryDock ethical (100% passive) vibe-app surface scanner")
    ap.add_argument("url", nargs="*", help="One or more app URLs, space-separated")
    ap.add_argument("--paste", action="store_true", help="paste your own list of URLs interactively")
    ap.add_argument("--csv", help="Scan every URL found in a CSV (any column)")
    ap.add_argument("--list", help="Scan every URL in a plain text file (one per line)")
    ap.add_argument("--no-misconfig", action="store_true", help="skip exposed-path probing (page+assets only)")
    ap.add_argument("--save", action="store_true", help="write a .md report")
    ap.add_argument("--json", action="store_true", help="machine-readable JSON output")
    ap.add_argument("--plain", action="store_true", help="no ANSI colors")
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between hosts in batch (default 1.0)")
    a = ap.parse_args()

    if a.csv or a.list:
        target_file = a.csv or a.list
        if not os.path.exists(target_file):
            print(f"File not found: {target_file}")
            sys.exit(1)
        urls = urls_from_csv(a.csv) if a.csv else urls_from_list(a.list)
    elif a.paste:
        urls = read_pasted()
    else:
        urls = [u for u in (normalize(u) for u in a.url) if u]

    if not urls:
        ap.error("give URLs directly (space-separated), or use --paste, --csv FILE, or --list FILE")

    if len(urls) == 1 and not (a.csv or a.list or a.paste):
        out = run(urls[0], do_misconfig=not a.no_misconfig)
        if a.json:
            print(json.dumps(jsonable(out), indent=2))
        else:
            print(render(out, plain=a.plain))
            if a.save:
                host = urlparse(out["url"]).netloc.replace(":", "_")
                fn = f"scan_{host}_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
                with open(fn, "w") as f:
                    f.write("```\n" + render(out, plain=True) + "\n```\n")
                print(f"\nSaved: {fn}")
    else:
        batch(urls, do_misconfig=not a.no_misconfig, plain=a.plain, save=a.save, as_json=a.json, delay=a.delay)

if __name__ == "__main__":
    main()
