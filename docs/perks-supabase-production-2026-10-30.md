# Supabase perk production activation — October 30, 2026

Supabase claims are enabled at `https://www.886studios.com/perks`.

## Follow-up: claim page stalled after code issuance

The initial release below is superseded by deployment `dpl_AZJZhBhSSVk9tnqGAvXnoR6axSkv`,
`https://886-studios-perks-b2qtkkgas-886-studios-projects.vercel.app`.
Source: `907d21f` plus the claim-result rendering and regression-test changes in this checkout;
the deployment preceded Git delivery.

A founder reported getting stuck on “Preparing your code…”. Production request logs showed
successful HTTP 303 responses at the time the company claim was reserved. A local Chromium
reproduction with synthetic credits confirmed that `form-action 'self'` blocked the cross-origin
redirect after the form POST, leaving the original page and disabled button visible. Server-only
redirect assertions had missed this browser behavior.

Production POST success now returns HTTP 200 with the credit code, a Copy button, and an ordinary
**Redeem in Supabase** link to the fixed dashboard URL. CSP remains restrictive; the result stays
uncached and excluded from indexing. Opening an email link still cannot issue credits until the
founder submits the form. Existing recipients can reopen their original email link and continue;
claim reservations and permanent company identifiers must not be reset.

Verification: 53 portal tests passed, one optional Redis integration test skipped; 11 public-site
perks/privacy tests passed. Node 22.23.4 build included 22 partners. Chromium desktop (1280×850)
and mobile (390×844) checks displayed the synthetic code, and the redemption link navigated
without CSP errors. Both staged and live smoke checks passed staff login, claim readiness,
unapproved-claim rejection, and private-file blocking. All six teams, 12 approved emails, and the
one existing claim reservation were preserved. The new deployment's 15-minute error/fatal log
query returned zero records. No real credits were issued or redeemed, and no emails were sent
during the automated verification. After deployment, the user confirmed that they checked the
repaired founder flow and it worked (October 30, 2026).

## Configuration and release

- Team: `886-studios-projects` (`team_3JvR3YgseKdD13ZZXwwcaaXR`).
- Project: `886-studios-perks` (`prj_cvXVdgn63nQUPzoXvWBM70N1RtOf`).
- Deployment: `dpl_J2mN91kasGvCiTXTysjRH9WvPsBp`.
- Deployment URL: `https://886-studios-perks-7o0scrgdh-886-studios-projects.vercel.app`.
- Source: checkout at `113130f`, plus the Supabase redirect and regression-test changes described below. The production deployment preceded Git delivery.
- `SUPABASE_PARTNER_API_KEY` is installed as a production-only Secret. `SUPABASE_PARTNER_ENVIRONMENT` remains `production`. No other production credential was changed.
- The supplied key differs from the saved staging key. Its owner-only local copy is in the ignored `.env.production.local`.
- Built under Node 22.23.4, staged with `--prebuilt --prod --skip-domain`, verified, then promoted.

## Review finding and fix

The existing production redirect used `https://supabase.com/redeem`, which returned HTTP 404. The production API supplies a link under `https://supabase.com/dashboard/redeem`, which returned HTTP 200.

The client now constructs that canonical dashboard URL from the validated code. It still ignores the upstream `link` field, preserving the fixed Supabase origin. Regression coverage verifies that even an arbitrary upstream link cannot change the redirect destination. Staging codes remain non-redeemable and do not redirect.

## Verification

- Portal: 53 tests passed, none failed; one optional real Redis integration test skipped because its local executable was unavailable. The production Redis reads below succeeded.
- Public-site perks/privacy regression tests: 11 passed.
- Build: 22 catalog entries. Artifact inspection found no partner key or environment files; `private/catalog.json` is the only packaged private file and is inside the server function.
- Staged deployment: staff login, claim readiness, no-store/no-index headers, rejected signed invitation for an unapproved synthetic address, and private file 404s passed.
- Live public URL after promotion: the same smoke checks passed. The deployment's error-log query returned zero records in the 15-minute window ending at verification.
- Production roster at verification: six teams, 12 approved emails, zero reserved claims. Verification preserved the exact roster and reservations. Do not overwrite it from the older five-team handoff.
- Detailed smoke results are stored in ignored owner-only `private/supabase-production-staged-verification.json` and `private/supabase-production-live-verification.json`.

## Production API probe and verification limits

The supplied key returned HTTP 201 from the production credits endpoint; an invalid control key returned HTTP 401. Unexpectedly, the empty JSON authentication probe issued a code even without `user_identifier`. The code and response metadata are saved only in ignored owner-only `private/supabase-production-api-probe.json`. It was not redeemed and did not reserve any portal company's entitlement.

Do not repeat an empty-body probe as a supposedly non-mutating health check: this endpoint can issue codes without an identifier. The application itself validates a nonempty stable company identifier before every issuance.

No new claim emails were sent during activation, and no credits were applied to a Supabase organization. Prior email-delivery verification is documented in the October 28 handoff. A complete real-recipient email-to-organization redemption remains unverified; use an explicitly approved test recipient/company for that final check and preserve its canonical company identifier.
