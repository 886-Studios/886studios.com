import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalEmailStore } from '../src/approved-emails.mjs';
import { validateRoster, importFounders } from '../src/founder-import.mjs';

test('reviewed founder import is private, idempotent, and rejects duplicate teams and cross-team contacts', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'perks-import-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const store = createLocalEmailStore(join(directory, 'approvals.json'));
  const row = { id: '11111111111111111111111111111111', name: 'Example', email: 'founder@example.com', notes: 'private source notes' };
  const roster = { teams: [row] };
  assert.equal((await importFounders(store, roster)).applied, false);
  assert.deepEqual(await store.list(), []);
  await importFounders(store, roster, { apply: true });
  const original = await store.get(row.email);
  await importFounders(store, roster, { apply: true });
  assert.equal((await store.get(row.email)).version, original.version);
  assert.ok(!JSON.stringify(await store.teams()).includes('private source notes'));
  for (const duplicate of [{ ...row }, { ...row, id: '22222222222222222222222222222222' }, { ...row, email: 'another@example.com' }]) {
    assert.throws(() => validateRoster({ teams: [row, duplicate] }), /Duplicate/);
  }
  await importFounders(store, { teams: [{ ...row, name: 'Example Inc.', emails: [row.email, 'cofounder@example.com', 'third@example.com'] }] }, { apply: true });
  assert.equal((await store.list()).length, 3);
  assert.equal((await store.get(row.email)).teamName, 'Example Inc.');
  await assert.rejects(importFounders(store, { teams: [{ ...row, id: '33333333333333333333333333333333', name: 'Other Team' }] }, { apply: true }), /conflicts/);
  assert.throws(() => validateRoster({ teams: [{ ...row, emails: [row.email, row.email.toUpperCase()] }] }), /Duplicate/);
  assert.equal((await store.get(row.email)).version, original.version);
});
