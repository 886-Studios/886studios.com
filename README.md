# 886 Studios Website

The public website for 886 Studios, built with Astro and deployed on Vercel.

[Live website](https://www.886studios.com) ·
[GitHub repository](https://github.com/886-Studios/886studios.com)

This README covers the public website. The separately deployed `/perks` app has its own
[setup and deployment guide](apps/perks-portal/README.md). Root npm scripts build and test
the public site; use `npm --prefix apps/perks-portal ...` for the portal. GitHub's validation
workflow runs code checks for both apps.

[Quick start](#quick-start) · [Troubleshooting](#common-pitfalls) ·
[Checks and preview](#checks-and-preview) · [Scripts](#scripts) ·
[Environment](#environment) · [Editing](#editing-workflow) ·
[Content](#content-boundaries) · [Deployment](#deployment)

## Prerequisites

- Node 22 (`22.12.0` or newer within Node 22), matching `.nvmrc`
- npm `9.6.5+`
- Git, with a full clone for accurate generated content dates

This repo uses `package-lock.json`, so prefer npm over pnpm or yarn unless the package manager strategy changes.
`.npmrc` enforces the supported Node range during installation, including the upper limit
of Node 22. GitHub Actions reads `.nvmrc`; use the same major version locally and on Vercel.

## Quick Start

No environment variables or API keys are required to run the public website.
With [nvm](https://github.com/nvm-sh/nvm) installed, clone the repository and start the dev server:

```bash
git clone https://github.com/886-Studios/886studios.com.git
cd 886studios.com
nvm install
nvm use
npm ci
npm run dev
```

Already have a checkout? Run from its existing directory, starting at `nvm install`.
With another version manager, select Node 22.12+ within Node 22 before running `npm ci`.
All commands below run from the repository root unless stated otherwise.

Open `http://127.0.0.1:4173/` to see the homepage. Edits in `src/` reload in the browser;
press **Ctrl+C** in the terminal to stop the server. If the port is occupied, use the
alternate URL Astro prints. For testing from another device on a trusted network, use
`npm run dev -- --host 0.0.0.0`.

**Builds and pages using blog content need the live Substack feed.** An unavailable,
blocked, invalid, or empty feed fails the build to protect existing article URLs.
The [code checks below](#checks-and-preview) do not fetch the live feed.

The Astro dev server does not serve the separate `/perks` app or apply Vercel's proxy rules.
A working portal preview also needs its ignored private catalog; see the
[portal setup guide](apps/perks-portal/README.md#local-preview).

## Common Pitfalls

| Symptom | What to do |
| --- | --- |
| `npm ci` reports an unsupported engine | Run `nvm install && nvm use`, then retry. Node versions above 22 are also outside the supported range. |
| `npm ci` reports a lockfile mismatch | If dependency edits were intentional, run `npm install` and commit `package-lock.json` with `package.json`. Otherwise restore the matching committed files and rerun `npm ci`. |
| Build fails with `Could not load ikigai Insights` | Check access to the feed configured in `src/lib/substack.ts` and retry when it recovers. Use `npm run validate:code` for checks that do not fetch the feed. |
| Port `4173` is occupied | Use Astro's printed URL or choose a port with `npm run dev -- --port 4174`. |
| Preview is stale, or a check reports missing `dist/` | Run `npm run build` first. SEO and security checks inspect the existing build. |
| A production build reports `analytics must match the deployment environment` | Run the [production-mode check](#production-mode-check) to reproduce it. Redirect pages need the same analytics components as other pages. Build and security-check flags must match. |
| `/perks` is unavailable locally, or portal tests skip a catalog check | Follow the [portal setup guide](apps/perks-portal/README.md#local-preview). Its server is separate, and a fresh clone omits the private catalog. |
| `/events` is stale | Run `npm run events:sync`, review the archive diff, then rebuild. No Luma API key is needed. |
| SEO checks report sitemap parity errors | Give every indexable page one self-referencing canonical and include its route in `src/pages/sitemap.xml.ts`. |
| An image still looks stale | Regenerate its variants with `npm run images:optimize` when applicable, then check the asset URL and browser/CDN cache. |
| Content generation warns that Git metadata is unavailable | Use a full Git clone for accurate dates. The generator keeps the committed fallback when it cannot derive dates. |

Edit source under `src/` and `public/`, not generated files in `dist/`. Keep screenshots,
traces, local environment files, and OS metadata out of commits; `.artifacts/` is ignored.

## Checks and Preview

### Fast local checks

Reproduce GitHub's checks for both apps without fetching external feeds:

```bash
npm run validate:code
npm --prefix apps/perks-portal test
```

Successful checks report no type errors or failed tests. The portal's private-catalog test
is skipped when that ignored file is absent; the remaining portal tests use fixtures.

### Full site validation

Before opening a PR, run the public site's complete validation:

```bash
npm run validate
```

This runs diagnostics, tests, a static build, and generated-site SEO and security checks.
It requires the live Substack feed. A normal local run ends with
`Security validation passed: … analytics disabled.` The perks portal has a separate
[test and build workflow](apps/perks-portal/README.md#tests-and-build).

### Production-mode check

Before a production release, also check the markup that is enabled only on Vercel production.
In macOS/Linux shells:

```bash
VERCEL=1 VERCEL_ENV=production npm run validate
```

Success ends with `Security validation passed: … analytics production only.` The flags
apply to the build and its checks in this command. Keep them out of local environment files.
This command enables real analytics in the generated HTML, so rebuild normally before
opening a local preview.

### Local preview

Build fresh output with local analytics settings, then serve `dist/`:

```bash
npm run build
npm run preview
```

Use the URL printed by Astro. After further edits, rebuild before refreshing the preview.
Vercel redirects, proxy rules, and response headers must be checked on a deployment.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Astro dev server. |
| `npm run check` | Run Astro diagnostics and TypeScript checks. |
| `npm test` | Run the website's Node regression tests in `tests/`. |
| `npm run build` | Build all static routes into `dist/`. |
| `npm run check:seo` | Validate metadata, schema, links, images, robots, and sitemap parity in an existing `dist/` build. |
| `npm run check:security` | Check built scripts against CSP and verify analytics are gated by deployment environment. |
| `npm run validate:code` | Run type checks and regression tests without external feed access. |
| `npm run validate` | Run diagnostics, tests, build, and the SEO and security regression suites. |
| `npm run preview` | Serve the latest `dist/` build locally. |
| `npm run events:sync:dry-run` | Fetch Luma events and report changes without writing the archive. |
| `npm run events:sync` | Fetch Luma events and update `src/data/luma-events.json`. |
| `npm run content-dates:generate` | Regenerate content dates from Git history. |
| `npm run images:optimize` | Generate WebP variants for configured images in `public/assets/`. |
| `npm run indexnow:dry-run` | Inspect the generated IndexNow submission without sending it. |
| `npm run indexnow` | Submit generated or explicitly provided production URLs to IndexNow. |

The `dev`, `check`, and `build` commands generate content dates automatically; `build` also
runs image optimization. These hooks can update generated source dates and image files.
Review any resulting diff before committing. Do not hand-edit `src/data/contentDates.generated.ts`.

Use `npm install <package>` only when intentionally changing dependencies. For normal setup and CI-style installs, use `npm ci` so `package-lock.json` is respected exactly.

## Environment

All variables in the root [.env.example](.env.example) are optional for the public website.
The perks portal has [separate configuration](apps/perks-portal/README.md#deployment).

To create local configuration without replacing an existing file:

```bash
test -f .env || cp .env.example .env
```

Optional ownership tokens:

```bash
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
YANDEX_SITE_VERIFICATION=
BAIDU_SITE_VERIFICATION=
```

These variables configure ownership meta tags. Google also has a public fallback token
in `src/config/site.ts`; setting its variable overrides that fallback. Ownership tokens
are normally configured in Vercel and are not needed for local work.

All `.env*` files, including `.env.local`, `.env.production`, and `.env.staging`, are ignored
except `.env.example` templates. Search-verification tokens and the IndexNow key are public
ownership proofs. Portal access codes and session secrets belong in the portal's configuration,
not in the public-site project or browser code.

The template also lists optional `INDEXNOW_*` overrides. These are read from exported shell
variables, not loaded automatically from `.env`; see [Search indexing](#search-indexing).

Google Analytics and Vercel Analytics require both an Astro production build and
`VERCEL=1`, `VERCEL_ENV=production`. Normal local builds and Vercel previews omit them.
The [production-mode check](#production-mode-check) explicitly enables that markup for
validation. The Google measurement ID is in `src/config/site.ts`.

Shared conversion events are sent to both providers by `src/scripts/analytics.ts`. Trackable links and forms opt in with `data-analytics-event`, plus optional `data-analytics-placement` and `data-analytics-label` attributes. Do not put email addresses, names, form values, or other personal data in these attributes. Current funnel events are `program_interest`, `application_started`, `newsletter_signup`, `event_registration_started`, `event_details_opened`, `event_calendar_opened`, `founder_ama_opened`, `blog_post_opened`, `substack_publication_opened`, and `substack_post_opened`.

## Search indexing

The production site exposes:

- `https://www.886studios.com/robots.txt`
- `https://www.886studios.com/sitemap.xml`
- `https://www.886studios.com/llms.txt`
- `https://www.886studios.com/indexnow-key.txt`

After the initial production deployment or a site-wide content refresh, notify
IndexNow-compatible search engines with the full sitemap:

```bash
npm run build
npm run indexnow
```

Use `npm run indexnow:dry-run` after building to print the URL count and request configuration
without making network requests. The real submission reads canonical URLs from the generated
sitemap, verifies that the public key file is live, and sends the URLs to the shared endpoint.
A successful submission prints `IndexNow accepted … URLs`.

Optional CLI overrides are documented in `.env.example`: `INDEXNOW_SITE_URL`,
`INDEXNOW_ENDPOINT`, `INDEXNOW_KEY_FILE`, and `INDEXNOW_KEY`. Export them in the shell
when invoking the CLI; it does not load `.env` automatically. The site must be a canonical
HTTPS origin and the endpoint must use HTTPS without embedded credentials or fragments.
The key file must resolve inside `public/`, including when symlinks are used. Requests
time out after 15 seconds and reject redirects; replace old HTTP or redirecting overrides
with their final HTTPS URLs. The IndexNow key and search-verification tokens are public
ownership proofs, not private credentials.

For routine releases, submit only URLs that were added, changed, redirected, or removed:

```bash
npm run indexnow -- \
  --url=https://www.886studios.com/resources/example \
  --url=https://www.886studios.com/old-page
```

Google Search Console, Bing Webmaster Tools, Yandex Webmaster, and Baidu Search Resource
Platform still require an owner account. Add the requested HTML meta verification token as
the matching production variable listed under [Environment](#environment), then redeploy.

Enter `https://www.886studios.com/sitemap.xml` in each webmaster dashboard after ownership
verification. Bing can also import the verified property and sitemap directly from Google
Search Console.

## Blog content

The Blog supports two sources, merged by publication date during the static build and
published in both `/blog` and the site's `/rss.xml` feed:

- ikigai Insights posts imported from the Substack RSS feed;
- website-only Markdown articles stored in `src/content/blog/`.

To add a website-only article, copy `src/content/blog/local-article-template.md`, rename it to
the intended URL slug, replace the frontmatter and body, and set `draft: false`.

```md
---
title: "Article title"
description: "A concise description used on the Blog page and in search metadata."
publishedAt: 2026-07-28
author: "886 Studios"
image: "/assets/blog/article-image.jpg"
imageAlt: "A useful description of the image"
imageWidth: 1600
imageHeight: 900
draft: false
---

Write the article in Markdown here.
```

The filename becomes the URL by default, such as
`src/content/blog/founder-lessons.md` → `/blog/founder-lessons`. An optional `slug` field can
override the filename. Store article images in `public/assets/blog/`.

Local articles use the same Blog index and article design as Substack posts. They do not show
the “Originally published in ikigai Insights” footer unless an optional `substackUrl` is added.
If a local article and a Substack post share a slug, the local article takes precedence.
Drafts are excluded from builds, the sitemap, the Blog index, and the RSS feed.

If the Substack feed is unreachable, invalid, or empty, the build fails to protect
published article URLs from being removed. Retry after the feed recovers; Vercel
keeps the previous successful production deployment live.

Newsletter forms open Substack's subscription page in a new tab with the entered
email prefilled. Substack handles confirmation and any signup errors.

## Deployment

The site is a static Astro build from
[886-Studios/886studios.com](https://github.com/886-Studios/886studios.com), deployed to the
Vercel project `886studios-redesign`. Keep that Vercel project name: branch protection and
the event-sync workflow require its `Vercel – 886studios-redesign` status check.

To update an existing checkout that still uses the former GitHub URL:

```bash
git remote set-url origin https://github.com/886-Studios/886studios.com.git
```

- Build command: `npm run validate` (enforced by `vercel.json`)
- Install command: `npm ci`; runtime: Node 22
- Output directory: `dist/`
- Canonical site URL: `https://www.886studios.com`
- Redirects and security headers: `vercel.json`
- Optional production env vars: the four search-engine verification tokens listed above
- Production branch: pushes to `main` deploy through the connected Vercel project

Vercel also proxies `/perks` to the separate perks project and `/timer` to the timer app.
`npm run dev` and `npm run preview` serve only the Astro site; they do not emulate the
redirects, proxy rules, or response headers in `vercel.json`. Verify those on a Vercel deployment.

### Release workflow

1. Work on a branch and run the [local and production-mode checks](#checks-and-preview).
2. Push the branch and wait for both required checks:

   | Check | Runs |
   | --- | --- |
   | `Validate` | Website diagnostics/tests and perks portal tests in GitHub Actions |
   | `Vercel – 886studios-redesign` | Full site validation, including the live feed, build, SEO, and CSP checks |

3. Merge into `main` after both pass. A separate review approval is not required.
4. Wait for the **production** deployment to succeed, then verify the live routes and redirects.
   A passing preview alone does not verify production-only analytics markup.

GitHub checks avoid the live feed because Substack can return HTTP 403 to GitHub-hosted
runners. Vercel runs the feed-backed build. Both GitHub workflows use full Git history
for content dates and pin their actions to reviewed commit SHAs.

The protection settings in [.github/main-branch-protection.json](.github/main-branch-protection.json)
require both checks, including for administrators, and block force pushes and branch deletion.
The file records the settings; committing it does not apply them to a new repository.

The production version before the October 5, 2026 redesign is preserved on
[archive/production-2026-10-05](https://github.com/886-Studios/886studios.com/tree/archive/production-2026-10-05)
at `cd3139b`.

### Scheduled event updates

The Events page uses `src/data/luma-events.json`. `Sync Luma events` checks Luma's public
calendar every 30 minutes and commits only when event data changes; no API key is required.
Past events remain in the archive after leaving Luma's feed, while unpublished future events
are removed. For a manual refresh, run `npm run events:sync` and review the diff.

`/events` uses `CollectionPage` and `ItemList` structured data linking to the individual
Luma pages. Do not add `Event` rich-result markup to this listing: Google's
[event guidelines](https://developers.google.com/search/docs/appearance/structured-data/event#technical-guidelines)
require a dedicated single-event page. Supporting Event rich results on this domain would
require local event detail pages with visible, verified descriptions, venue addresses,
hosts, and applicable ticket/speaker details. After deploying this correction, inspect
`/events` in Search Console and start validation for the old Event warnings; they may
remain in the report until Google recrawls the page.

The workflow validates each candidate on a temporary branch and waits for Vercel before
updating `main`. It records its own completed `Validate` status because token-created
pushes do not trigger another Actions run. A failed check, a ten-minute deployment timeout,
or a newer commit on `main` stops publication; the next run retries from the latest code.

If scheduled sync fails, manually run `Sync Luma events` on `main` and inspect its log.
The script falls back to Luma's public iCal feed if the richer feed is unavailable.

### Runtime configuration

The script CSP rejects inline JavaScript. Astro keeps executable scripts external,
including analytics initialization and redirect helpers; JSON-LD remains inline data.
Keep new executable scripts external as well. Inline styles are still allowed to preserve
the existing design and dynamic layout behavior.

Use the [configuration hardening checklist](docs/config-hardening-checklist.md) for known
validation gaps, credential handling, and deployment checks. It records recommendations;
it does not confirm live environment settings, firewall rules, or branch protection.

The Contact page links directly to `it@886studios.com` with a `mailto:` URL, so
it does not require an email provider or server-side configuration.

## Architecture Map

```text
src/
  components/
    PageHero.astro              shared inner-page hero scaffold
    SiteNav.astro               global navigation markup
    SiteFooter.astro            global footer markup
    GoogleAnalytics.astro       gtag wrapper
    VercelAnalytics.astro       Vercel analytics wrapper
    pages/                      route body components
  config/
    site.ts                     canonical URL, metadata, analytics, route preloads
  content/
    blog/                       website-only Markdown blog articles
  content.config.ts             typed schema and loader for local articles
  data/
    siteContent.ts              global/nav/page copy and structured content
    partnerProfiles.ts          partner profile content and lookup map
    resourceArticles.ts         resource article content
    luma-events.json             archived Luma events
    contentDates.generated.ts    generated dates; do not edit manually
  layouts/
    BaseLayout.astro            document shell, metadata, global chrome
  lib/
    blog.ts                     merged local Markdown and Substack blog source
    luma.ts                     archived Luma event-card normalization
    seo.ts                      metadata content and reusable JSON-LD helpers
    substack.ts                 Substack RSS adapter and article normalization
    urls.ts                     shared safe-link helpers for data-driven links
  pages/                        Astro route entrypoints and generated sitemap
  scripts/
    site.ts                     global browser behavior
    home.ts                     homepage-only browser behavior
  styles/
    global.css                  visual system and page styles
public/                         static assets
scripts/
  check-seo.mjs                 generated-site SEO regression checks
  check-security.mjs            generated-site CSP and analytics checks
  generate-content-dates.mjs     Git-derived content dates
  optimize-images.mjs           configured image variants
  sync-luma-events.mjs           event archive refresh
  submit-indexnow.mjs           IndexNow URL submission utility
tests/                          website regression tests
apps/perks-portal/               independent Node app with its own tests and build
.github/workflows/              validation and scheduled event sync
vercel.json                     redirects and production security headers
```

Public images live in `public/`. Configured WebP variants are generated by
`scripts/optimize-images.mjs`; when adding an image, update that script if it needs variants.

## Editing Workflow

Use this path for most changes:

1. Identify the route in `src/pages/`.
2. Open the matching body component in `src/components/pages/`.
3. Edit copy/data in `src/data/` when possible.
4. Edit page metadata and structured data in `src/lib/seo.ts`; edit shared defaults, canonical origin, analytics IDs, or preloads in `src/config/site.ts`.
5. Edit shared chrome in `SiteNav.astro`, `SiteFooter.astro`, or `BaseLayout.astro`.
6. Edit browser behavior in `src/scripts/`, not inline in page markup.
7. Run `npm run validate`.
8. For visual or interaction changes, start `npm run dev` and live-test the affected route.

Commit small, reviewed slices.

## Notion Task Tracker

Use the Notion database as the source of truth for project tasks:

- Database: [886 Studios website redesign](https://app.notion.com/p/352b93834d698023b0baefba50c701a7)
- Data source: `collection://352b9383-4d69-8013-a35a-000bb4fa79e2`
- Task properties: `Task`, `Progress`, `Page`, `PIC`, `Date last edited`
- Progress values: `Not started`, `In process`, `Complete`
- Page values: `Home`, `About`, `Programs`, `Events`, `Contact`, `Resources`, `General`

When working from this tracker, fetch the database first to confirm the current schema. Before implementing a task, update its `Progress` to `In process`; after code changes and validation, update it to `Complete`. Add new project tasks directly to the same data source with at least `Task`, `Progress`, and `Page` set.

## Content Boundaries

### Public routes

The current information architecture is deployed from `main`.

The top bar contains Home, three menus, Contact us, and the application CTA. The mobile
drawer uses the same hierarchy. Edit it in `siteContent.nav.items`.

| Group | Page | Route | Content |
| --- | --- | --- | --- |
| | Home | `/` | Homepage |
| Programs | ikigai Launchpad | `/ikigai-launchpad` | Program overview |
| Programs | Launch Station | `/launch-station` | Launch Station overview |
| Community | Events | `/events` | Luma event archive |
| Community | Resources | `/resources` | Resource library |
| About us | Overview | `/about` | Studio introduction |
| About us | Team | `/team` | Operating team and advisors |
| About us | Portfolio | `/portfolio` | Backed companies |
| About us | Blog | `/blog` | Local articles and ikigai Insights |
| About us | In the News | `/newsroom` | Media coverage |
| | Contact us | `/contact` | Application, email, and community links |
| Hidden | Manifesto | `/manifesto` | Direct URL only; draft placeholder content; noindex |

Team and Newsroom use
`src/components/AboutTeam.astro` and `src/components/AboutNews.astro`, also shared
with the `/about` page. Profiles live at `/team/<slug>`; former `/about/<legacy-slug>`
profile URLs redirect to them.

The former `/about/manifesto`, `/about/team`, and `/about/newsroom` paths redirect
to their root-level routes. `/programs` redirects to `/ikigai-launchpad`, and
`/programs/launch-station` redirects to `/launch-station`.

Rising Star is archived in `src/archived/rising-star.astro`. Its `/rising-star` and
`/community/rising-star` routes are unpublished and return 404. To restore the
draft, move its source back to `src/pages/rising-star.astro` and restore its menu
entry. Manifesto remains available by direct URL, but is hidden from navigation.
Both pages are excluded from the sitemap.

Draft pages use `src/layouts/BlankPageLayout.astro` and remain `noindex` and excluded
from the sitemap while their content is unfinished. When a page is ready, replace its
placeholder content, give it metadata with `BaseLayout`, and add it to `src/pages/sitemap.xml.ts`.

### Existing content sources

- Navigation and main CTA: `siteContent.nav`
- Homepage copy and logo wall: `siteContent.home`
- Programs and Launch Station copy: `siteContent.programs`
- Resources landing page: `siteContent.resources`
- About page team and partner lists: `siteContent.about`
- Events labels/supporting copy: `siteContent.events`
- Events archive: `src/data/luma-events.json` (maintained by `npm run events:sync`)
- Contact page copy and destination links: `siteContent.contact`
- Page titles, descriptions, and structured data: `src/lib/seo.ts`
- Long-form resource pages: `src/data/resourceArticles.ts`
- Partner detail pages: `src/data/partnerProfiles.ts`

The `/apply` route redirects to the shared nav CTA URL. Do not rebuild a local application form unless product direction changes.

## Design Context

Read `.impeccable.md` before making visual changes. It captures the target audience, brand tone, and design constraints for the site.

Current visual direction: dark 886 language, restrained purple accents, real founder photos, strong typography, and direct founder-facing copy. Avoid generic marketing sections, decorative effects beyond existing intentional treatments, or large visual rewrites without live screenshots.

## Validation Checklist

For website changes, run the full validation in [Checks and preview](#checks-and-preview).
That section also gives the commands for GitHub's checks without live feed access.
For portal changes, follow its [tests and build guide](apps/perks-portal/README.md#tests-and-build).

`npm run check:seo` reads generated files from `dist/`, so do not run it before the first
build. The regression suite checks titles, descriptions, canonicals, Open Graph and Twitter
metadata, JSON-LD parsing, internal links, image attributes, labels, `robots.txt`, `llms.txt`,
the sitemap, and production URL safety.

For local performance checks, build and serve the production output first:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Then run Lighthouse against the affected route and save the report outside tracked source:

```bash
mkdir -p .artifacts/performance
npx --yes lighthouse http://127.0.0.1:4173/ikigai-launchpad \
  --only-categories=performance \
  --preset=desktop \
  --chrome-flags="--headless=new" \
  --output=html \
  --output-path=.artifacts/performance/programs-desktop.html
```

For production Core Web Vitals, run WebPageTest against the deployed URL with at least 3 runs, first-view and repeat-view enabled, and the same route set used for frontend QA. Store exported reports under `.artifacts/performance/`.

For frontend QA, verify at least:

- `/`
- `/ikigai-launchpad`
- `/launch-station`
- `/about`
- `/team` and `/newsroom`
- `/events`
- `/resources` and `/blog`
- `/contact`
- mobile navigation open/close
- `/apply` redirect markup when touching CTA or redirect behavior

For security-sensitive changes, review `vercel.json` and run `npm audit` when network access is explicitly approved.

For dependency maintenance:

```bash
npm outdated --long
npm audit --audit-level=moderate
```

The project has no committed Playwright suite. Use the available browser tooling in the current environment for live validation and keep generated QA artifacts outside the repo.
