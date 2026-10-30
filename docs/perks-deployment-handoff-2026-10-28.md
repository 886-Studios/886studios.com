# Perks deployment handoff — October 28, 2026

> Superseded for Supabase activation by the [October 30 production record](perks-supabase-production-2026-10-30.md). The production key is now installed and claims are active. The roster has changed since this historical snapshot; production Redis remains authoritative.

## Current state

Repository: `https://github.com/886-Studios/886studios.com`, branch `main`.
App: `apps/perks-portal`. Read its README for implementation, configuration, and import commands.

The public program previews and the updated perks directory are deployed. Verified in the signed-in production browser: 22 partners sorted A–Z, Supabase's correct logo and offer, and the new Details labels. The private catalog URL returns 404. The main site's `/perks` rewrites point to `https://886-studios-perks.vercel.app/perks`.

The staff admin is live at `https://www.886studios.com/perks/admin`. Production Redis contains exactly 11 approved emails across five companies. Staff login, alphabetical company grouping, secure HTTP-only cookies, and private-path rejection were verified against the live public URL. Resend's restricted sending key is configured; an explicitly authorized test email was confirmed in Patryk's inbox in Chrome.

Real credit claims remain disabled: no production Supabase key has been supplied and no production credit has been issued or redeemed. The key repeated by the user on October 28 matches the original staging key and was deliberately not installed as a production key.

The claim UI now reports that claims are not active before collecting an email when setup is incomplete. Staff administration identifies the missing production partner setting and links to Vercel. This fixes the misleading temporary email-error flow; it does not activate redemption without the partner's production key. Regression tests confirm approved and unknown addresses receive the same blocked response, no email is sent, and no company claim is reserved.

## Vercel destinations

| Purpose | Team | Team ID | Project | Project ID |
| --- | --- | --- | --- | --- |
| Main Astro website | `886-studios-projects` | `team_3JvR3YgseKdD13ZZXwwcaaXR` | `886studios-redesign` | `prj_NFcBa28PN4lrsDBaup8Ip55iDCY4` |
| Perks portal | `886-studios-projects` | `team_3JvR3YgseKdD13ZZXwwcaaXR` | `886-studios-perks` | `prj_cvXVdgn63nQUPzoXvWBM70N1RtOf` |

Current production deployment: `dpl_5s2673cGkRAbWih6mjBDTL7Zvkwt`, staged with production settings, tested, then promoted. URL: `https://886-studios-perks-b6vng2d33-886-studios-projects.vercel.app`. This release includes staff team creation, the always-visible member form, and the inactive-claims state for missing partner setup. The prior infrastructure release was `dpl_HXcdHKWKaZMvuUrz6ATt242EgyLZ`; its post-promotion error-log query returned zero records over 15 minutes.

Settings: `https://vercel.com/886-studios-projects/886-studios-perks/settings/environment-variables`.

The user transferred the existing project from Carter's team into 886 Studios. The CLI authenticated as `886-studios` / `it@886studios.com` now works. The connector still lacks the new team's scope; use the authenticated CLI with explicit team/project identifiers, or authorize the connector for the new team. Do not recreate or transfer the project again.

The transfer also connected the Git repository with the wrong root directory, which deployed the main website into the perks project. The portal was restored and the project's root directory corrected to `apps/perks-portal`. This app's `vercel.json` disables automatic Git deployments because its private catalog is absent from Git. Deploy the verified local Build Output with `vercel deploy --prebuilt --prod --skip-domain`, test, then promote. The main Astro project's Git deployments remain enabled. For configuration reference, see [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration).

## Production configuration completed

- Upstash integration resource `store_bd910Shrg0jJRnX7`, name `886-perks-claims`, connected to this project's production environment. Free plan, `iad1`, eviction disabled, automatic paid upgrades disabled. Marketplace terms were accepted in Chrome during setup.
- Vercel's integration creates `KV_REST_API_URL` and `KV_REST_API_TOKEN`; the app's `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` were configured from those values. Update both app aliases if the integration rotates its credentials.
- `RESEND_API_KEY`, `PERKS_EMAIL_FROM`, separate random `PERKS_ADMIN_ACCESS_CODE`, `PERKS_ADMIN_SESSION_SECRET`, and `SUPABASE_CLAIM_SECRET` are configured. Secrets are stored as sensitive production variables. The sender is `perks@886studios.com`.
- `SUPABASE_PARTNER_ENVIRONMENT=production`, `APP_ORIGIN=https://www.886studios.com`, and `APP_BASE_PATH=/perks`. Existing founder access credentials were preserved. `SUPABASE_PARTNER_API_KEY` is intentionally absent.
- The new production Redis namespace was empty before importing the final roster. Import validation and application both reported five teams and 11 emails. No email was sent by the import; all company claim locks remain unreserved.

