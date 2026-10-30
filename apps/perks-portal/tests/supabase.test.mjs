import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { creditsConfig, issueSupabaseCredit } from '../src/supabase-credits.mjs';
import { createClaim, readClaim } from '../src/supabase-claims.mjs';
import { createHandler } from '../src/server.mjs';
import { createRateLimiter } from '../src/rate-limit.mjs';

const secret = 'synthetic-claim-secret-with-at-least-43-characters';
const env = { SUPABASE_PARTNER_API_KEY: 'sb_partner_test_only', SUPABASE_CLAIM_SECRET: secret };
const approvedId = 'approved-company-001';
const config = { root: fileURLToPath(new URL('..', import.meta.url)), code: 'fixture-code',
  secret: 'fixture-session-secret-with-32-characters', origin: 'https://www.886studios.com', basePath: '/perks',
  catalog: { perks: [] }, creditsEnv: env,
  accessServices: { allows: async () => true, reserveClaim: async () => 'allowed', handle: async () => false } };
const response = (status, body = {}) => ({ status, json: async () => body });

test('partner client sends the exact documented request and never redeems staging codes', async () => {
  let calls = 0;
  const result = await issueSupabaseCredit({ env, userIdentifier: approvedId, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.supabase.green/partners/credits/get-code');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['x-partner-api-key'], env.SUPABASE_PARTNER_API_KEY);
    assert.deepEqual(JSON.parse(options.body), { user_identifier: approvedId });
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    return response(201, { code: 'TEST-CODE-1234' });
  } });
  assert.equal(calls, 1);
  assert.equal(result.redemptionUrl, null);
  assert.equal(result.environment, 'staging');
});

test('production must be explicit and redemption URLs have a fixed Supabase origin', async () => {
  const result = await issueSupabaseCredit({ env: { ...env, SUPABASE_PARTNER_ENVIRONMENT: 'production' }, userIdentifier: approvedId,
    fetchImpl: async url => { assert.equal(url, 'https://api.supabase.com/partners/credits/get-code'); return response(201, { code: 'ABCD-EFGH-1234-5678', link: 'https://evil.example/redeem' }); } });
  assert.equal(result.redemptionUrl, 'https://supabase.com/dashboard/redeem?code=ABCD-EFGH-1234-5678');
  for (const environment of ['__proto__', 'https://evil.example', 'prod']) assert.throws(() => creditsConfig({ ...env, SUPABASE_PARTNER_ENVIRONMENT: environment }));
  assert.throws(() => creditsConfig({}));
});

test('upstream failures and malformed results never leak response bodies or retry issuance', async () => {
  for (const [status, kind] of [[400, 'already-redeemed'], [401, 'configuration'], [403, 'configuration'], [429, 'rate-limit'], [302, 'unavailable'], [500, 'unavailable'], [200, 'unavailable']]) {
    let calls = 0;
    await assert.rejects(issueSupabaseCredit({ env, userIdentifier: approvedId, fetchImpl: async () => { calls++; return response(status, { message: 'private upstream body' }); } }), error => error.kind === kind && !error.message.includes('private upstream'));
    assert.equal(calls, 1);
  }
  for (const body of [{}, { code: '' }, { code: 'https://evil.example' }, { code: '<script>' }]) {
    await assert.rejects(issueSupabaseCredit({ env, userIdentifier: approvedId, fetchImpl: async () => response(201, body) }), { kind: 'response' });
  }
  await assert.rejects(issueSupabaseCredit({ env, userIdentifier: approvedId, fetchImpl: async () => { throw new Error('private network detail'); } }), { kind: 'unavailable' });
  for (const userIdentifier of ['', ' person@example.com', 'bad\nvalue']) {
    await assert.rejects(issueSupabaseCredit({ env, userIdentifier, fetchImpl: () => assert.fail('must not call upstream') }), { kind: 'identifier' });
  }
});

test('staff invitations conceal identifiers, expire, and bind their recipient and environment', () => {
  const now = Date.now();
  const token = createClaim({ userIdentifier: approvedId, environment: 'staging', secret, now });
  assert.ok(!Buffer.from(token, 'base64url').toString().includes(approvedId));
  assert.equal(readClaim(token, { secret, environment: 'staging', now }).userIdentifier, approvedId);
  assert.equal(readClaim(token, { secret, environment: 'production', now }), null);
  assert.equal(readClaim(token, { secret: secret + 'rotated', environment: 'staging', now }), null);
  assert.equal(readClaim(token, { secret, environment: 'staging', now: now + 7 * 86400_000 }), null);
  assert.equal(readClaim(token, { secret, environment: 'staging', now: now - 1 }), null);
  assert.equal(readClaim(token.slice(0, -3) + 'ABC', { secret, environment: 'staging', now }), null);
  assert.equal(readClaim('a'.repeat(1201), { secret, environment: 'staging', now }), null);
});

async function request(handler, { method = 'POST', path = '/perks/supabase', token = '', headers = {}, body } = {}) {
  const req = Readable.from([Buffer.from(body ?? new URLSearchParams({ claim: token }).toString())]);
  Object.assign(req, { url: path, method, headers: { origin: config.origin, 'content-type': 'application/x-www-form-urlencoded', ...headers }, socket: { remoteAddress: '127.0.0.1' } });
  const result = { headers: {} };
  const res = { headersSent: false, setHeader(k, v) { result.headers[k.toLowerCase()] = v; },
    writeHead(status, headers = {}) { result.status = status; for (const [k, v] of Object.entries(headers)) this.setHeader(k, v); this.headersSent = true; },
    end(body) { result.body = String(body ?? ''); } };
  await handler(req, res);
  return result;
}

