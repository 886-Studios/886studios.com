import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateCredentials, validateOrigin, validateBasePath, parsePort, readRuntimeConfig } from '../src/config.mjs';
import { createProductionHandler } from '../src/runtime.mjs';
import { validateRelease, runPreflight } from '../scripts/preflight.mjs';

// Synthetic values, never used for a deployed environment.
const env = { PERKS_ACCESS_CODE: 'N8pvR6hZ1qLm2sK5',
  PERKS_SESSION_SECRET: '73415f9a0d63e8b7f3a296bc90d74e285bf3c60498d1a275ec639bd07f4a6e82',
  APP_ORIGIN: 'https://www.886studios.com', APP_BASE_PATH: '/perks', PORT: '4186' };
const credentials = { code: env.PERKS_ACCESS_CODE, secret: env.PERKS_SESSION_SECRET };
const project = { projectName: '886-studios-perks', projectId: 'prj_synthetic', orgId: 'team_synthetic' };

test('release credentials reject malformed values without trimming or leaking them', () => {
  for (const code of ['', ' '.repeat(16), 'short', 'x'.repeat(257), 'change-me-before-production',
    'test-portfolio-code-123', 'a'.repeat(16), ` ${credentials.code}`, `${credentials.code}\n`, `prefix\u0000${credentials.code}`]) {
    assert.throws(() => validateCredentials({ ...credentials, code }), { message: 'Invalid or missing PERKS_ACCESS_CODE.' });
  }
  for (const secret of ['', ' '.repeat(43), 'x'.repeat(43), 'test-session-secret-at-least-thirty-two-characters',
    'short', `${credentials.secret} `, `${credentials.secret}\n`]) {
    assert.throws(() => validateCredentials({ ...credentials, secret }), { message: 'Invalid or missing PERKS_SESSION_SECRET.' });
  }
  assert.doesNotThrow(() => validateCredentials(credentials));
  assert.doesNotThrow(() => validateCredentials({ ...credentials, code: 'Ab1-'.repeat(64) }));
  assert.doesNotThrow(() => validateCredentials({ ...credentials, code: 'a long phrase with spaces' }));
  assert.throws(() => validateCredentials({ code: credentials.secret, secret: credentials.secret }), /PERKS_SESSION_SECRET/);
});

test('runtime compatibility keeps old minimums but cannot configure an unusably long code', () => {
  const legacy = { code: 'sample', secret: 'legacy-session-key-32-characters!' };
  assert.doesNotThrow(() => validateCredentials(legacy, { strict: false }));
  assert.throws(() => validateCredentials(legacy), /PERKS_ACCESS_CODE/);
  assert.throws(() => validateCredentials({ ...legacy, code: 'x'.repeat(257) }, { strict: false }), /PERKS_ACCESS_CODE/);
});

test('origins reject credentials, normalization tricks and non-origin components', () => {
  for (const origin of ['http://example.com', '//example.com', 'https:example.com',
    'https://user:password@example.com', 'https://@example.com', 'https://example.com/path',
    'https://example.com/..', 'https://example.com/a/../', 'https://example.com?x=1', 'https://example.com?',
    'https://example.com/#', 'https://example.com/#x', ' https://example.com', 'https://example.com\n',
    'https://example.com\\path', 'https://exa\tmple.com']) {
    assert.throws(() => validateOrigin(origin), { message: 'Invalid or missing APP_ORIGIN.' });
  }
  assert.equal(validateOrigin('https://www.886studios.com/'), 'https://www.886studios.com');
  for (const origin of ['http://localhost:4186', 'http://127.0.0.1:4186', 'http://[::1]:4186']) {
    assert.equal(validateOrigin(origin, { secure: false }), origin);
  }
  assert.throws(() => validateOrigin('http://example.com', { secure: false }), /APP_ORIGIN/);
});

