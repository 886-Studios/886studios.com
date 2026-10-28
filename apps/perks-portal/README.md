# 886 Studios portfolio perks

A separate, server-rendered portal served at **https://www.886studios.com/perks**. The main Astro site proxies `/perks` and its subpaths to the existing `886-studios-perks` Vercel project. The apex domain redirects to `www` through the main site's existing canonical-domain rule. No separate DNS setup is needed.

[Local preview](#local-preview) · [Troubleshooting](#common-pitfalls) ·
[Tests and build](#tests-and-build) · [Environment](#environment) ·
[Deployment](#deployment) · [Content](#content-and-sources)

## Prerequisites

- Use Node 22 (`22.23.4` or newer within Node 22) to match the root project's security baseline. Vercel manages the function's Node 22 patch version; verify it meets this minimum before release.
- No dependency installation is needed for this app; it currently uses Node's built-in modules.
- Obtain the current private catalog from the 886 team through a secure channel and save it as
  `apps/perks-portal/private/catalog.json`. **A fresh clone does not include this file.** A working
  directory preview and every build require it; most tests use fixtures and can run without it.

Keep the catalog out of `public/` and Git. See [Content and sources](#content-and-sources)
for the data requirements. The public Astro site has its own [setup guide](../../README.md#quick-start).

## Local preview

After supplying the catalog, run these commands from the repository root. The nvm commands
select the runtime from the root `.nvmrc`; use your own version manager if needed.

```sh
nvm install
nvm use
cd apps/perks-portal
npm run dev
```

Open `http://localhost:4186` and enter the **local access code printed in the terminal**.
The first launch generates development credentials in the ignored `private/dev-access.json`.
The dev server uses these credentials rather than `PERKS_ACCESS_CODE` and `PERKS_SESSION_SECRET`.
No environment file or production credentials are needed for this preview, and the server binds
only to `127.0.0.1`.

All remaining commands in this guide run from `apps/perks-portal/` unless stated otherwise.
To preview the production subpath:

```sh
APP_BASE_PATH=/perks npm run dev
```

Open `http://localhost:4186/perks`. To change the port, use `PORT=4187 npm run dev`.
The printed preview URL omits the base path; append `/perks` when it is configured.

## Common pitfalls

| Symptom | What to do |
| --- | --- |
| Preview shows an unavailable screen or HTTP 503 | Confirm `private/catalog.json` is present and valid; inspect the terminal's `Perks configuration` message. For `npm start` or a deployment, also check the required runtime credentials. |
| Build fails with `ENOENT` for `private/catalog.json` | Supply the private catalog securely. A clean clone deliberately omits it. |
| One catalog test is skipped | Expected without the private catalog. Passing fixture tests does not validate the real catalog or a release artifact. |
| Login rejects the code | For `npm run dev`, use the generated code printed in that terminal. Production credentials are used by `npm start` and the Vercel function. |
| Port `4186` is occupied (`EADDRINUSE`) | Stop the other server or run `PORT=4187 npm run dev`, then use the new port. |
| `/` returns 404 | If `APP_BASE_PATH=/perks`, open `/perks`. Copying `.env.example` to `.env.local` enables that base path. |
| `/perks` returns 404 on the Astro dev server | Start this app separately; Astro does not apply the production proxy. |
| A login POST returns 403 | Open the configured `APP_ORIGIN` and base path. Production expects `https://www.886studios.com/perks`; a direct deployment hostname has a different origin. |
| Login returns 429 | Wait 15 minutes before retrying. The built-in throttle tracks eight failed attempts per process. |
| Build reports a missing logo or font | Restore the referenced asset under this app's `public/`; the build checks catalog logos and the four Geist font weights. |

## Tests and build

Run authentication, privacy, filtering, and content tests:

```sh
npm test
```

Successful output reports no failed tests. The private-catalog test is skipped when its
ignored data file is absent. GitHub's root workflow runs this suite, but the public site's
`npm run validate` does not include it.

With the private catalog available, validate a release locally:

```sh
npm run validate
```

This runs tests, then builds `.vercel/output` using the Vercel Build Output API.
Successful output includes `Built … partner entries for www.886studios.com/perks.`
The artifact includes the private catalog inside the server function; store it securely.
Source snapshots and development credentials are excluded. Nothing is deployed by this command.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the loopback development server with generated local credentials. |
| `npm test` | Run tests; skip the private-catalog check when its file is absent. |
| `npm run build` | Build `.vercel/output`; requires the private catalog but does not run tests. |
| `npm run validate` | Run tests and then build the portal artifact. |
| `npm run preflight` | Check release configuration and the local perks project link; print variable names only. |
| `npm run validate:release` | Run the production configuration preflight, tests, and build. Requires securely supplied credentials, project link, and catalog. |
| `npm start` | Run the production handler on loopback; requires runtime credentials and an HTTPS origin served through a TLS proxy. |

From the repository root, the equivalent validation command is:

```sh
npm --prefix apps/perks-portal run validate
```

## Environment

The template is [.env.example](.env.example). Both `npm run dev` and `npm start` load an
optional `.env.local`; `npm run build` does not load that file or require runtime credentials.
To create it without replacing an existing file:

```sh
test -f .env.local || cp .env.example .env.local
```

The template sets `APP_BASE_PATH=/perks`, so subsequent dev previews use `/perks`.
Its credential fields are intentionally blank. Dev still uses `private/dev-access.json`;
production must receive real credentials through the deployment environment.

| Variable | Development | Production handler |
| --- | --- | --- |
| `PERKS_ACCESS_CODE` | Generated in `private/dev-access.json`; the env value is ignored by dev | Release preflight requires 16–256 characters and rejects surrounding whitespace, control characters, and known placeholders. Generate randomly and share only with approved companies. Runtime retains the existing six-character minimum until coordinated rotation. |
| `PERKS_SESSION_SECRET` | Generated in `private/dev-access.json`; the env value is ignored by dev | Generate at least 32 random bytes, encoded as base64url or hex. Preflight requires 43–512 encoded characters, rejects placeholders, and requires a value different from the code. Runtime retains the existing 32-character minimum. |
| `APP_ORIGIN` | Dev computes `http://localhost:<PORT>` | Set `https://www.886studios.com`. Runtime validates a complete HTTPS origin, rejecting embedded credentials, non-root paths, query strings, and fragments. The existing origin fallback remains supported. |
| `APP_BASE_PATH` | Empty by default; set `/perks` for a subpath preview | Set `/perks` explicitly; this is also the runtime fallback. |
| `PORT` | Defaults to `4186` | Used by standalone `npm start`; Vercel invokes the function directly. Must be decimal digits representing an integer from 1 to 65535; empty and malformed settings are rejected. |

Store the two production credentials in the perks project's Vercel Secret variables.
Keep them out of the public-site project, browser code, logs, and shared files. Existing
Sensitive variables continue to work as Secrets. Use separate credentials and synthetic
catalog data for previews. [Vercel Secret variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables).

The stronger credential rules are enforced by the explicit release preflight, preserving
existing runtime credentials and signed sessions. Coordinate credential rotation before
using that release gate; changing either credential invalidates sessions. Values are never
silently trimmed, and length checks cannot establish randomness. The
[configuration hardening checklist](../../docs/config-hardening-checklist.md) tracks the
remaining deployment work. Automated Supabase claims additionally require the staff,
Upstash, and Resend settings described below.

## Access

The shared code is checked on the server. Valid access sets a signed, HTTP-only, SameSite=Strict cookie with a seven-day expiry. Production cookies have the Secure attribute, use the `__Secure-` prefix, omit Domain, and are scoped to `/perks`. Root-mounted local/test deployments remain supported; secure root deployments use `__Host-`. A deployment using a new access code or session secret rejects sessions signed with the previous credentials; retire accessible older deployments during rotation. Sign-out clears the current browser cookie; back/forward cache restoration revalidates the page.

Private HTML uses `no-store` for browser and CDN caches. Every response sends `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex`; HTML repeats these directives in its robots meta tag. Crawling remains allowed so compliant search engines can see `noindex`. Do not add a robots.txt disallow rule for the portal: that can prevent search engines from reading the exclusion. These directives do not replace the server-side access check. Direct file requests cannot retrieve the private catalog, source files, environment files, or local development credentials. The login fails closed when the credentials or private catalog are absent. Same-origin form requests are required, with a same-origin referrer policy that sends no referrer to partner sites. CSP disallows third-party scripts and frames. Fonts and images are local, and the portal includes no analytics.

There is an eight-attempt, 15-minute throttle per process. Production also needs a
durable/platform rate limit for **POST `/perks/login`**, covering the public proxy and
direct portal entry points. Cold starts and separate instances have separate in-process
counters. The in-process check and failure accounting run synchronously after reading the
bounded request body, so concurrent requests cannot exceed the failure budget. A full
counter table blocks new keys until space is available. Successful login still clears
that client's failures. A shared code controls possession of access, not individual company identity.
Only distribute the production code to approved portfolio companies.

## Deployment

The main repository's root `vercel.json` forwards `/perks` and `/perks/:path*` to the same paths on `https://886-studios-perks.vercel.app`. The proxy explicitly disables caching and preserves no-index, same-origin referrer, and restrictive CSP headers for the portal. Styles, scripts, fonts, logos, form actions, and redirects use the portal base path. The portal must remain absent from public navigation, HTML, sitemaps, RSS, and AI discovery files. The main site security check rejects published references, and the IndexNow CLI rejects portal submissions. Share its URL directly with approved companies only.

Deploy independently to the existing Vercel project **`886-studios-perks`**, using the
[production environment settings](#environment). The public site's protected-branch
release publishes the proxy rules; the portal is a separate release. The portal function
handles every request, and its catalog is not emitted as a public static file.

### Release checklist

Complete these checks for each release; local tests do not confirm deployed project settings.

- [ ] Supply the current private catalog securely and select Node 22 on the exact release commit.
- [ ] Set the two runtime credentials as Secrets in the perks project's production environment,
  with `APP_ORIGIN=https://www.886studios.com` and `APP_BASE_PATH=/perks`.
- [ ] Supply the same intended release settings securely to `npm run preflight`. It checks
  Node 22, credential format, origin, base path, port, and `.vercel/project.json` project name/IDs.
  It also rejects a conflicting `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID`. Refresh an old link
  missing `projectName` using `vercel link --project 886-studios-perks` from this app.
  This is a local configuration check, not a remote project lookup or secret rotation.
- [ ] Run `npm run validate:release` from this app and resolve failures or unexpected skipped tests.
  Review `.vercel/output`; only the function should contain the catalog, and development
  credentials, `.env*`, and private source snapshots must be absent.
- [ ] Confirm this app's `.vercel/project.json` targets `886-studios-perks`. Deploy the validated
  prebuilt `.vercel/output` artifact to that project, using the team's Vercel release workflow.
- [ ] Verify the login rate limit covers POST `/perks/login` through both entry points.
- [ ] Check login, logout, cookie scope, no-store/no-index headers, and asset paths through
  `https://www.886studios.com/perks` after release.
- [ ] When rotating credentials, verify old sessions are rejected and retire accessible older
  deployments that still use the previous credentials. Environment updates take effect on
  new deployments. [Vercel environment variables](https://vercel.com/docs/environment-variables).

The Vercel build command is `npm run build`, so it does not run the test suite itself.
Run the release validation step before publishing any manually prepared artifact. Normal
fixture builds and `npm run validate` still work without production credentials or a
project link. Tests package synthetic data in a temporary directory and check that only
the catalog enters the private function; local credentials and source snapshots stay out.

## Content and sources

`private/catalog.json` now contains 22 partner entries: 21 sourced offers (including Supabase) and Zettabyte, whose credit amount and redemption link are unconfirmed. Its entry explicitly asks founders to contact the team. Negotiations, rejected applications, and unavailable offers are excluded.

The catalog was checked against the complete Notion founder-facing Perks database and Perks – Internal on September 22, 2026. Linear is included from its completed internal record. Zettabyte is included from the public 886 website and the August 31 partnership meeting note. Source URLs are retained per entry for maintenance but not rendered to portfolio visitors. Detailed source snapshots are kept locally in `private/source-records.json` and are never included in the build.

Each entry has an ID, name, category, short benefit, explanation, eligibility, instructions, redemption link, source, and optional program restrictions, secondary links, and redemption code. Prices and offer limits retain the qualification in the source. Contact-based perks use the recorded email or an introduction from the 886 team. The Google Cloud partner URL is preserved exactly as recorded; its unusual query string should be confirmed with the partner before launch.

The catalog and source snapshots are **git-ignored deliberately** so partner links and codes cannot accidentally enter a public repository. Back up the private catalog securely. A fresh clone needs the private catalog supplied before building; builds fail if it is absent. Edit this file on the server side; never move it into `public/` or import it into the browser script.

Every entry also has a brief `about` introduction explaining the company or product, an official `aboutSource` URL, and an `aboutReviewedAt` date. All 21 introductions were checked against official sites on September 23, 2026. These fields stay in the ignored catalog alongside the existing content. Search includes the introduction text; source URLs are retained for maintenance. Each details box leads with Perk, Eligibility, and How to redeem. The description and introduction remain available in an expandable Details section below them.

## Design

Uses the 886 Studios logo, Geist typography, dark background, and restrained purple actions. The visible heading is “Portfolio perks”; page and share metadata retain “886 Studios Exclusive Perks.” The header logo links to the main 886 website. There is no navigation title, subtitle, footer logo, portfolio lock badge, or decorative divider line.

Link previews use the main site's existing 1200 × 630 logo image at `/assets/886-studios-preview.png`, through Open Graph and Twitter metadata on both the access screen and directory. Only public branding appears in preview metadata; private offer details stay behind the access code, and all portal responses retain their no-index protection.

Search, a compact Category / A–Z sort toggle, and rounded type-filter buttons share one form. The toggle uses native radio inputs with a 32px visual track, 44px tap targets, keyboard arrow navigation, and an accessible “Sort by” legend. A–Z is the default and orders all partners by name. Optional Category sorting follows the filter order and alphabetizes partners within each type. The sort choice combines with search and filters, survives refresh through the URL, and is retained when clearing filters. All controls work without JavaScript; when JavaScript is available, results update immediately. On small screens, search takes a full row, the compact toggle aligns right below it, and the filter buttons wrap. Desktop entries use separate Partner, Type, and Perk columns.

Perk rows show the partner, benefit, category, and a Details action. Expanded offers put Perk, Eligibility, and How to redeem first, with partner background under a native Details disclosure. All offer terms, eligibility, instructions, links, and codes remain available. The flat, opaque dark-purple panel uses three columns on desktop and a single column on phones. Inputs are 16px, and main actions have at least 44px targets. Access and claim forms use one heading and a single column.

Staff see approved emails grouped alphabetically by company, with claim reservations shown beside the relevant company. Add member email and the local test inbox expand on demand; form errors reopen the add-email form. Revocation and the one-claim-per-company rule are unchanged. Staff email rows and the test inbox are limited to 760px for easier scanning. Form errors are associated with their inputs, empty messages do not reserve extra space, and selected categories use the shared primary-action color for text contrast. The polish pass checked Safari at 320, 390, 768, and 1280px, including required-email validation and empty-search recovery.

The portal tests cover access control, privacy, content, and subpath login, assets, filters, redirects, cookie scope, and private-path rejection. The main GitHub validation workflow also runs portal tests; the private-catalog check runs locally when the catalog is present. Earlier browser checks covered actual CSS viewport widths of 320, 390, 430, 768, 843 (landscape), and 1280px. No horizontal overflow was found. Checked combined search/type filtering, retained filters after refresh, empty results and reset, expanded long terms, invalid and valid access codes, and authentication. Physical iPhone/Android devices have not been tested. Partner claims were not submitted.

The original concept in `design/directory-concept.png` predates the requested title, divider removal, and mobile hierarchy changes. It is ignored because it contains private offer amounts.


## Supabase credits and approved-email claims

The API contract is the partner-supplied `Supabase_Partner_Credits_API_Documentation.pdf`
(reviewed October 27, 2026). It uses `POST /partners/credits/get-code`, an
`x-partner-api-key` header, and `{ "user_identifier": "stable-approved-customer-id" }`.
A successful issuance returns HTTP 201 and a code. HTTP 400 can indicate a prior
redemption. A code can be reissued after expiry using the same identifier. Never
change identifiers to get around redemption limits.

The negotiated amount and validity are stored only in the ignored private catalog.
The official, unmodified SVG icon comes from [Supabase’s logo kit](https://supabase.com/brand-assets).
Public program previews show the partner name and logo; private terms stay in the portal.

### Staff workflow

1. Open `/perks/admin` and sign in using the separate **staff access code**.
2. Open **Add member email**, verify the company is eligible, then add its founder emails under the same
   registered team. Multiple founders may be eligible, but the team gets one benefit.
   Approval does not send email. Renamed products and aliases share the original team ID.
3. The founder signs in to the existing perks directory, opens Supabase, selects
   **Claim credits**, and enters their approved email.
4. The website sends a private link to that exact approved inbox through Resend. The
   request page shows the same confirmation for approved and unknown addresses and
   never reveals a claim link. Merely knowing another founder's email is insufficient.
5. The founder opens the email and presses **Continue to Supabase**. The server checks
   the invitation and current approval, atomically reserves the team claim for this
   founder, and calls the partner API using the permanent team identifier,
   then redirects to `https://supabase.com/redeem?code=…` in production. The founder
   signs in, chooses an organization, and confirms redemption at Supabase.

Staff can **Revoke access** in the same admin page. It invalidates outstanding links;
reapproving that address does not reactivate old links. Revocation cannot cancel a code
already issued or credits already redeemed at Supabase. No terminal command is needed
for routine approvals or founder claims. A replacement founder keeps the same
Supabase customer identifier, so replacing an email cannot reset redemption eligibility.
The first founder to press Continue holds the claim, even if the API call fails or
their email is later revoked. They can retry with a current invitation; other founders
are blocked before issuance. Sending an email or opening a link does not reserve the
claim. The admin page shows who started it. No automatic reassignment is provided.

Staff login has a separate HTTP-only cookie scoped to `/perks/admin`, expiring after
eight hours. A founder's shared access code cannot open the admin list. Approvals are
stored in Upstash Redis, partitioned by staging/production. Email requests are limited
to eight per IP and three per email in 15 minutes, and staff login to eight attempts
per IP in 15 minutes; these limits are atomic and persist across function instances.

### Required server settings

Keep these only in the perks project's server environment. None are bundled into
browser code or build artifacts. Existing portal credentials are still required.

| Variable | Purpose |
| --- | --- |
| `PERKS_ADMIN_ACCESS_CODE` | Random staff-only code, 16–256 characters, different from the founder code. |
| `PERKS_ADMIN_SESSION_SECRET` | Separate 32+ random bytes encoded as base64url (43+ characters). |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | HTTPS Upstash REST endpoint and read/write token for durable approvals and throttles. |
| `RESEND_API_KEY` | Resend sending key, restricted to the verified `886studios.com` domain. |
| `PERKS_EMAIL_FROM` | Bare email address on a verified Resend sending domain. |
| `SUPABASE_PARTNER_ENVIRONMENT` | `staging` by default; set `production` explicitly for live credits. |
| `SUPABASE_PARTNER_API_KEY` | Partner key for the chosen environment. |
| `SUPABASE_CLAIM_SECRET` | Separate 32+ random bytes encoded as base64url; use distinct staging and production values. |

Production has no filesystem or test-inbox fallback. Missing storage or mail settings
disable automated claims while the other perks remain available. The existing release
preflight checks the portal configuration; also verify these integration settings and
perform a delivery test before release. Resend delivery is implemented against its
[send-email API](https://resend.com/docs/api-reference/emails/send-email); durable storage
uses the [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

Resend was configured locally on October 27, 2026 with the dedicated **886 Studios
Perks** sending-only key and `PERKS_EMAIL_FROM=perks@886studios.com`. The key is saved
only in ignored `.env.local` with owner-only permissions. The domain was verified in
Resend, and an API request reached validation with an intentionally omitted recipient;
no email was sent. A real delivery test is still outstanding. The dev server continues
using its local test inbox. Hosted environment configuration and deployment remain pending.

For exceptional staff-assisted delivery, approve the email in admin first, then run
`npm run supabase:invite -- approved@company.com private/company-claim.json` with the
same store, claim secret, origin, and environment as the portal. This writes a private
link without sending mail. Legacy invitations without an approval version are rejected.

Invitations expire after seven days. They are bearer links: anyone possessing one can
claim that recipient’s benefit, so share privately. AES-256-GCM conceals the identifier,
checks tampering, and binds the invitation to staging or production. The fragment keeps
the invitation out of incoming access logs, and the page removes it from browser history
once loaded. Without JavaScript, paste the fragment after `#` into **Invitation code**.
Rotating `SUPABASE_CLAIM_SECRET` invalidates all outstanding invitations.

The invitation authorizes only this Supabase claim, not access to the private catalog.
GET and HEAD never issue a code, so email link scanners are safe. POST requires the
configured origin and a bounded form body. Responses remain no-store/no-index, and the
claim route sends no referrer to other sites. The same-origin policy preserves the
Origin header on browser form submissions, which the server requires for CSRF protection. API keys, upstream bodies, and customer identifiers are
never rendered. API requests time out after ten seconds, reject redirects, and do not
automatically retry. Errors ask the founder to retry later or contact the team.

There are eight attempts per IP and per approved customer per 15 minutes in each process,
accounted before upstream calls. Configure a durable/platform rate limit for
`POST /perks/supabase` through both the public proxy and direct portal hostname before
release; as with login, separate instances have separate counters. Supabase enforces the
one-redemption-per-identifier rule. The portal does not keep a durable redemption ledger.

### Local staging test

The supplied staging key was saved locally in the ignored, owner-only
`.env.supabase-staging`, never in Git or browser assets. To use that file explicitly:

```sh
node --env-file=.env.supabase-staging scripts/dev.mjs
```

Open `http://localhost:4186/perks/admin` using the **local staff code** printed in the
terminal (also stored in ignored `private/dev-access.json`). Approve a synthetic email,
sign in to `/perks` with the separate founder code, and request a claim link. Refresh
admin to open the message from **Local test inbox**. Dev always uses this local inbox,
even if Resend credentials are present; no external email is sent. Local approvals and
messages live in ignored, owner-only `private/approved-emails.json` and
`private/claim-outbox.json`. They are excluded from every build and are never exposed
as public files. They do not carry over to production.

This local file sets the loopback origin, `/perks` base path, and
`SUPABASE_CLAIM_LOCAL_PREVIEW=1` for the invitation CLI. The server stays loopback-only.
Use separate staging and production claim secrets. Do not copy local preview settings
into production.

For staff-only issuance or API diagnostics:

```sh
node --env-file=.env.supabase-staging scripts/issue-supabase-credit.mjs approved-test-id private/test-code.json
```

This diagnostic issuer bypasses the portal approval flow; restrict it to authorized
staff and synthetic testing. Real companies must use the portal or invitation tool,
which binds issuance to the stored team identifier.
The issuer refuses to overwrite an existing output and saves codes in the ignored
private directory. It reserves a pending file before contacting Supabase; if issuance
fails, use a new output filename and the **same customer identifier** on retry. No
credentials or redemption codes are printed to stdout.

Staging uses `https://api.supabase.green`. The supplied key successfully generated a
code for a synthetic test customer on October 27, 2026. A second test also verified
the full staff invitation → portal POST → staging API → labeled result flow.
The automated staff approval → local test email → staging issuance flow was also
verified through HTTP and Safari, including rejection after revocation. All 46 portal
tests and 49 root tests passed. Resend and Redis API contracts were tested with mocks;
real email delivery and hosted storage still need credentials and a release smoke test.
**Staging codes cannot be
redeemed**: the portal displays a clearly labeled test result and never redirects them
to production redemption. This confirms issuance, not end-to-end redemption.

Production requires the partner’s production key and explicit
`SUPABASE_PARTNER_ENVIRONMENT=production`, plus a separate production claim secret.
After deployment is authorized, verify a production test redemption with the partner
before distributing real-company invitations. No production key, remote environment
change, deployment, or partner message was made as part of this implementation.

### Private catalog recovery

The private catalog was absent from this checkout. All 21 existing rendered records
were recovered from the already signed-in production page, preserving names, categories,
headlines, descriptions, About text, offers, eligibility, instructions, links, and codes.
Maintenance source metadata was restored from Notion and repository records. The original
rendered records are backed up in ignored `private/production-catalog-baseline.json`;
`private/catalog.json` contains those same records plus Supabase. Recovery provenance is
recorded in the catalog, with a Notion source snapshot in
`private/notion-recovery-source.json`. No existing production offer was edited.

The new Supabase record is also saved in ignored `private/supabase-offer.json`. To add
it to a restored authoritative catalog while preserving all other entries, run:

```sh
npm run supabase:catalog
```

The updater validates the complete result and replaces the catalog atomically. Keep both
private files backed up through the team’s secure channel; neither belongs in Git. The
build packages only `private/catalog.json`, excluding invitations, codes, source records,
and local environment files.


### Importing the reviewed founder roster

The ignored `private/founder-roster.json` records the eligible founder emails per team,
canonical Notion team IDs, renamed products, and source links. It is private data;
never commit it or package it in the website. The importer copies only team identity,
display name, and approved emails into storage. It never sends email or issues codes.

```sh
npm run founders:import -- private/founder-roster.json --local --check
npm run founders:import -- private/founder-roster.json --local --apply
```

When a hosted release is authorized, set the correct environment and Upstash credentials,
then use `--redis` instead of `--local` with the **same roster IDs**. Local approvals
are not automatically deployed. Re-running an unchanged import preserves approval
versions. An email assigned to another team requires staff review; imports never
move it or revoke existing approvals silently. Each team entry accepts an `emails`
array (the former single `email` field remains supported). Inactive teams, missing contacts, and unresolved records are
listed separately in the private roster and are not imported.

Only the importer can register teams; the staff website selects from that registry.
Use the canonical Notion company page ID, not a founder or product alias ID. Team
records and historical email bindings survive revocation. Production uses atomic Redis
scripts to select exactly one claimant when approved founders submit simultaneously.
The claim reservation persists across restarts, revoked approvals, reimports, and
company display-name changes.
Supabase receives `886-team:<canonical-id>` on every issuance and enforces its own
one-redemption-per-identifier rule. Multiple unexpired/reissued links do not grant
multiple entitlements. Previously issued codes cannot be revoked by removing an email.
Legacy email-only approvals and invitations fail closed; before migrating an existing
live installation, reconcile previously redeemed identifiers with Supabase. This
integration has not issued real production credits yet.

The original Notion import was revoked at the owner's request. Its permanent team
identities remain, with no active contacts from that import except addresses expressly
reapproved in the replacement list. The user-supplied roster now contains **11 emails
across five teams**: Dexter Forge Inc. (3), Amicare Inc. (3), InstaPodz (2), HeyEva (2),
and Peeps (1). Dexter Forge reuses the existing Dexter Copilot ID; HeyEva and Peeps
retain their existing IDs shared with diffusr. and Kardomo respectively. The empty
second bullet for Peeps was ignored. Contact data stays in ignored private files.

Validation covers multiple founder approvals, a real Redis 16-way claim race with
exactly one winner, revocation and restart persistence, old approval migration,
independent entitlements for different teams, and retries after an upstream timeout.
No real founder emails or claim codes are sent by these tests. The roster remains local;
production deployment and a Redis import are separate, explicitly authorized steps.
