import { writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClaim } from '../src/supabase-claims.mjs';
import { validateOrigin, validateBasePath } from '../src/config.mjs';

const [userIdentifier, outputPath, ...extra] = process.argv.slice(2);
try {
  if (!userIdentifier || !outputPath || extra.length) throw new Error('Invalid arguments.');
  const environment = process.env.SUPABASE_PARTNER_ENVIRONMENT || 'staging';
  const origin = validateOrigin(process.env.APP_ORIGIN, { secure: process.env.SUPABASE_CLAIM_LOCAL_PREVIEW !== '1' });
  const basePath = validateBasePath(process.env.APP_BASE_PATH ?? '/perks');
  const destination = resolve(outputPath);
  const within = relative(fileURLToPath(new URL('../private/', import.meta.url)), destination);
  if (!within || within.startsWith('..') || within.startsWith('/') || !within.endsWith('.json')) throw new Error('Invalid output path.');
  const token = createClaim({ userIdentifier, environment, secret: process.env.SUPABASE_CLAIM_SECRET });
  // Fragment avoids placing the invitation in incoming request/access logs.
  const claimUrl = `${origin}${basePath}/supabase#${token}`;
  writeFileSync(destination, JSON.stringify({ claimUrl, environment, expiresInDays: 7 }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log('Created a private claim link valid for 7 days. Share only with the approved company. No code has been issued yet.');
} catch {
  console.error('Unable to create claim. Check APP_ORIGIN, APP_BASE_PATH, SUPABASE_CLAIM_SECRET and environment; use: npm run supabase:invite -- <approved-customer-id> <private/new-claim.json>.');
  process.exitCode = 1;
}
