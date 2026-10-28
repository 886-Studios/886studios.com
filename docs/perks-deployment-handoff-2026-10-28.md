# Perks deployment handoff — October 28, 2026

## Current state

Repository: `https://github.com/886-Studios/886studios.com`, branch `main`.
App: `apps/perks-portal`. Read its README for implementation, configuration, and import commands.

The public program previews and the updated perks directory are deployed. Verified in the signed-in production browser: 22 partners sorted A–Z, Supabase's correct logo and offer, and the new Details labels. The private catalog URL returns 404. The main site's `/perks` rewrites point to `https://886-studios-perks.vercel.app/perks`.

The staff admin currently returns 503 because production access services are not configured. Automated email claims are not activated. The 11 approved founder emails remain local; they were not imported into production. No production Supabase key has been supplied and no production credit has been issued or redeemed.

## Vercel destinations

| Purpose | Team | Team ID | Project | Project ID |
| --- | --- | --- | --- | --- |
| Main Astro website | `886-studios-projects` | `team_3JvR3YgseKdD13ZZXwwcaaXR` | `886studios-redesign` | `prj_NFcBa28PN4lrsDBaup8Ip55iDCY4` |
| Perks portal | `cartergw01s-projects` | `team_2ftHRH1pDvUxdnjvHXk7rkWA` | `886-studios-perks` | `prj_cvXVdgn63nQUPzoXvWBM70N1RtOf` |

Perks production deployment: `dpl_BB9LsaQwGrcHXiPLXXM21o3o6qUS`, built from main commit `f6b4cfd79a1050a43f2ecef57869280436cebb41` plus the ignored private catalog. Vercel reported READY with both project aliases assigned. Deployment URL: `https://886-studios-perks-jnrhnkuc1-cartergw01s-projects.vercel.app`.

Settings: `https://vercel.com/cartergw01s-projects/886-studios-perks/settings/environment-variables`.

The Vercel connector could upload and deploy code to Carter's project, but both reading and creating production environment variables returned 403. The CLI was authenticated as `886-studios` / `it@886studios.com` and also returned 403 for this project. Chrome showed a project 404 under that account. The user plans to sign in on another computer with an account that has access. Browser sign-in does not automatically renew CLI or connector credentials; authenticate the chosen interface to the correct account and explicitly scope the project.

## Private files needed on the other computer

These files are deliberately excluded from Git. Obtain them by secure transfer from the original computer; do not paste credentials into chat, commit them, or upload them as public artifacts. Original checkout: `/Users/patryk/Documents/886studios-redesign`.

Paths relative to `apps/perks-portal/`:

- `private/catalog.json`: authoritative recovered 22-partner catalog, required for any new source build. Preserve all existing partner links and terms.
- `private/founder-roster.json`: the user's final replacement roster, five teams and 11 emails, with stable canonical team IDs. This is the production import source.
- `private/approved-emails.json`: local approval/revocation history for reference. Do not overwrite an existing production store with this file.
- `.env.local`: the restricted Resend sending key and sender address. The existing key is named **886 Studios Perks**, limited to verified `886studios.com`; sender is `perks@886studios.com`. Its attempted production save failed, so do not assume it exists remotely.
- Optional `.env.supabase-staging`: diagnostic staging credentials only. Never use this as the production environment file.

Keep copied private files owner-readable only. Do not copy local dev access codes, test inboxes, issued test codes, or preview flags into production. If private files are absent, request secure transfer rather than rebuilding an incomplete catalog or approving contacts from an older Notion roster. If the Resend key cannot be recovered, a replacement restricted sending key will be needed through the user's Resend account.

The approved companies, alphabetically, are Amicare Inc. (3 emails), Dexter Forge Inc. (3), HeyEva (2), InstaPodz (2), and Peeps (1). All listed founders may request a link, but the first founder to continue reserves the company's sole benefit. All earlier Notion-derived approvals were revoked. Preserve canonical IDs and claim reservations; do not recreate teams to reset eligibility. Staff lists show only companies with active member emails.

## Remaining work

1. Confirm access to the correct perks project's production settings. Preserve the existing founder access code and session secret so current access continues to work. Inspect existing configuration without printing values.
2. Configure durable Upstash Redis storage, separate strong staff credentials, and a separate production claim secret. Use the existing authorized infrastructure if available; do not invent credentials. Required names and validation rules are in the app README. Set `APP_ORIGIN=https://www.886studios.com`, `APP_BASE_PATH=/perks`, and explicitly choose the production namespace when configuring production storage.
3. Save the restricted `RESEND_API_KEY` and `PERKS_EMAIL_FROM=perks@886studios.com` in this project's production environment. The user explicitly authorized saving this key in Carter's production perks project and publishing the private catalog there. Platform permissions were the final blocker, not missing user approval.
4. Obtain the Supabase partner **production** API key through the user's secure channel. Only a staging key was provided. Staging uses `api.supabase.green`, can generate codes, and cannot redeem them. Production uses `api.supabase.com`. Do not claim end-to-end redemption is verified until a real approved production test succeeds. Keep issuance unavailable if the production key is absent.
5. Review existing production approvals before importing. From the app directory with the correct production environment securely loaded, run `npm run founders:import -- private/founder-roster.json --redis --check`, then `--apply`. Expect five teams and 11 emails from this roster. The importer does not revoke unrelated existing remote approvals: reconcile any unexpected active entries against the explicitly authorized replacement roster, preserving team identities and claim locks. Never reapprove the revoked Notion list.
6. Run the relevant tests and release preflight. Rebuild/redeploy the **perks project** after environment changes, including `private/catalog.json` only as server-side function data. Do not assume pushing the main website updates this separate project. Do not upload the roster, local approvals, or environment files as source files.
7. Verify the founder directory and separate staff login, five-company alphabetical staff list, approved/unknown-email privacy, revocation, and one claim per company. Perform email delivery and credit tests only with an explicitly approved test recipient/company; do not send test mail to the real founder roster. Confirm direct private paths remain inaccessible. Record actual results and remaining blockers, then commit/push any necessary code or documentation changes.

## Verification already completed

Previous implementation checks passed 51 portal tests, including a real Redis concurrency test with one winner. The isolated release build and Vercel build succeeded with 22 entries. The existing staging tests confirmed API issuance and the local staff approval → test inbox → claim flow. They did not test real Resend delivery or production redemption. No product code changed during the October 28 deployment.

The user has authorized production deployment, saving the existing restricted Resend key to the exact perks project above, and importing the final approved roster. Do not repeat completed design work or ask again for these same authorizations. New platform-imposed permissions, unavailable credentials, or chargeable provisioning may still require user involvement.
