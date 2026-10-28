import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRedisEmailStore } from '../src/approved-emails.mjs';

// Optional real Redis integration: REDIS_SERVER=/path/to/redis-server npm test
// Isolated Unix socket, synthetic identities, no network or hosted credentials.
test('Redis atomically reserves one team claimant among approved founders and preserves the lock', { skip: !process.env.REDIS_SERVER }, async t => {
  const directory = mkdtempSync(join(tmpdir(), 'perks-redis-'));
  const socket = join(directory, 'redis.sock');
  const child = spawn(process.env.REDIS_SERVER, ['--port', '0', '--unixsocket', socket, '--save', '', '--appendonly', 'no', '--dir', directory]);
  t.after(async () => {
    if (child.exitCode === null) {
      const stopped = new Promise(resolve => child.once('exit', resolve));
      child.kill('SIGTERM'); await stopped;
    }
    rmSync(directory, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Redis did not start')), 10000);
    child.on('error', error => { clearTimeout(timeout); reject(error); });
    child.on('exit', code => { clearTimeout(timeout); reject(new Error(`Redis exited: ${code}`)); });
    child.stdout.on('data', chunk => {
      output += chunk;
      if (/ready to accept connections/i.test(output)) { clearTimeout(timeout); resolve(); }
    });
  });
  const execute = promisify(execFile);
  const options = { fetchImpl: async (_url, request) => {
    const command = JSON.parse(request.body).map(String);
    const { stdout } = await execute(join(dirname(process.env.REDIS_SERVER), 'redis-cli'), ['-s', socket, '--json', ...command]);
    return { ok: true, json: async () => ({ result: JSON.parse(stdout) }) };
  } };
  const env = { UPSTASH_REDIS_REST_URL: 'https://fixture.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'fixture' };
  const a = createRedisEmailStore(env, options), b = createRedisEmailStore(env, options);
  const id = '11111111111111111111111111111111', otherId = '22222222222222222222222222222222';
  await a.registerTeam({ id, name: 'Example' });
  await a.registerTeam({ id: otherId, name: 'Another' });
  const approvals = await Promise.all(Array.from({ length: 16 }, (_, i) => (i % 2 ? a : b).approve(`founder${i}@example.com`, id)));
  assert.equal((await a.list()).length, 16);
  const claim = approval => ({ email: approval.email, approvalVersion: approval.version, userIdentifier: approval.userIdentifier });
  assert.equal(await a.reserveClaim({ ...claim(approvals[0]), approvalVersion: 'revoked-version' }), 'invalid');
  assert.equal(await b.reserveClaim({ ...claim(approvals[0]), userIdentifier: 'attacker-picked-id' }), 'invalid');
  const results = await Promise.all(approvals.map((approval, i) => (i % 2 ? a : b).reserveClaim(claim(approval))));
  assert.equal(results.filter(result => result === 'allowed').length, 1);
  assert.equal(results.filter(result => result === 'claimed').length, 15);
  const first = approvals[results.indexOf('allowed')];
  assert.equal((await b.get(first.email)).version, first.version);
  assert.equal((await b.approve(first.email, id)).version, first.version);
  assert.equal(await a.reserveClaim(claim(first)), 'allowed');
  await assert.rejects(b.approve(first.email, otherId), /another team/);
  const other = await b.approve('another-team@example.com', otherId);
  assert.equal(await a.reserveClaim(claim(other)), 'allowed', 'another company has an independent entitlement');
  await b.revoke(first.email);
  assert.equal(await a.get(first.email), null);
  assert.equal(await a.reserveClaim(claim(first)), 'invalid');
  await a.registerTeam({ id, name: 'Renamed' });
  const replacement = await b.approve('replacement@example.com', id);
  assert.equal(replacement.userIdentifier, first.userIdentifier);
  assert.equal(await a.reserveClaim(claim(replacement)), 'claimed');
  await a.revoke(first.email);
  assert.equal((await b.get(replacement.email)).version, replacement.version);
  const renewed = await b.approve(first.email, id);
  assert.notEqual(renewed.version, first.version);
  assert.equal(renewed.teamName, 'Renamed');
  assert.equal(await a.reserveClaim(claim(first)), 'invalid');
  assert.equal(await b.reserveClaim(claim(renewed)), 'allowed');
  assert.equal((await a.teams()).find(team => team.id === id).claimant.email, first.email);
  // Exercise singleton migration with an existing approval version.
  const legacyId = '33333333333333333333333333333333';
  const legacyApproval = { ...first, email: 'legacy@example.com', teamId: legacyId, userIdentifier: `886-team:${legacyId}` };
  const legacy = { id: legacyId, name: 'Legacy', userIdentifier: legacyApproval.userIdentifier, approval: legacyApproval };
  await execute(join(dirname(process.env.REDIS_SERVER), 'redis-cli'), ['-s', socket, 'HSET', '886:perks:staging:teams', legacyId, JSON.stringify(legacy)]);
  const { emailKey } = await import('../src/approved-emails.mjs');
  await execute(join(dirname(process.env.REDIS_SERVER), 'redis-cli'), ['-s', socket, 'HSET', '886:perks:staging:team-emails', emailKey(legacyApproval.email), legacyId]);
  assert.equal((await a.get(legacyApproval.email)).version, first.version);
  await b.approve('legacy-cofounder@example.com', legacyId);
  assert.equal(await a.reserveClaim(claim(legacyApproval)), 'allowed');
  await a.revoke(legacyApproval.email);
  assert.equal(await b.reserveClaim(claim(legacyApproval)), 'invalid');
  const production = createRedisEmailStore({ ...env, SUPABASE_PARTNER_ENVIRONMENT: 'production' }, options);
  assert.equal(await production.get(replacement.email), null);
  assert.deepEqual(await production.teams(), []);

  // Two instances creating the same company must not mint two entitlements.
  const creations = await Promise.allSettled(Array.from({ length: 12 }, (_, i) =>
    (i % 2 ? a : b).createTeam({ name: i % 2 ? ' New   Team ' : 'new team', email: `new${i}@example.com` })));
  assert.equal(creations.filter(r => r.status === 'fulfilled').length, 1);
  const created = creations.find(r => r.status === 'fulfilled').value;
  assert.equal(Object.keys(created.approvals).length, 1);
  const member = Object.values(created.approvals)[0];
  assert.equal(await a.reserveClaim(claim(member)), 'allowed');
  const cofounder = await b.approve('cofounder@example.com', created.id);
  assert.equal(await b.reserveClaim(claim(cofounder)), 'claimed');
  await a.revoke(member.email);
  await assert.rejects(b.createTeam({ name: 'Another New Team', email: member.email }), /another team/);
  assert.equal((await a.teams()).filter(t => t.name.toLowerCase().includes('new')).length, 1);
});
