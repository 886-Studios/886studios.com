Behavior contracts for refactor passes 0–3

Baseline: `403b0ad`, captured on 2026-10-29 using Node 22.23.4. This tranche changes the public Astro site only. The Node perks portal remains a separate application and deployment. Later passes retain the broader inventory in `refactor-plan.md`.

| Surface | Contract |
| --- | --- |
| Public routes | Keep the generated route set, canonical URLs, trailing-slash policy, sitemap, RSS, and Vercel redirects/rewrites unchanged. `/apply` retains its separate external application redirect. |
| Static compatibility pages | `/programs` → `/ikigai-launchpad`; `/programs/launch-station` → `/launch-station`; `/about/team` → `/team`; `/about/newsroom` → `/newsroom`. |
| Profile compatibility pages | All 15 `/about/<legacy-slug>` pages retain their existing `/team/<slug>` destinations. Exact routes, titles, and fallback labels are recorded in `tests/fixtures/route-contracts.json`. Preserve the existing profile fallback link ID. |
| Redirect execution | External JavaScript uses `location.replace` and appends the current query string and fragment. Preserve `noindex, follow`, destination canonical, immediate meta refresh, and an ordinary fallback link when JavaScript is unavailable. |
| Redirect analytics | Google, Vercel, and LinkedIn markup is enabled only for a production build with `VERCEL=1` and `VERCEL_ENV=production`. Preserve the LinkedIn no-JavaScript pixel. Executable scripts remain external and compatible with the existing CSP. |
| Resource dispatch | `application-guide`, `safe-note-guide`, `cap-table-guide`, `term-sheet-guide`, and `burn-rate-runway-guide` retain their specialized components. Every other resource slug renders the generic article with its existing article prop. |
| Resource output | Preserve all 18 resource URLs, titles, descriptions, ordered H1/H2 headings, complete JSON-LD, content, links, and modified dates. The baseline fixture checks metadata, schema identities/dates, and headings; temporary before/after build comparisons check complete markup and JSON-LD. |
| Shared navigation | Removing the unused banner must not change drawer opening/closing, inert main/footer content, focus trapping/return, Escape, scroll restoration, or the 880/881px breakpoint. |
| Archived drafts | `/manifesto`, `/about/manifesto`, `/rising-star`, and `/community/rising-star` remain unpublished and absent from the sitemap. Retain archived sources, their draft layout/styles, and restoration support. |
| Content and ingestion | Do not edit content records, dates, image sources, feed ingestion, historical corrections, or feed failure policy. A failed/empty live feed still blocks a release. |
| Private portal | Preserve entry points, runtime/environment contracts, cookies, invitation format, Redis keys/records, approval versions, rate limits, and one-claim-per-team behavior. These are outside passes 0–3; run its existing suite as a baseline guard. |

The existing CLI commands and public helper/component APIs remain available. `npm run test:built` is an additive command for checks against a fresh `dist/`; `npm run validate` runs it after building. GitHub's offline code checks remain unchanged, and Vercel's existing validation command includes the built-output checks.

Fixture maintenance: the expectations were captured from the original rendered output, before implementation. For an intentional content or route change, review the corresponding fixture diff with the source change. Never regenerate fixtures merely to silence a refactor failure. No production feed, private catalog, founder identity, credential, or invitation token is included in these fixtures.
