# 886 rebranding follow-up

Branch: `rebrand/886-launchpad`. This work is committed locally and is not merged or deployed.

## Completed in the website

- Current program copy, navigation, team biographies, founder guides, cohort labels, accessibility labels, analytics labels, and structured data use **886 Launchpad**.
- `/accelerator` is the canonical program route. `/ikigai-launchpad`, `/programs`, and their trailing-slash variants redirect there; the legacy `withikigai.com` redirect also targets it. Sitemap, content dates, preload configuration, and `llms.txt` use the new route.
- Removed standalone ikigai program logos, the unused application announcement graphic, and old newsletter artwork. The program heading uses live text.
- Website newsletter copy, subscription cards, metadata, and attribution use **886 Insights**. Subscription and RSS endpoints remain at `886studios.substack.com`.
- Past event records and names are unchanged. Original third-party article titles and historical imported articles are preserved. Existing photos and their filenames are retained; this change does not retouch historical signage or clothing in photography.

## Remaining external changes

These are follow-up items, not changes made by this branch. No Substack management connector or working browser session was available to update publication settings.

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

- **Launch Station** still appears in the perks portal's eligibility footer (`apps/perks-portal/src/render.mjs`). The public program is already called **886 Residency**. Launch Station logo files also remain in `public/assets/logos/`; decide whether that separate rebrand should cover these.
- Historical photographs, event artwork, and imported article images may contain old branding inside the image itself. Review replacement photography or artwork separately.
- Pitch decks, application PDFs, email signatures, Discord/community branding, and social banners should be audited in their owning systems; their current contents were not verified here.
- Dated design/SEO audit documents retain the terminology used when written. Old route filenames, fragment IDs, article slugs, and compatibility mappings are intentionally retained where they keep existing links working.

## Validation

- Astro/type checks and the website unit tests pass.
- Production build succeeds using the real public Substack feed; built-page tests, SEO validation, and security validation pass.
- Past event data is byte-for-byte unchanged from the starting branch.
- The perks portal suite has an environment failure: this machine runs Node 26.13.0, while its release preflight requires Node >=22.23.4 <23. Its other executed tests pass; two optional tests are skipped.
- Visual desktop/mobile QA remains unverified: the browser access host is unavailable and Playwright is not installed in the project.
