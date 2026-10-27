import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { normalizeEmail, createLocalEmailStore, createRedisEmailStore } from '../src/approved-emails.mjs';
import { createLocalMailer, createResendMailer } from '../src/claim-email.mjs';
import { createAuth } from '../src/auth.mjs';
import { createAccessRouter, createAccessServices } from '../src/supabase-access.mjs';
import { createHandler } from '../src/server.mjs';
import { createClaim, readClaim } from '../src/supabase-claims.mjs';

const teamId = '11111111111111111111111111111111';
const teamIdentifier = `886-team:${teamId}`;
const origin = 'https://www.886studios.com';
const adminCode = 'fixture-staff-access-code';
const secret = 'fixture-claim-secret-with-more-than-43-characters';
const env = { SUPABASE_PARTNER_API_KEY: 'sb_partner_fixture', SUPABASE_CLAIM_SECRET: secret };
const founder = { code: 'fixture-founder-code', secret: 'fixture-founder-secret-with-32-characters' };
const root = fileURLToPath(new URL('..', import.meta.url));
const catalog = { perks: [{ id: 'supabase', name: 'Supabase', category: 'Engineering', headline: 'Private fixture offer', description: 'Fixture', about: 'Fixture partner', offer: 'Private terms', eligibility: 'Approved companies', instructions: 'Enter your approved email.', href: 'https://supabase.com', action: 'Claim', links: [] }] };

async function request(handler, path, { method = 'GET', values = {}, cookie, origin: requestOrigin = origin, headers = {} } = {}) {
  const body = new URLSearchParams(values).toString();
  const req = Readable.from([Buffer.from(body)]);
  Object.assign(req, { url: path, method, headers: { origin: requestOrigin, cookie, 'content-type': 'application/x-www-form-urlencoded', ...headers }, socket: { remoteAddress: '127.0.0.1' } });
  const result = { headers: {} };
  const res = { headersSent: false, setHeader(k, v) { result.headers[k.toLowerCase()] = v; },
    writeHead(status, values = {}) { result.status = status; for (const [k, v] of Object.entries(values)) this.setHeader(k, v); this.headersSent = true; },
    end(body) { result.body = String(body ?? ''); } };
  await handler(req, res);
  return result;
}

async function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'perks-email-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const store = createLocalEmailStore(join(dir, 'approvals.json'));
  await store.registerTeam({ id: teamId, name: 'Fixture Company' });
  const mailer = createLocalMailer(join(dir, 'outbox.json'));
  const adminAuth = createAuth({ code: adminCode, secret, basePath: '/perks/admin', name: '886_perks_admin', sessionSeconds: 28800 });
  const accessServices = createAccessRouter({ store, mailer, adminAuth, env, origin, basePath: '/perks' });
  const calls = [];
  const handler = createHandler({ root, ...founder, origin, basePath: '/perks', catalog, creditsEnv: env, accessServices,
    issueCredit: async ({ userIdentifier }) => { calls.push(userIdentifier); return { environment: 'staging', code: 'TEST-CODE', redemptionUrl: null }; } });
  const founderCookie = createAuth({ ...founder, basePath: '/perks' }).issue().split(';')[0];
  const staffCookie = adminAuth.issue().split(';')[0];
  return { dir, store, mailer, handler, founderCookie, staffCookie, calls };
}

test('email normalization preserves distinct addresses and rejects injected or malformed inputs', () => {
  assert.equal(normalizeEmail(' Founder+Perks@Company.COM '), 'founder+perks@company.com');
  assert.equal(normalizeEmail('first.last@example.com'), 'first.last@example.com');
  for (const value of ['', 'a@', 'a@example.com,b@example.com', 'a@localhost', 'a\r\n@example.com', 'a..b@example.com', 'a.@example.com', '<a@example.com>']) assert.throws(() => normalizeEmail(value));
});

