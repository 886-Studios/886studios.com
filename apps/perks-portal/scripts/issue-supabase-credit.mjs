import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { issueSupabaseCredit, SupabaseCreditsError } from '../src/supabase-credits.mjs';

// Staff-only tool. Verify eligibility first and always reuse the same identifier.
// The result goes into an ignored private file, never stdout or build output.
const [userIdentifier, outputPath, ...extra] = process.argv.slice(2);
const privateRoot = fileURLToPath(new URL('../private/', import.meta.url));
try {
  if (!userIdentifier || !outputPath || extra.length) throw new Error('Usage: npm run supabase:issue -- <approved-customer-id> <private/result.json>');
  const destination = resolve(outputPath);
  const within = relative(privateRoot, destination);
  if (!within || within.startsWith('..') || within.startsWith('/') || !within.endsWith('.json')) throw new Error('Save the result in the ignored private directory as a new JSON file.');
  mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
  // Reserve the destination before issuing a code; never overwrite a previous result.
  writeFileSync(destination, JSON.stringify({ status: 'pending' }) + '\n', { flag: 'wx', mode: 0o600 });
  const result = await issueSupabaseCredit({ userIdentifier });
  writeFileSync(destination, JSON.stringify({ ...result, issuedAt: new Date().toISOString() }, null, 2) + '\n', { mode: 0o600 });
  console.log(`Supabase ${result.environment} issuance succeeded. Result saved privately.${result.redemptionUrl ? '' : ' Staging codes cannot be redeemed.'}`);
} catch (error) {
  console.error(error instanceof SupabaseCreditsError ? error.message : 'Unable to issue a code. Check arguments and use a new output file inside private/.');
  process.exitCode = 1;
}
