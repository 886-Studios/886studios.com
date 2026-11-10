# 886 rebranding follow-up

Branch: `rebrand/886-launchpad`. Final local review: November 10, 2026. This review does not push, merge, or deploy the branch.

## Completed in the website

- Current program copy, navigation, team biographies, founder guides, cohort labels, accessibility labels, analytics labels, and structured data use **886 Launchpad**.
- `/launchpad` is the canonical program route. `/accelerator`, `/ikigai-launchpad`, `/programs`, and their trailing-slash variants redirect there; the legacy `withikigai.com` redirect also targets it. Sitemap, content dates, preload configuration, and `llms.txt` use the new route.
- Removed standalone ikigai program logos, the unused application announcement graphic, and old newsletter artwork. The program heading uses live text.
- Website newsletter copy, subscription cards, metadata, and attribution use **886 Insights**. Subscription and RSS endpoints remain at `886studios.substack.com`.
- **886 Residency** is consistent across the public site and the separate perks portal's eligibility footer. Its community photography, shared program typography, responsive layout, and contact CTA are in place.
- The global announcement explains the rebrand, links to rolling applications, and can be dismissed for the browser session. Its controls become inert while the mobile menu is open and become available again when the menu closes.
- Application guidance consistently describes rolling admissions and the Spring 2027 batch. Partner perk labels, author profile links, social-preview image dimensions, and generated content dates have been checked.
- Past event records and names are unchanged. Original third-party article titles and historical imported articles are preserved. Existing photos and their filenames are retained; this change does not retouch historical signage or clothing in photography.

## Remaining external changes

These are follow-up items, not changes made by this branch. External account settings and separately maintained applications were not changed or fully verified in this review. The listed references identify known destinations, not a fresh audit of their current settings.

| Surface | Existing reference | Follow-up |
| --- | --- | --- |
| Substack publication | Website previously called it ikigai Insights; publication is hosted at `886studios.substack.com` | Set the publication name to **886 Insights** in Substack; review its About page, artwork, email header/footer, welcome email, and sender name. Keep the existing URL unless a separate migration is planned. |
| Instagram | `instagram.com/ikigai_launchpad` | Update display name, biography, logo, and program link. Confirm an available handle before changing website links. |
| Threads | `threads.net/@ikigai_launchpad` | Coordinate its profile/handle with Instagram, then update the website and structured-data profile links. |
| Legacy domain | `withikigai.com` and `www.withikigai.com` | Keep redirects active for old links; verify the new destination after deployment. |
| Timer application | `/timer` proxies `ikigai-timer.vercel.app` | Review the timer's visible title, logo, and Vercel project name in its own repository. |
| Link hubs | Earlier audit records `portaly.cc/ikigai` and `linktr.ee/ikigai_launchpad` | Review current ownership/content; rename profiles and update the accelerator link. |
| External accelerator listings | Earlier audit records Startup Portal Taiwan | Request current program-name and URL updates; preserve historical reporting. |
| Application portal | `apply.886studios.com` | Review its heading, confirmation screens, email templates, and attached documents for the old name. Its implementation is outside this repository. |
| Event organizer profile | Connected Luma calendar/profile | Update current organizer branding and future-event templates. **Do not rename past events.** |

## Other names and assets to consider

- Legacy Launch Station logo files remain in `public/assets/logos/`; current program copy uses **886 Residency**. Retained asset filenames and historical source documents do not indicate a current public program name.
- Historical photographs, event artwork, and imported article images may contain old branding inside the image itself. Review replacement photography or artwork separately.
- Pitch decks, application PDFs, email signatures, Discord/community branding, and social banners should be audited in their owning systems; their current contents were not verified here.
- Dated design/SEO audit documents retain the terminology used when written. Old route filenames, fragment IDs, article slugs, and compatibility mappings are intentionally retained where they keep existing links working.

## Final review changes

- Made announcement controls inert behind the open mobile menu, matching the existing navigation, main-content, and footer behavior.
- Removed an unused test import so Astro diagnostics finish without hints.
- Updated the README and current design context to use the new program names and consolidated program-page guidance.
- Corrected this handoff's stale portal-branding and validation status; retained the external launch checklist and historical-content boundaries.

## Validation

- Full production validation passes on the pinned **Node 22.23.4** runtime: Astro reports zero errors, warnings, or hints; all **52 source tests** and **27 built-route tests** pass.
- Production build succeeds using the real public Substack feed: **107 generated pages**, **83 indexable pages**, and **83 sitemap URLs**. SEO and security validation pass, including production-only analytics and the ban on inline executable JavaScript.
- The separate perks portal passes **52 tests** on Node 22.23.4. Two optional checks are skipped because the private catalog and live Redis integration configuration are absent; these integrations were not release-tested here.
- A separate normal local build passes security validation with analytics disabled for preview.
- Chromium/Playwright QA passes **44 route/viewport checks** at `http://127.0.0.1:4173`: 16 representative routes at 1440px and 390px, plus Home, Launchpad, and Residency at 320px, 768px, 880px, and 881px. No failed page or asset responses, runtime/console warnings or errors, broken images, blank pages, or horizontal overflow appeared in the final pass. Desktop and phone screenshots were reviewed.
- Interaction checks pass for desktop dropdowns and Escape, mobile menu opening/closing and focus return, announcement isolation/dismissal/session persistence, Launchpad's rebrand FAQ, the application CTA destination, and resource search/empty-state/reset behavior. The Browser plugin was unavailable, so the installed Playwright and Chromium were used without adding project dependencies. This is Chromium coverage; Safari and Firefox were not tested.
- Past event data is byte-for-byte unchanged from the starting branch.
- Browser evidence and temporary QA scripts are stored outside the repository under `/private/tmp/886-rebrand-qa`. No browser dependency was added to the project.

## Deployment handoff

- Confirm the Vercel public-site runtime remains on the required Node 22 security baseline. Deploy through the existing validated workflow when ready.
- After deployment, verify actual HTTP redirects for the legacy program paths and both `withikigai.com` hosts, including query strings. Local preview verifies redirect markup and JavaScript; Vercel applies the HTTP rules and response headers.
- Verify `/perks` and `/timer` proxy behavior on the deployed site; they are separate applications and are not served by Astro preview.
- Coordinate the external profile, publication, application-portal, and email-template updates above with the launch.