test('approvals and throttles persist, duplicate approvals keep the version, and reapproval revokes old invitations', async t => {
  const { dir, store } = await fixture(t);
  const first = await store.approve('Founder@company.com', teamId);
  assert.equal((await store.approve('founder@company.com', teamId)).version, first.version);
  const secondInstance = createLocalEmailStore(join(dir, 'approvals.json'));
  assert.equal((await secondInstance.get('founder@company.com')).version, first.version);
  assert.equal(await store.consume('request', 1, 900), true);
  assert.equal(await secondInstance.consume('request', 1, 900), false);
  await secondInstance.revoke('founder@company.com');
  assert.equal(await store.get('founder@company.com'), null);
  assert.notEqual((await store.approve('founder@company.com', teamId)).version, first.version);
});

test('staff login is isolated from the founder session and approval actions require staff authentication and origin', async t => {
  const { handler, founderCookie, staffCookie, store, mailer } = await fixture(t);
  const post = (path, options = {}) => request(handler, `/perks/admin/${path}`, { method: 'POST', ...options });
  for (const cookie of [undefined, founderCookie]) {
    assert.equal((await post('approve', { cookie, values: { email: 'founder@company.com' } })).status, 401);
    assert.doesNotMatch((await request(handler, '/perks/admin', { cookie })).body, /No emails approved yet/);
  }
  assert.equal((await post('approve', { cookie: staffCookie, origin: 'https://evil.example', values: { email: 'founder@company.com' } })).status, 403);
  assert.equal((await post('login', { values: { code: founder.code } })).status, 401);
  const signed = await post('login', { values: { code: adminCode } });
  assert.equal(signed.status, 303);
  assert.match(signed.headers['set-cookie'], /^__Secure-886_perks_admin=/);
  assert.match(signed.headers['set-cookie'], /Path=\/perks\/admin; HttpOnly; SameSite=Strict; Secure/);
  assert.match(signed.headers['set-cookie'], /Max-Age=28800/);
  const approval = await post('approve', { cookie: staffCookie, values: { email: 'Founder@company.com', team: teamId } });
  assert.equal(approval.status, 200);
  assert.ok(await store.get('founder@company.com'));
  assert.equal(mailer.list().length, 0, 'approving an email does not send a message');
  assert.equal((await request(handler, '/perks/admin/revoke', { cookie: staffCookie })).status, 405);
  const publicPage = await request(handler, '/perks', { cookie: staffCookie });
  assert.doesNotMatch(publicPage.body, /Private terms/);
  const logout = await post('logout', { cookie: staffCookie });
  assert.match(logout.headers['set-cookie'], /Max-Age=0/);
});

