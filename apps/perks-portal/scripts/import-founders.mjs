import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLocalEmailStore, createRedisEmailStore } from '../src/approved-emails.mjs';
import { importFounders } from '../src/founder-import.mjs';

try {
  const [file, target, action, ...extra] = process.argv.slice(2);
  if (!file || !['--local', '--redis'].includes(target) || !['--check', '--apply'].includes(action) || extra.length) throw new Error('arguments');
  const root = fileURLToPath(new URL('../private/', import.meta.url));
  const within = relative(root, resolve(file));
  if (!within || within.startsWith('..') || within.startsWith('/') || !within.endsWith('.json')) throw new Error('private file required');
  const store = target === '--local' ? createLocalEmailStore(resolve(root, 'approved-emails.json')) : createRedisEmailStore(process.env);
  const result = await importFounders(store, JSON.parse(readFileSync(resolve(file), 'utf8')), { apply: action === '--apply' });
  console.log(`${result.applied ? 'Imported' : 'Validated'} ${result.emails} founder emails across ${result.teams} teams in ${target === '--local' ? 'local preview' : (process.env.SUPABASE_PARTNER_ENVIRONMENT || 'staging')}. No emails sent.`);
} catch {
  console.error('Import stopped. Check the private roster and existing team assignments. Usage: npm run founders:import -- private/founder-roster.json <--local|--redis> <--check|--apply>. Re-running the same roster is safe; never assign a new ID to an existing team.');
  process.exitCode = 1;
}
