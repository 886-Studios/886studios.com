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
test('Redis atomically admits one founder and retains team identity across contact replacement', { skip: !process.env.REDIS_SERVER }, async t => {
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
  const results = await Promise.allSettled(Array.from({ length: 16 }, (_, i) => (i % 2 ? a : b).approve(`founder${i}@example.com`, id)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.filter(r => r.status === 'rejected').length, 15);
  const first = (await a.list())[0];
  assert.equal((await b.get(first.email)).version, first.version);
  assert.equal((await b.approve(first.email, id)).version, first.version);
  await assert.rejects(b.approve(first.email, otherId), /another team/);
  await b.revoke(first.email);
  assert.equal(await a.get(first.email), null);
  await a.registerTeam({ id, name: 'Renamed' });
  const replacement = await b.approve('replacement@example.com', id);
  assert.equal(replacement.userIdentifier, first.userIdentifier);
  assert.notEqual(replacement.version, first.version);
  await a.revoke(first.email);
  assert.equal((await b.get(replacement.email)).version, replacement.version);
  await assert.rejects(a.approve(first.email, otherId), /another team/);
  assert.equal((await a.list()).length, 1);
  const production = createRedisEmailStore({ ...env, SUPABASE_PARTNER_ENVIRONMENT: 'production' }, options);
  assert.equal(await production.get(replacement.email), null);
  assert.deepEqual(await production.teams(), []);
});