test('claim route is safe for link scanners, rejects forgery and CSRF, and needs no customer-entered identity', async () => {
  let calls = 0;
  const handler = createHandler({ ...config, issueCredit: async ({ userIdentifier }) => { calls++; assert.equal(userIdentifier, approvedId); return { environment: 'staging', code: 'TEST-CODE', redemptionUrl: null }; } });
  const token = createClaim({ userIdentifier: approvedId, environment: 'staging', secret });
  for (const method of ['GET', 'HEAD']) assert.equal((await request(handler, { method, token })).status, 200);
  assert.equal(calls, 0);
  assert.equal((await request(handler, { token: 'forged' })).status, 403);
  for (const headers of [{ origin: 'https://evil.example' }, { origin: undefined }, { 'sec-fetch-site': 'cross-site' }]) assert.equal((await request(handler, { token, headers })).status, 403);
  assert.equal((await request(handler, { token, headers: { 'content-type': 'application/json' } })).status, 415);
  assert.equal((await request(handler, { body: 'a'.repeat(2049) })).status, 413);
  assert.equal(calls, 0);
  const result = await request(handler, { token, body: new URLSearchParams({ claim: token, user_identifier: 'attacker-picked-id' }).toString() });
  assert.equal(result.status, 200);
  assert.match(result.body, /Staging codes cannot be redeemed/);
  assert.equal(result.headers.location, undefined);
  assert.equal(result.headers['referrer-policy'], 'same-origin');
  assert.match(result.body, /<meta name="referrer" content="same-origin">/);
  assert.match(result.headers['cache-control'], /no-store/);
  assert.match(result.headers['x-robots-tag'], /noindex/);
  assert.doesNotMatch(result.body, /approved-company-001|sb_partner_test_only/);
  assert.equal(calls, 1);
  // A valid claim must never unlock the entire directory.
  assert.match((await request(handler, { method: 'GET', path: '/perks', token })).body, /Portfolio access code/);
});

test('missing partner key hides the redemption form and rejects POST before reserving a company', async () => {
  const handler = createHandler({ ...config, creditsEnv: { SUPABASE_PARTNER_ENVIRONMENT: 'production', SUPABASE_CLAIM_SECRET: secret },
    accessServices: { ...config.accessServices, reserveClaim: async () => assert.fail('must not reserve') },
    issueCredit: async () => assert.fail('must not issue') });
  for (const method of ['GET', 'POST']) {
    const result = await request(handler, { method });
    assert.equal(result.status, method === 'GET' ? 200 : 503);
    assert.match(result.body, /Supabase claims aren’t active yet/);
    assert.doesNotMatch(result.body, /<form|Continue to Supabase|temporarily unavailable|SUPABASE_PARTNER_API_KEY/);
  }
});

test('production redirects only after POST and API errors have safe user-facing responses', async () => {
  const productionEnv = { ...env, SUPABASE_PARTNER_ENVIRONMENT: 'production' };
  const token = createClaim({ userIdentifier: approvedId, environment: 'production', secret });
  const handler = createHandler({ ...config, creditsEnv: productionEnv, issueCredit: args => issueSupabaseCredit({ ...args, fetchImpl: async () => response(201, { code: 'PRODUCTION-TEST' }) }) });
  const result = await request(handler, { token });
  assert.equal(result.status, 303);
  assert.equal(result.headers.location, 'https://supabase.com/dashboard/redeem?code=PRODUCTION-TEST');
  for (const [upstream, expected] of [[400, 400], [401, 503], [429, 429], [500, 503]]) {
    const failed = createHandler({ ...config, creditsEnv: productionEnv, issueCredit: args => issueSupabaseCredit({ ...args, fetchImpl: async () => response(upstream, { secret: 'private failure' }) }) });
    const error = await request(failed, { token });
    assert.equal(error.status, expected);
    assert.doesNotMatch(error.body, /private failure|sb_partner_/);
    assert.ok(error.body.includes(`value="${token}"`), 'preserve the validated invitation so transient failures can be retried');
  }
});

test('concurrent claim attempts consume the throttle before the upstream request resolves', async () => {
  let calls = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const handler = createHandler({ ...config, claimLimiter: createRateLimiter({ limit: 2 }), issueCredit: async () => { calls++; await gate; return { environment: 'staging', code: 'TEST-CODE' }; } });
  const token = createClaim({ userIdentifier: approvedId, environment: 'staging', secret });
  const pending = Array.from({ length: 5 }, () => request(handler, { token }));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 2);
  release();
  const results = await Promise.all(pending);
  assert.equal(results.filter(result => result.status === 429).length, 3);
});


test('claim issuance fails closed when access services are missing', async () => {
  const token = createClaim({ userIdentifier: approvedId, environment: 'staging', secret });
  const handler = createHandler({ ...config, accessServices: undefined, issueCredit: () => assert.fail('must not issue') });
  assert.equal((await request(handler, { token })).status, 403);
});
