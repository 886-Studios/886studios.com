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
remaining deployment work. No new database or Redis service is required by this release.

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

`private/catalog.json` contains 21 partner entries: 20 sourced offers and Zettabyte, whose credit amount and redemption link are unconfirmed. Its entry explicitly asks founders to contact the team. Negotiations, rejected applications, and unavailable offers are excluded.

The catalog was checked against the complete Notion founder-facing Perks database and Perks – Internal on September 22, 2026. Linear is included from its completed internal record. Zettabyte is included from the public 886 website and the August 31 partnership meeting note. Source URLs are retained per entry for maintenance but not rendered to portfolio visitors. Detailed source snapshots are kept locally in `private/source-records.json` and are never included in the build.

Each entry has an ID, name, category, short benefit, explanation, eligibility, instructions, redemption link, source, and optional program restrictions, secondary links, and redemption code. Prices and offer limits retain the qualification in the source. Contact-based perks use the recorded email or an introduction from the 886 team. The Google Cloud partner URL is preserved exactly as recorded; its unusual query string should be confirmed with the partner before launch.

The catalog and source snapshots are **git-ignored deliberately** so partner links and codes cannot accidentally enter a public repository. Back up the private catalog securely. A fresh clone needs the private catalog supplied before building; builds fail if it is absent. Edit this file on the server side; never move it into `public/` or import it into the browser script.

Every entry also has a brief `about` introduction explaining the company or product, an official `aboutSource` URL, and an `aboutReviewedAt` date. All 21 introductions were checked against official sites on September 23, 2026. These fields stay in the ignored catalog alongside the existing content. Search includes the introduction text; source URLs are retained for maintenance. Each details box starts with an About section spanning the full width, followed by the existing Perk, Eligibility, and How to redeem layout.

## Design

Uses the 886 Studios logo, Geist typography, dark background, and restrained purple actions. The title is “886 Studios Exclusive Perks.” The header logo links to the main 886 website. There is no navigation title, subtitle, footer logo, portfolio lock badge, or decorative divider line.

Link previews use the main site's existing 1200 × 630 logo image at `/assets/886-studios-preview.png`, through Open Graph and Twitter metadata on both the access screen and directory. Only public branding appears in preview metadata; private offer details stay behind the access code, and all portal responses retain their no-index protection.

Search, a compact Category / A–Z sort toggle, and rounded type-filter buttons share one form. The toggle uses native radio inputs with a 32px visual track, 44px tap targets, keyboard arrow navigation, and an accessible “Sort by” legend. Category sorting follows the filter order and alphabetizes partners within each type; A–Z orders all partners by name. The sort choice combines with search and filters, survives refresh through the URL, and is retained when clearing filters. All controls work without JavaScript; when JavaScript is available, results update immediately. On small screens, search takes a full row, the compact toggle aligns right below it, and the filter buttons wrap. Desktop entries use separate Partner, Type, and Perk columns.

At phone widths, each entry reads as partner, offer, then a compact Type field and an explicit View perk action. Expanded details use one opaque dark-purple box: an About introduction above separate Perk, Eligibility, and How to redeem columns on desktop, with all sections stacked on phones. The panel is a flat, opaque deep purple with a quiet border and minimal corner rounding. They follow About → Perk → Eligibility → How to redeem, with the redemption links grouped after the instructions. The organization ID is inline with its copy action, without a nested panel. A restrained heading, compact partner rows, and aligned columns organize the directory without divider lines, gradients, translucent fills, or glow effects. Inputs are 16px; the disclosure action and main buttons have at least 44px targets. The mobile access screen uses the same readable text sizes and a simple single column.

The portal tests cover access control, privacy, content, and subpath login, assets, filters, redirects, cookie scope, and private-path rejection. The main GitHub validation workflow also runs portal tests; the private-catalog check runs locally when the catalog is present. Browser checks covered actual CSS viewport widths of 320, 390, 430, 768, 843 (landscape), and 1280px. No horizontal overflow was found. Checked combined search/type filtering, retained filters after refresh, empty results and reset, expanded long terms, invalid and valid access codes, and authentication. Physical iPhone/Android devices have not been tested. Partner claims were not submitted.

The original concept in `design/directory-concept.png` predates the requested title, divider removal, and mobile hierarchy changes. It is ignored because it contains private offer amounts.