test('ports and base paths preserve supported defaults and reject ambiguous settings', () => {
  assert.equal(parsePort(), 4186);
  assert.equal(parsePort('1'), 1);
  assert.equal(parsePort('65535'), 65535);
  for (const port of ['', ' ', '0', '65536', '-1', '4186.0', '1e3', '04186', '4186x', ' 4186', 'NaN']) {
    assert.throws(() => parsePort(port), /PORT/);
  }
  for (const path of ['', '/perks', '/preview/perks']) assert.equal(validateBasePath(path), path);
  for (const path of ['/perks/', '/perks/../', '//perks', 'perks', '/Perks', undefined]) {
    assert.throws(() => validateBasePath(path), /APP_BASE_PATH/);
  }
  const fallback = readRuntimeConfig({ PERKS_ACCESS_CODE: env.PERKS_ACCESS_CODE, PERKS_SESSION_SECRET: env.PERKS_SESSION_SECRET });
  assert.equal(fallback.origin, env.APP_ORIGIN);
  assert.equal(fallback.basePath, '/perks');
  assert.equal(readRuntimeConfig({ ...env, APP_BASE_PATH: '' }).basePath, '');
});

test('release preflight checks runtime, explicit production settings and linked project', () => {
  const check = (overrides = {}) => validateRelease({ env, project, nodeVersion: '22.23.4', ...overrides });
  assert.ok(check().includes('PERKS_ACCESS_CODE'));
  for (const nodeVersion of ['20.20.0', '22.12.0', '22.22.9', '22.23.3', '22.23.4-rc.1', '22.invalid.4', '23.0.0', '26.10.0']) {
    assert.throws(() => check({ nodeVersion }), /Node.js/);
  }
  for (const nodeVersion of ['22.23.5', '22.24.0']) assert.doesNotThrow(() => check({ nodeVersion }));
  assert.throws(() => check({ env: { ...env, APP_ORIGIN: undefined } }), /APP_ORIGIN/);
  assert.throws(() => check({ env: { ...env, APP_BASE_PATH: '' } }), /APP_BASE_PATH/);
  assert.throws(() => check({ project: { ...project, projectName: 'public-site' } }), /project.json/);
  assert.throws(() => check({ project: { ...project, projectId: '' } }), /project.json/);
  assert.throws(() => check({ env: { ...env, VERCEL_PROJECT_ID: 'prj_other' } }), /project.json/);
  assert.throws(() => check({ env: { ...env, VERCEL_ORG_ID: 'team_other' } }), /project.json/);
  assert.doesNotThrow(() => check({ env: { ...env, VERCEL_PROJECT_ID: project.projectId, VERCEL_ORG_ID: project.orgId } }));
  assert.ok(!JSON.stringify(check()).includes(env.PERKS_ACCESS_CODE));
});

test('preflight reads only its app project link and does not emit credentials', () => {
  const root = mkdtempSync(join(tmpdir(), 'perks-preflight-'));
  try {
    assert.throws(() => runPreflight({ env, root }), /project.json/);
    mkdirSync(join(root, '.vercel'));
    writeFileSync(join(root, '.vercel/project.json'), JSON.stringify(project));
    assert.ok(runPreflight({ env, root }).includes('.vercel/project.json'));
    const script = fileURLToPath(new URL('../scripts/preflight.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [script], { env: { PATH: process.env.PATH, ...env }, encoding: 'utf8' });
    const output = result.stdout + result.stderr;
    assert.ok(!output.includes(env.PERKS_ACCESS_CODE));
    assert.ok(!output.includes(env.PERKS_SESSION_SECRET));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('invalid runtime configuration fails closed without echoing values', () => {
  const secretMarker = 'never-print-this-invalid-origin';
  const messages = [];
  const previous = console.error;
  let handler;
  try {
    console.error = message => messages.push(message);
    handler = createProductionHandler({ root: '/missing', env: { ...env, APP_ORIGIN: secretMarker } });
  } finally { console.error = previous; }
  const result = { headers: {} };
  handler({ method: 'GET' }, { setHeader: (k, v) => { result.headers[k] = v; },
    writeHead: status => { result.status = status; }, end: body => { result.body = body; } });
  assert.equal(result.status, 503);
  assert.match(result.headers['Cache-Control'], /no-store/);
  assert.match(result.headers['X-Robots-Tag'], /noindex/);
  assert.ok(!JSON.stringify([messages, result]).includes(secretMarker));
});