test('approved email → private inbox → claim works; other visitors cannot discover membership or obtain the link', async t => {
  const { handler, store, mailer, founderCookie, staffCookie, calls } = await fixture(t);
  await store.approve('founder@company.com', teamId);
  const submit = (email, cookie = founderCookie) => request(handler, '/perks/supabase/request', { method: 'POST', cookie, values: { email } });
  assert.equal((await submit('founder@company.com', null)).status, 401);
  assert.equal(mailer.list().length, 0);
  const approved = await submit('Founder@company.com');
  const unknown = await submit('stranger@company.com');
  assert.equal(approved.status, 200);
  assert.equal(approved.body, unknown.body);
  assert.doesNotMatch(approved.body, /founder@company.com|stranger@company.com|\/supabase#[A-Za-z0-9_-]{40}/);
  assert.equal(mailer.list().length, 1);
  const message = mailer.list()[0];
  assert.equal(message.email, 'founder@company.com');
  const token = new URL(message.claimUrl).hash.slice(1);
  const claim = readClaim(token, { secret, environment: 'staging' });
  assert.equal(claim.userIdentifier, teamIdentifier);
  assert.equal(claim.email, 'founder@company.com');
  assert.equal(claim.approvalVersion, (await store.get(message.email)).version);
  const admin = await request(handler, '/perks/admin', { cookie: staffCookie });
  assert.ok(admin.body.includes(token));
  assert.ok(!(await request(handler, '/perks/admin', { cookie: founderCookie })).body.includes(token));
  const result = await request(handler, '/perks/supabase', { method: 'POST', values: { claim: token, user_identifier: 'attacker@company.com' } });
  assert.equal(result.status, 200);
  assert.deepEqual(calls, [teamIdentifier]);
  assert.match(result.body, /Staging codes cannot be redeemed/);
  assert.match(result.headers['cache-control'], /no-store/);
  assert.equal(result.headers['referrer-policy'], 'same-origin');
});

test('revocation rejects already emailed links even after reapproval, and legacy links cannot bypass the list', async t => {
  const { handler, store, mailer, founderCookie, calls } = await fixture(t);
  await store.approve('founder@company.com', teamId);
  await request(handler, '/perks/supabase/request', { method: 'POST', cookie: founderCookie, values: { email: 'founder@company.com' } });
  const token = new URL(mailer.list()[0].claimUrl).hash.slice(1);
  await store.revoke('founder@company.com');
  const redeem = claim => request(handler, '/perks/supabase', { method: 'POST', values: { claim } });
  assert.equal((await redeem(token)).status, 403);
  await store.approve('founder@company.com', teamId);
  assert.equal((await redeem(token)).status, 403);
  const legacy = createClaim({ userIdentifier: 'founder@company.com', secret, environment: 'staging' });
  assert.equal((await redeem(legacy)).status, 403);
  assert.deepEqual(calls, []);
});

test('email delivery is bounded and invalid emails, cross-site requests, and oversized forms never send', async t => {
  const { handler, store, mailer, founderCookie } = await fixture(t);
  await store.approve('founder@company.com', teamId);
  const submit = options => request(handler, '/perks/supabase/request', { method: 'POST', cookie: founderCookie, values: { email: 'founder@company.com' }, ...options });
  assert.equal((await submit({ origin: 'https://evil.example' })).status, 403);
  assert.equal((await submit({ values: { email: '<script>' } })).status, 400);
  assert.equal((await submit({ headers: { 'content-length': '4096' } })).status, 413);
  assert.equal(mailer.list().length, 0);
  for (let i = 0; i < 8; i++) assert.equal((await submit()).status, 200);
  assert.equal(mailer.list().length, 3);
  assert.equal((await submit()).status, 429);
});

test('production never falls back to filesystem approvals or a local test inbox', async t => {
  const { dir } = await fixture(t);
  const service = createAccessServices({ root: dir, env, secure: true, origin, basePath: '/perks' });
  assert.equal(await service.allows({ userIdentifier: 'founder@company.com', approvalVersion: 'unknown' }), false);
  let response;
  await service.handle({ req: { method: 'GET', headers: {} }, path: '/admin', send: (status, body) => { response = { status, body }; } });
  assert.equal(response.status, 503);
  assert.doesNotMatch(response.body, /Local test inbox|sb_partner_fixture/);
});

test('Resend receives only the approved recipient and private link; failures never expose credentials', async () => {
  let payload;
  const mailer = createResendMailer({ RESEND_API_KEY: 're_fixture', PERKS_EMAIL_FROM: 'perks@886studios.com' }, { fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers.Authorization, 'Bearer re_fixture');
    assert.equal(options.redirect, 'error');
    payload = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: 'fixture-message' }) };
  } });
  await mailer.send({ email: 'Founder@company.com', claimUrl: 'https://www.886studios.com/perks/supabase#test' });
  assert.deepEqual(payload.to, ['founder@company.com']);
  assert.match(payload.text, /supabase#test/);
  assert.ok(!JSON.stringify(payload).includes('re_fixture'));
  const failed = createResendMailer({ RESEND_API_KEY: 're_fixture', PERKS_EMAIL_FROM: 'perks@886studios.com' }, { fetchImpl: async () => { throw new Error('re_fixture private details'); } });
  await assert.rejects(failed.send({ email: 'founder@company.com', claimUrl: 'https://example.com' }), { message: 'Claim email could not be sent.' });
});

