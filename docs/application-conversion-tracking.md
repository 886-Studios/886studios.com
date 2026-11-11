# Application conversion tracking handoff

The public marketing site and the application portal have separate source code.
The Apply link currently sends `application_started`; it measures an outbound
Apply click, not a completed application or a confirmed form start.

## Portal implementation (owner of apply.886studios.com)

1. Install the existing GA4 web stream once: **G-F0SQCTQJME**.
   Do not create another property or duplicate an existing installation.
2. Use the same Google tag and cookie domain `auto` across the public site and
   portal. GA4 cross-domain configuration now matches the apex, www, and apply
   hosts only. Preserve incoming `_gl`, `gclid`, `gbraid`, `wbraid`, and campaign
   parameters through redirects and authentication. Never include login tokens,
   email addresses, form answers, or invitation URLs in analytics page locations.
3. After the server confirms the first transition of an application into the
   submitted state, emit **application_submitted** to this stream. Do not fire on
   button clicks, validation errors, request start, or a generic success-page visit.
   Use an idempotent success state so refreshes, retries, account sign-ins and
   application edits cannot count it again. Send no application answers or PII.
   Choose exactly one sender: browser GA4 OR server Measurement Protocol.
4. If using the browser, call the existing consent-aware tag only after confirmed
   success. Example event (the surrounding persistence/idempotency belongs in the
   actual portal submission handler):

   ```js
   window.gtag?.("event", "application_submitted", {
     send_to: "G-F0SQCTQJME",
     program: "886_launchpad",
   });
   ```

5. Respect existing analytics consent. No enhanced conversions or user-provided
   data are required for this setup.

## Analytics and Ads destination

- GA4 property **558478540**, stream **16109429412**.
- Google Ads account **571-632-8707** is already linked to GA4. Auto-tagging was
  verified enabled; the existing GA4 stream is receiving traffic.
- Configured 2026-11-10: `application_submitted` is a GA4 key event, imported once
  into Ads as **886 Studios (web) application_submitted**, Sign-up category,
  **Primary**, **Count One**, account-default goal. It awaits conversions until
  the portal owner implements the confirmed-success event.
- `application_started` is imported as **886 Studios (web) application_started**,
  Outbound click category, **Secondary**, **Count One** (observation only). Do not import
  `form_submit`, Apply clicks, and `application_submitted` as competing primary
  conversions for the same outcome.
- No monetary lead value is assumed. Keep the existing USD 3/day ad budget.
- Before switching to conversion-based bidding, verify that real completed
  applications arrive and that there is enough conversion volume.

## Remaining work

The portal is managed outside this repository. Its confirmed-success event is
proposed in Flash #15 below and still needs maintainer integration and release.
End-to-end application attribution is not yet verified.

The public-site change includes the measurement CSP fix and post-deployment
IndexNow workflow. The browser check reproduced blocked GA4/Ads requests with
the old policy and observed no CSP violations with the corrected policy. Google
collectors were intercepted during this comparison; this proves browser
transport permission, not GA4 receipt or completed-application attribution.

IndexNow compares fingerprints of live public HTML against the last accepted
production snapshot. Only successful Vercel production deployments qualify;
preview/failed deployments cannot submit or displace a pending production job.
Fetch/submission failures and dry runs preserve accepted state. The live
comparison on 2026-11-11 found 83 public pages and zero changes against the
2026-11-10 baseline, so it sent no notifications. Release/deployment and first
workflow-run evidence belongs in the public-site release PR.

### Access and implementation follow-up (2026-11-11)

The marketing-site owner does not personally need portal access. A maintainer
needs access to the applicant frontend **and its submission backend**, plus
permission to deploy both. Access to GA4 or GTM alone cannot establish that an
application was successfully persisted.

The local authenticated GitHub login can read
[`886-Studios/Flash`](https://github.com/886-Studios/Flash). Its `apps/accounts`
app contains the applicant flow; its layout, title, font configuration, and
security headers match the public `apply.886studios.com` response inspected on
2026-11-11. GitHub also records a production deployment named `accounts`.
However, that repository's documentation names `accounts.886studios.com`, so
the maintainer must confirm the current domain-to-project mapping before release.
The similarly named `ikigai-startup-portal` repository is an internal progress
reporting app, not the public application form.

Integration points observed in Flash:

- `supabase/functions/submit-application/index.ts` validates the application,
  writes `is_submitted` and `submitted_at`, then returns the saved application.
  It currently permits resubmission and preserves an existing timestamp. Add a
  database-conditional first-submission result here; reading a draft and later
  updating it unconditionally would let two concurrent requests both claim to
  be the first submission. Return an explicit first-submission flag only to the
  request that wins that transition. Retries and edits must return false.
- `apps/accounts/src/lib/edgeFunctions.ts` types and unwraps that response.
- `apps/accounts/src/app/a/[id]/page.tsx`, in `handleSubmit`, awaits
  `submitApplication` before navigating to `/dashboard`. This is the browser
  integration point: emit only for the server's first-submission flag and only
  when analytics consent permits it. Do not emit from the dashboard or sign-in.
- `apps/accounts/src/app/layout.tsx` contains no Google tag installation.
  A repository search found no `gtag`, GTM, `application_submitted`, or consent
  integration in the applicant source. This does **not** rule out a sender
  configured outside Git. Confirm external/native/server senders and the
  consent implementation with the maintainer before installing a sender.

No Flash files, live portal settings, or submission records were changed during
this follow-up. The connected Vercel tool could not read the known 886 team
scope (403), so deployment access was not established. Portal implementation,
release, consent behavior, destination receipt, and Ads attribution remain open.

## Proposed portal change (2026-11-11)

Draft PR: [Flash #15 — Track first confirmed application submissions](https://github.com/886-Studios/Flash/pull/15),
commit `83ef506`, branch `codex/application-conversion-tracking` into `main`.
The PR adds the database-conditional first-submission flag and browser event
sender, with tests for resubmissions, competing requests, consent, URL redaction
and failures. Sending defaults to off. The portal maintainer still needs to
connect the real consent-aware Google tag and consent adapter, confirm domain
ownership and any external sender, then deploy and enable the integration.
See `apps/accounts/TRACKING.md` in the PR for activation and rollout details.

Local verification: 1,848 tests pass on Node 24, coverage thresholds pass,
test type checking passes, the applicant webpack production build passes, and
the production dependency audit reports no vulnerabilities. No live portal or
Supabase changes were deployed, no live conversion was sent, and GA4 receipt
and Ads attribution remain unverified.

## Acceptance checks

Use a test environment or an explicitly approved disposable test application.
Check failure/validation, successful submission, refresh, retry, and return visit.
Only one completion should appear for a newly submitted application.
Use Tag Assistant to verify the public-to-portal journey and GA4 DebugView/realtime
to confirm destination receipt. A tag firing alone is not proof of Ads attribution.
A real ad-originated application is needed to verify Ads attribution after the
normal reporting delay. No real test application was submitted during setup.

Verification note: Google Ads detected GTM-NC2CNQ3T on the public site and GA4
shows recent application_started events. Tag Assistant did not establish its
debug connection during this session, so a browser debug trace and completed
application attribution remain pending with the portal owner.
