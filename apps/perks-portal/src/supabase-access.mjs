import { join } from 'node:path';
import { createAuth } from './auth.mjs';
import { validateCredentials } from './config.mjs';
import { createLocalEmailStore, createRedisEmailStore, emailKey, normalizeEmail, ApprovalConflict } from './approved-emails.mjs';
import { createLocalMailer, createResendMailer } from './claim-email.mjs';
import { createClaim } from './supabase-claims.mjs';
import { creditsConfig } from './supabase-credits.mjs';
import { renderClaimRequest, renderLogin, renderPerksAdmin } from './render.mjs';

export function createAccessServices({ root, env, secure, origin, basePath, now = Date.now }) {
  let store, mailer, adminAuth;
  // Missing integration settings disable only these features, never expose a local fallback in production.
  try { store = secure ? createRedisEmailStore(env) : createLocalEmailStore(join(root, 'private/approved-emails.json'), { now }); } catch { /* Fail closed below. */ }
  try { mailer = secure ? createResendMailer(env) : createLocalMailer(join(root, 'private/claim-outbox.json')); } catch { /* Fail closed below. */ }
  try {
    const credentials = { code: env.PERKS_ADMIN_ACCESS_CODE, secret: env.PERKS_ADMIN_SESSION_SECRET };
    validateCredentials(credentials);
    if (credentials.code === env.PERKS_ACCESS_CODE || credentials.secret === env.PERKS_SESSION_SECRET) throw new Error('Staff credentials must be separate.');
    adminAuth = createAuth({ ...credentials, secure, basePath: `${basePath}/admin`, name: '886_perks_admin', sessionSeconds: 8 * 60 * 60, now });
  } catch { /* Staff login stays disabled. */ }
  return createAccessRouter({ store, mailer, adminAuth, env, origin, basePath, now });
}

export function createAccessRouter({ store, mailer, adminAuth, env, origin, basePath = '', now = Date.now }) {
  const adminPage = options => renderPerksAdmin({ basePath, ready: Boolean(adminAuth && store), ...options });
  const requestPage = options => renderClaimRequest({ basePath, ...options });
  const confirmation = 'If this email is approved, a claim link will arrive shortly. Check your inbox and spam folder.';
  return {
    async allows(claim) {
      if (!store || !claim.approvalVersion || !claim.email) return false;
      const approval = await store.get(claim.email);
      return Boolean(approval && approval.version === claim.approvalVersion && approval.userIdentifier === claim.userIdentifier);
    },
    async reserveClaim(claim) {
      if (!store || !claim.email || !claim.approvalVersion) return 'invalid';
      return store.reserveClaim(claim);
    },
    async handle({ req, path, form, ip, portalAuthorized, send, redirect, res }) {
      if (path !== '/supabase/request' && path !== '/admin' && !path.startsWith('/admin/')) return false;
      const get = req.method === 'GET' || req.method === 'HEAD';
      if (path === '/supabase/request') {
        if (!portalAuthorized) { send(get ? 200 : 401, renderLogin({ basePath })); return true; }
        if (get) { send(200, requestPage()); return true; }
        if (!store || !mailer) { send(503, requestPage({ error: 'Email claims are being set up. Please contact the 886 team.' })); return true; }
        let email;
        try { email = normalizeEmail(form.get('email')); } catch { send(400, requestPage({ error: 'Enter a valid email address.' })); return true; }
        try {
          if (!await store.consume(`email-request-ip:${ip}`, 8, 900)) {
            res.setHeader('Retry-After', '900');
            send(429, requestPage({ error: 'Too many requests. Please try again in 15 minutes.' })); return true;
          }
          const { environment } = creditsConfig(env);
          // Validate configuration before lookup so an unconfigured sender is not an approval oracle.
          createClaim({ userIdentifier: email, secret: env.SUPABASE_CLAIM_SECRET, environment, now: now() });
          const allowed = await store.consume(`email-request:${emailKey(email)}`, 3, 900);
          const approval = await store.get(email);
          if (allowed && approval) {
            const token = createClaim({ userIdentifier: approval.userIdentifier, email: approval.email, approvalVersion: approval.version, secret: env.SUPABASE_CLAIM_SECRET, environment, now: now() });
            try { await mailer.send({ email: approval.email, claimUrl: `${origin}${basePath}/supabase#${token}` }); }
            catch { console.error('Perks claim email delivery failed.'); }
          }
          // Never disclose approval membership or a claim token to the person entering an email.
          send(200, requestPage({ message: confirmation }));
        } catch { send(503, requestPage({ error: 'Email claims are temporarily unavailable. Please try again later.' })); }
        return true;
      }
      if (!['/admin', '/admin/login', '/admin/logout', '/admin/approve', '/admin/revoke'].includes(path)) { send(404, 'Not found.', 'text/plain'); return true; }
      if (get && !['/admin', '/admin/login'].includes(path)) { send(405, 'Submit this action from the admin page.', 'text/plain'); return true; }
      if (!adminAuth || !store) { send(503, adminPage()); return true; }
      if (!get && path === '/admin/login') {
        try {
          if (!await store.consume(`admin-login:${ip}`, 8, 900)) { res.setHeader('Retry-After', '900'); send(429, adminPage({ error: 'Too many attempts. Please try again in 15 minutes.' })); return true; }
          const code = form.get('code');
          if (!code || code.length > 256 || !adminAuth.verifyCode(code)) { send(401, adminPage({ error: 'That staff code is not valid.' })); return true; }
          res.setHeader('Set-Cookie', adminAuth.issue()); redirect(`${basePath}/admin`); return true;
        } catch { send(503, adminPage({ error: 'Staff access is temporarily unavailable.' })); return true; }
      }
      if (!adminAuth.valid(req.headers.cookie)) { send(get ? 200 : 401, adminPage()); return true; }
      if (!get && path === '/admin/logout') { res.setHeader('Set-Cookie', adminAuth.clear()); redirect(`${basePath}/admin`); return true; }
      try {
        let notice = '';
        if (!get) {
          if (!['/admin/approve', '/admin/revoke'].includes(path)) { send(405, 'Method not allowed.', 'text/plain'); return true; }
          let email;
          try { email = normalizeEmail(form.get('email')); } catch { send(400, adminPage({ authenticated: true, approvals: await store.list(), teams: await store.teams(), error: 'Enter a valid email address.' })); return true; }
          if (path === '/admin/approve') { await store.approve(email, form.get('team')); notice = `${email} is approved. They can now request their link from the perks page.`; }
          else { await store.revoke(email); notice = `${email} no longer has access. Outstanding email claim links are invalid.`; }
        }
        send(200, adminPage({ authenticated: true, approvals: await store.list(), teams: await store.teams(), local: mailer?.local === true,
          messages: mailer?.local ? mailer.list() : [], notice }));
      } catch (error) {
        if (error instanceof ApprovalConflict) send(409, adminPage({ authenticated: true, approvals: await store.list(), teams: await store.teams(), error: error.message }));
        else send(503, adminPage({ authenticated: true, error: 'Approved emails are temporarily unavailable. Please try again.' }));
      }
      return true;
    },
  };
}
