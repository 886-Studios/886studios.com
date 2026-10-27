import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHandler } from '../src/server.mjs';
import { parsePort, validateBasePath, validateCredentials } from '../src/config.mjs';
import { createAccessServices } from '../src/supabase-access.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = parsePort(process.env.PORT);
const basePath = validateBasePath(process.env.APP_BASE_PATH ?? '');
const configPath = new URL('../private/dev-access.json', import.meta.url);
if (!existsSync(configPath)) writeFileSync(configPath, JSON.stringify({ code: randomBytes(12).toString('base64url'), secret: randomBytes(32).toString('base64url') }), { mode: 0o600 });
const config = JSON.parse(readFileSync(configPath, 'utf8'));
if (!config.adminCode || !config.adminSecret) {
  config.adminCode = randomBytes(18).toString('base64url');
  config.adminSecret = randomBytes(32).toString('base64url');
  writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
}
validateCredentials(config, { strict: false });
const origin = `http://localhost:${port}`;
const env = { ...process.env, PERKS_ADMIN_ACCESS_CODE: config.adminCode, PERKS_ADMIN_SESSION_SECRET: config.adminSecret };
const accessServices = createAccessServices({ root, env, secure: false, origin, basePath });
const server = createServer(createHandler({ root, code: config.code, secret: config.secret, origin, basePath, secure: false, accessServices, creditsEnv: env }));
server.listen(port, '127.0.0.1', () => {
  console.log(`Local preview: ${origin}\nLocal access code: ${config.code}\nThis code is for this local preview only. No deployment has been made.`);
  console.log(`Local staff admin: ${origin}${basePath}/admin\nLocal staff code: ${config.adminCode}\nTest emails remain in the local admin inbox; no messages are sent.`);
});
