import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';

test('a credential-free fixture build packages the new runtime and preserves production login', async () => {
  const root = mkdtempSync(join(tmpdir(), 'perks-build-'));
  const source = fileURLToPath(new URL('..', import.meta.url));
  const marker = 'private-local-data-must-not-be-packaged';
  try {
    for (const directory of ['src', 'public', 'scripts']) cpSync(join(source, directory), join(root, directory), { recursive: true });
    mkdirSync(join(root, 'private'));
    const catalog = { perks: [{ id: 'fixture', name: 'Fixture Partner', category: 'Engineering',
      headline: 'Fixture benefit', description: 'Synthetic description', about: 'Synthetic partner',
      aboutSource: 'https://example.com', offer: 'Fixture confidential offer', instructions: 'Use this synthetic link.',
      href: 'https://example.com/redeem', source: 'https://example.com/source', action: 'Redeem', links: [] }] };
    writeFileSync(join(root, 'private/catalog.json'), JSON.stringify(catalog));
    writeFileSync(join(root, 'private/dev-access.json'), JSON.stringify({ code: marker }));
    writeFileSync(join(root, 'private/source-records.json'), JSON.stringify({ marker }));
    writeFileSync(join(root, 'private/supabase-offer.json'), JSON.stringify({ marker }));
    writeFileSync(join(root, 'private/company-claim.json'), JSON.stringify({ claimUrl: marker }));
    writeFileSync(join(root, 'private/test-code.json'), JSON.stringify({ code: marker }));
    writeFileSync(join(root, 'private/approved-emails.json'), JSON.stringify({ email: marker }));
    writeFileSync(join(root, 'private/claim-outbox.json'), JSON.stringify({ claimUrl: marker }));
    writeFileSync(join(root, '.env.local'), `PERKS_ACCESS_CODE=${marker}\n`);
    writeFileSync(join(root, '.env.supabase-staging'), `SUPABASE_PARTNER_API_KEY=${marker}\nSUPABASE_CLAIM_SECRET=${marker}\n`);
    const built = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: root, env: { PATH: process.env.PATH }, encoding: 'utf8' });
    assert.equal(built.status, 0, built.stderr);
    const output = join(root, '.vercel/output');
    const files = [];
    function walk(directory, prefix = '') {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const name = `${prefix}${entry.name}`;
        if (entry.isDirectory()) walk(join(directory, entry.name), `${name}/`);
        else files.push(name);
      }
    }
    walk(output);
    assert.deepEqual(files.filter(name => name.includes('/private/')), ['functions/index.func/private/catalog.json']);
    assert.ok(!files.some(name => /\.env|dev-access|source-records/.test(name)));
    for (const name of files.filter(name => /\.(mjs|json|js|css)$/.test(name))) {
      assert.ok(!readFileSync(join(output, name), 'utf8').includes(marker), name);
    }
    assert.equal(JSON.parse(readFileSync(join(output, 'functions/index.func/.vc-config.json'))).runtime, 'nodejs22.x');
    const fn = join(output, 'functions/index.func');
    const { createProductionHandler } = await import(pathToFileURL(join(fn, 'src/runtime.mjs')));
    // Legacy values deliberately exercise compatibility at the production entry point.
    const env = { PERKS_ACCESS_CODE: 'sample', PERKS_SESSION_SECRET: 'legacy-session-key-32-characters!' };
    const handler = createProductionHandler({ root: fn, env, vercel: true });
    async function request(url, method = 'GET', headers = {}, body = '') {
      const req = Readable.from(body ? [Buffer.from(body)] : []);
      Object.assign(req, { url, method, headers, socket: { remoteAddress: '127.0.0.1' } });
      const result = { headers: {} };
      const res = { headersSent: false, setHeader(k, v) { result.headers[k.toLowerCase()] = v; },
        writeHead(status, headers = {}) { result.status = status; for (const [k, v] of Object.entries(headers)) this.setHeader(k, v); this.headersSent = true; },
        end(body) { result.body = String(body ?? ''); } };
      await handler(req, res);
      return result;
    }
    assert.doesNotMatch((await request('/perks')).body, /Fixture confidential offer/);
    const login = await request('/perks/login', 'POST', { origin: 'https://www.886studios.com',
      'content-type': 'application/x-www-form-urlencoded', 'x-vercel-forwarded-for': '192.0.2.1' }, 'code=sample');
    assert.equal(login.status, 303);
    assert.equal(login.headers.location, '/perks');
    assert.match(login.headers['set-cookie'], /^__Secure-886_perks=/);
    const session = { cookie: login.headers['set-cookie'].split(';')[0] };
    assert.match((await request('/perks', 'GET', session)).body, /Fixture confidential offer/);
    assert.equal((await request('/perks/private/catalog.json', 'GET', session)).status, 404);
    assert.equal((await request('/perks/styles.css')).status, 200);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
