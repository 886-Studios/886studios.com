Parity record for refactor passes 0–3 — 2026-10-29

Baseline commit: `403b0ad`. Runtime: Node 22.23.4, downloaded to a temporary directory from nodejs.org and verified against its published SHA-256 checksum. No repository dependency or runtime requirement changed.

| Baseline check | Result |
| --- | --- |
| `npm run validate:code` | 0 Astro errors/warnings; 49 tests passed. Existing unused-import hints are unrelated to these passes. |
| `npm --prefix apps/perks-portal test` | 53 passed; optional real-Redis test skipped (`REDIS_SERVER` unset). No storage changes are in scope. |
| Production-mode build | 104 HTML pages generated from the live Substack feed. |
| Production-mode `check:seo` | 83 indexable pages and 83 sitemap URLs passed. |
| Production-mode `check:security` | All 104 pages passed CSP, privacy, and production analytics checks. |
| New built-output contracts, before refactoring | 21 tests passed: 19 redirect cases, all 18 resource pages, and archived-route exclusions. |

The sandbox initially blocked live-feed DNS access. The successful baseline build used network-enabled execution; no feed fallback was added. The unsupported Node 26 shell failure recorded during planning was resolved by using the already-required Node 22 runtime.

Browser plugin not available. Browser validation uses the existing cached Playwright installation, with temporary scripts and screenshots outside the repository. The target flow is: open a legacy route with query/fragment → reach the same destination; open the mobile navigation → close with Escape and return focus. Resource pages must retain their rendered content at phone and desktop widths.

The baseline production build is retained temporarily for complete output and JSON-LD comparison. Resource fixtures retain exact headings, metadata, schema identities, and dates. Built redirect tests execute the emitted JavaScript with four query/fragment combinations per route and check the rendered no-JavaScript fallback. Browser checks cover actual navigation and archived 404 responses.

| Implemented pass | Structural change | Parity result |
| --- | --- | --- |
| 0 | Added scoped contracts, captured output fixtures, and `test:built` in the existing full validation command. | The same 21 built-output checks pass before and after implementation. No dependency or test-runner migration. |
| 1 | Removed the unimported banner component, 154 lines of exclusive CSS, and three unused navigation references. Corrected contradictory archive documentation. | No banner appeared in any of the 104 baseline pages. Navigation still passes; all four archived URLs return 404. Archived sources and restoration dependencies remain. |
| 2 | Five route entry points use `RedirectLayout.astro` and one external module script. | All 19 legacy URLs retain title, canonical, robots, fallback text, destination, query, and fragment. Browser navigation succeeds for every URL; no-JavaScript meta refresh succeeds for static and profile examples. |
| 3 | Replaced the resource dispatch ternary with a typed `Map` and explicit generic fallback. | All 18 resource pages retain headings, metadata, schema identities/dates, and complete generated markup. |

Final command results:

- `VERCEL=1 VERCEL_ENV=production npm run validate`: passed; 0 Astro errors/warnings (one pre-existing unused-import hint), 49 source regression tests, 21 built-output tests, 104-page build, SEO, and production analytics/CSP checks.
- Normal local mode: `npm run build`, `npm run test:built`, `npm run check:seo`, and `npm run check:security` passed. The final `dist/` has analytics disabled for local preview.
- The baseline portal suite passed 53 tests with one optional Redis skip. No portal source or storage changes required further portal testing.
- Content-date generation reported 24 source-backed dates without falling back; generated dates, image assets, dependency files, and Vercel configuration have no source diff.
- Before/after production comparison: all 104 HTML pages match after normalizing build asset filenames, inter-tag whitespace, and the intentionally added `data-redirect-destination` marker. Sitemap and RSS are byte-for-byte identical. Complete resource JSON-LD is unchanged.
- `git diff --check`: passed.

Browser environment: local Astro preview at `http://127.0.0.1:4187`, cached Playwright 1.62.1 with the already installed Chromium headless shell (cache revision 1223), reduced motion enabled for stable screenshots. No browser packages were added to the project.

| Browser check | Result |
| --- | --- |
| Page identity and meaningful content | Passed for the sampled screenshots; all 18 resource pages have their H1. |
| Framework overlay | None on sampled routes. |
| Console and runtime health | No errors or warnings in either run. Expected 404 checks used a separate page. |
| Desktop/mobile screenshots | Home, Team, specialized application guide, and generic Y Combinator guide at 390×900 and 1440×900: all eight before/after PNGs are byte-for-byte identical, with zero changed pixels. |
| Navigation interaction | At 390 and 880px: keyboard open, focus moved to close button, main content inert, focus retained inside drawer, Escape close, inert removed, focus returned to trigger. At 881px: desktop navigation boundary preserved. |
| Redirect interaction | All 19 routes navigate with `?ref=parity#details` intact. Two representative routes also navigate with JavaScript disabled. |
| Archive response | All four archived URL variants return HTTP 404. |

Temporary evidence lives under `/private/tmp/886-refactor-tools/`: `baseline-production/`, `baseline-browser/`, `after-browser/`, the browser check script, and command logs. Screenshots, downloaded tools, production output, and private data are not committed. The contracts and parity record are the durable review artifacts.

Hosted Vercel redirects were not redeployed or retested; their configuration is unchanged. Browser coverage is Chromium at the listed widths, not a claim of exhaustive cross-browser coverage. Passes 4 onward, dependency upgrades, and architectural migrations remain outside this implementation.
