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

async function fixture(t, { failFirstIssue = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'perks-email-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const store = createLocalEmailStore(join(dir, 'approvals.json'));
  await store.registerTeam({ id: teamId, name: 'Fixture Company' });
  const mailer = createLocalMailer(join(dir, 'outbox.json'));
  const adminAuth = createAuth({ code: adminCode, secret, basePath: '/perks/admin', name: '886_perks_admin', sessionSeconds: 28800 });
  const accessServices = createAccessRouter({ store, mailer, adminAuth, env, origin, basePath: '/perks' });
  const calls = [];
  const handler = createHandler({ root, ...founder, origin, basePath: '/perks', catalog, creditsEnv: env, accessServices,
    issueCredit: async ({ userIdentifier }) => { calls.push(userIdentifier); if (failFirstIssue && calls.length === 1) throw new Error('Synthetic upstream timeout'); return { environment: 'staging', code: 'TEST-CODE', redemptionUrl: null }; } });
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

test('staff can create a team with its first member; duplicate submissions and historical bindings cannot create another entitlement', async t => {
  const { handler, founderCookie, staffCookie, store, mailer, calls } = await fixture(t);
  const values = { name: 'New Company', email: 'First@new.example.com', id: teamId };
  const create = options => request(handler, '/perks/admin/teams', { method: 'POST', cookie: staffCookie, values, ...options });
  for (const cookie of [undefined, founderCookie]) assert.equal((await create({ cookie })).status, 401);
  assert.equal((await create({ origin: 'https://evil.example' })).status, 403);
  assert.equal((await request(handler, '/perks/admin/teams', { cookie: staffCookie })).status, 405);
  for (const invalid of [{ name: '', email: values.email }, { name: 'Empty Team', email: 'invalid' }]) assert.ok((await create({ values: invalid })).status >= 400);
  assert.equal((await store.teams()).length, 1, 'invalid requests create no empty teams');
  const created = await create();
  assert.equal(created.status, 200);
  const team = (await store.teams()).find(team => team.name === values.name);
  assert.match(team.id, /^[a-f0-9]{32}$/);
  assert.notEqual(team.id, teamId, 'the server ignores user-supplied identifiers');
  assert.equal((await store.get(values.email)).teamId, team.id);
  assert.equal((await create()).status, 409, 'refresh/retry cannot create another entitlement');
  assert.equal((await create({ values: { name: '  NEW   company ', email: 'second@new.example.com' } })).status, 409);
  await store.revoke(values.email);
  assert.equal((await create({ values: { name: 'Different Company', email: values.email } })).status, 409);
  assert.equal((await store.teams()).length, 2, 'conflicts leave no partially created teams');
  const page = await request(handler, '/perks/admin', { cookie: staffCookie });
  assert.match(page.body, /<section aria-labelledby="add-member-heading"><h2 id="add-member-heading">Add member email/);
  assert.doesNotMatch(page.body, /<summary>Add member email/);
  assert.match(page.body, /New Company — no approved emails/, 'empty existing teams remain selectable without polluting the member list');
  assert.equal(mailer.list().length, 0);
  assert.deepEqual(calls, []);
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


test('multiple approved founders race for one team claim; the winner retains it across restarts and revocation', async t => {
  const { store, dir, handler, mailer, founderCookie, staffCookie, calls } = await fixture(t);
  const otherId = '22222222222222222222222222222222';
  await store.registerTeam({ id: otherId, name: 'Another Company' });
  const emails = ['first@company.com', 'second@company.com', 'third@company.com'];
  for (const email of emails) await store.approve(email, teamId);
  const second = createLocalEmailStore(join(dir, 'approvals.json'));
  await assert.rejects(second.approve(emails[0], otherId), /another team/);
  const denied = await request(handler, '/perks/admin/approve', { method: 'POST', cookie: staffCookie, values: { email: emails[0], team: otherId } });
  assert.equal(denied.status, 409);
  await assert.rejects(second.approve('unknown@company.com'), /registered team/);
  for (const email of emails) await request(handler, '/perks/supabase/request', { method: 'POST', cookie: founderCookie, values: { email } });
  assert.equal(mailer.list().length, 3);
  assert.ok(!(await second.teams()).find(t => t.id === teamId).claimant, 'email requests do not lock the team');
  const tokens = emails.map(email => new URL(mailer.list().find(m => m.email === email).claimUrl).hash.slice(1));
  for (const token of tokens) assert.equal((await request(handler, '/perks/supabase', { values: { claim: token } })).status, 200);
  assert.ok(!(await second.teams()).find(t => t.id === teamId).claimant, 'GET/email scanners do not lock the team');
  const redeem = token => request(handler, '/perks/supabase', { method: 'POST', values: { claim: token } });
  const results = await Promise.all(tokens.map(redeem));
  assert.equal(results.filter(r => r.status === 200).length, 1);
  assert.equal(results.filter(r => r.status === 403).length, 2);
  assert.deepEqual(calls, [teamIdentifier]);
  const winner = results.findIndex(r => r.status === 200);
  assert.equal((await redeem(tokens[winner])).status, 200, 'winner can retry using the same entitlement');
  const claimant = (await second.teams()).find(t => t.id === teamId).claimant;
  assert.equal(claimant.email, emails[winner]);
  await second.registerTeam({ id: teamId, name: 'Renamed Product' });
  assert.equal((await second.get(emails[winner])).teamName, 'Renamed Product');
  for (const email of emails) await second.revoke(email);
  assert.equal((await redeem(tokens[winner])).status, 403);
  const replacement = await second.approve('replacement@company.com', teamId);
  assert.equal(replacement.userIdentifier, teamIdentifier);
  assert.equal(await second.reserveClaim({ ...replacement, approvalVersion: replacement.version }), 'claimed');
  const renewed = await second.approve(emails[winner], teamId);
  assert.equal(await second.reserveClaim({ ...renewed, approvalVersion: renewed.version }), 'allowed');
  assert.equal((await redeem(tokens[winner])).status, 403, 'reapproval cannot revive old invitation versions');
  assert.deepEqual((await second.teams()).find(t => t.id === teamId).claimant, claimant);
});


test('an upstream timeout retains the claim for its founder without unlocking another founder', async t => {
  const { handler, store, mailer, founderCookie, calls } = await fixture(t, { failFirstIssue: true });
  for (const email of ['first@company.com', 'second@company.com']) {
    await store.approve(email, teamId);
    await request(handler, '/perks/supabase/request', { method: 'POST', cookie: founderCookie, values: { email } });
  }
  const tokenFor = email => new URL(mailer.list().find(message => message.email === email).claimUrl).hash.slice(1);
  const redeem = email => request(handler, '/perks/supabase', { method: 'POST', values: { claim: tokenFor(email) } });
  assert.equal((await redeem('first@company.com')).status, 503);
  assert.equal((await redeem('second@company.com')).status, 403);
  assert.equal((await redeem('first@company.com')).status, 200);
  assert.deepEqual(calls, [teamIdentifier, teamIdentifier]);
});