test('Redis keeps identifiers in authenticated POST bodies, partitions environments, and uses atomic rate accounting', async () => {
  const commands = [];
  const redisEnv = { UPSTASH_REDIS_REST_URL: 'https://fixture.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'private-storage-token' };
  const store = createRedisEmailStore(redisEnv, { fetchImpl: async (url, options) => {
    assert.equal(url, 'https://fixture.upstash.io');
    assert.equal(options.headers.Authorization, 'Bearer private-storage-token');
    assert.equal(options.method, 'POST');
    assert.equal(options.redirect, 'error');
    const command = JSON.parse(options.body); commands.push(command);
    return { ok: true, json: async () => ({ result: command[0] === 'EVAL' ? 2 : null }) };
  } });
  assert.equal(await store.get('founder@company.com'), null);
  assert.equal(commands[0][1], '886:perks:staging:team-emails');
  assert.ok(!commands[0].includes('founder@company.com'));
  assert.equal(await store.consume('email:founder@company.com', 1, 900), false);
  assert.equal(commands[1][0], 'EVAL');
  assert.match(commands[1][1], /INCR.*EXPIRE/);
  assert.throws(() => createRedisEmailStore({ ...redisEnv, UPSTASH_REDIS_REST_URL: 'http://localhost:1234' }));
  assert.throws(() => createRedisEmailStore({ ...redisEnv, UPSTASH_REDIS_REST_URL: 'https://fixture.upstash.io.evil.example' }));
});


test('one designated founder per team survives concurrency, restarts, contact replacement, and product renames', async t => {
  const { store, dir, handler, mailer, founderCookie, staffCookie, calls } = await fixture(t);
  const otherId = '22222222222222222222222222222222';
  await store.registerTeam({ id: otherId, name: 'Another Company' });
  const concurrent = await Promise.allSettled([
    store.approve('first@company.com', teamId), store.approve('second@company.com', teamId),
  ]);
  assert.deepEqual(concurrent.map(r => r.status), ['fulfilled', 'rejected']);
  const second = createLocalEmailStore(join(dir, 'approvals.json'));
  await assert.rejects(second.approve('second@company.com', teamId), /already has/);
  await assert.rejects(second.approve('first@company.com', otherId), /another team/);
  await assert.rejects(second.approve('unknown@company.com'), /registered team/);
  const denied = await request(handler, '/perks/admin/approve', { method: 'POST', cookie: staffCookie, values: { email: 'second@company.com', team: teamId } });
  assert.equal(denied.status, 409);
  const sendLink = email => request(handler, '/perks/supabase/request', { method: 'POST', cookie: founderCookie, values: { email } });
  const redeem = token => request(handler, '/perks/supabase', { method: 'POST', values: { claim: token } });
  await sendLink('first@company.com');
  const oldToken = new URL(mailer.list()[0].claimUrl).hash.slice(1);
  assert.equal((await redeem(oldToken)).status, 200);
  await second.revoke('first@company.com');
  await second.registerTeam({ id: teamId, name: 'Renamed Product' });
  await second.approve('second@company.com', teamId);
  // Repeating a revoke on an old email cannot revoke the new contact.
  await second.revoke('first@company.com');
  assert.equal((await redeem(oldToken)).status, 403);
  await sendLink('first@company.com');
  assert.equal(mailer.list().length, 1);
  await sendLink('second@company.com');
  const newToken = new URL(mailer.list().find(m => m.email === 'second@company.com').claimUrl).hash.slice(1);
  assert.equal((await redeem(newToken)).status, 200);
  assert.deepEqual(calls, [teamIdentifier, teamIdentifier], 'Supabase enforces redemption against the SAME permanent team identifier');
  assert.equal((await second.list()).length, 1);
  assert.equal((await second.teams()).length, 2, 'team registry survives revocations');
});