## Private files needed on the other computer

These files are deliberately excluded from Git. Obtain them by secure transfer from the original computer; do not paste credentials into chat, commit them, or upload them as public artifacts. Original checkout: `/Users/patryk/Documents/886studios-redesign`.

Paths relative to `apps/perks-portal/`:

- `private/catalog.json`: authoritative recovered 22-partner catalog, required for any new source build. Preserve all existing partner links and terms.
- `private/founder-roster.json`: the user's final replacement roster, five teams and 11 emails, with stable canonical team IDs. This is the production import source.
- `private/approved-emails.json`: local approval/revocation history for reference. Production Redis is now authoritative; do not overwrite it with this file.
- `.env.local`: the restricted Resend sending key and sender address. The existing key is named **886 Studios Perks**, limited to verified `886studios.com`; sender is `perks@886studios.com`. It is now configured remotely.
- `.env.production.local`: owner-only local configuration for production staff credentials, claim secret, and Redis operations. Never deploy it as a source file.
- `private/production-staff-access.json`: owner-only staff URL and access code for the user. It contains no provider API key.
- Optional `.env.supabase-staging`: diagnostic staging credentials only. Never use this as the production environment file.

Keep copied private files owner-readable only. Do not copy local dev access codes, test inboxes, issued test codes, or preview flags into production. If private files are absent, request secure transfer rather than rebuilding an incomplete catalog or approving contacts from an older Notion roster. If the Resend key cannot be recovered, a replacement restricted sending key will be needed through the user's Resend account.

The approved companies, alphabetically, are Amicare Inc. (3 emails), Dexter Forge Inc. (3), HeyEva (2), InstaPodz (2), and Peeps (1). All listed founders may request a link, but the first founder to continue reserves the company's sole benefit. All earlier Notion-derived approvals were revoked. Preserve canonical IDs and claim reservations; do not recreate teams to reset eligibility. Staff lists show only companies with active member emails.

Staff can now expand **Create team** to add a new company and its first founder email. The server assigns a permanent ID; creation and first-member approval are atomic. Duplicate normalized company names and historically assigned emails cannot create a second entitlement. **Add member email** is always visible for adding cofounders to an existing team. Existing teams with no active members remain selectable, while the member list continues to show only teams with approved emails. Future imports must reuse IDs generated by the staff interface.

## Remaining work

1. Obtain the Supabase partner **production** API key through the user's secure channel and save it as sensitive `SUPABASE_PARTNER_API_KEY` in this project's production environment. Staging uses `api.supabase.green`, can generate codes, and cannot redeem them. Production uses `api.supabase.com`. Do not label the existing staging key as production.
2. Rebuild/redeploy the perks project after adding that environment variable. Include only `private/catalog.json` as server-side function data; never package the roster, local approvals, or environment files. Existing founder credentials are non-retrievable sensitive variables: preserve them rather than rotating them just to run local preflight. Validate all available configuration locally and verify actual login behavior on the staged production deployment.
3. With an explicitly approved test recipient/company, verify the complete email-link → company reservation → production issuance → Supabase redemption flow. The delivered October 28 email was a delivery-only test; it did not issue or reserve credits. Do not test on a real portfolio company's entitlement without approval. Preserve canonical IDs and claim locks.

## Verification already completed

Previous implementation checks passed 51 portal tests, including a real Redis concurrency test with one winner. The latest claim-readiness release passed all 54 portal tests, including the real Redis test using the existing temporary Redis executable. New coverage checks staff authentication/origin, validation without empty-team writes, duplicate submissions, revoked-email bindings, simultaneous creation with one winner, and shared company claims. The production Upstash API was exercised by roster validation, import, and authenticated staff reads. The build succeeded with 22 entries; staged and live staff authentication, all roster entries, alphabetical company order, and blocked private URLs passed. Real email delivery was verified in the recipient's Chrome inbox. Production credit issuance/redemption remains untested and disabled.

The user has authorized production deployment, saving the existing restricted Resend key to this transferred perks project, importing the final approved roster, and the single delivery test to Patryk. Do not repeat completed design work or ask again for these same authorizations. Unavailable credentials or new chargeable provisioning may still require user involvement.
