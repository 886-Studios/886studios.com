import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../src/catalog.mjs';

// The negotiated offer remains in ignored data, alongside the private catalog.
// This updater can apply that offer to the exact production catalog when restored.
const catalogPath = fileURLToPath(new URL('../private/catalog.json', import.meta.url));
const offerPath = new URL('../private/supabase-offer.json', import.meta.url);
const temporary = `${catalogPath}.supabase-${process.pid}.tmp`;
try {
  const catalog = loadCatalog(catalogPath);
  const offer = JSON.parse(readFileSync(offerPath, 'utf8'));
  if (offer.id !== 'supabase' || offer.logo !== '/assets/logos/supabase.svg') throw new Error('Invalid Supabase offer.');
  const existing = catalog.perks.findIndex(perk => perk.id === 'supabase');
  if (existing < 0) catalog.perks.push(offer);
  else catalog.perks[existing] = offer;
  writeFileSync(temporary, JSON.stringify(catalog, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  loadCatalog(temporary);
  renameSync(temporary, catalogPath);
  console.log('Updated the private Supabase offer; all other catalog entries were preserved.');
} catch {
  try { unlinkSync(temporary); } catch { /* No temporary output to remove. */ }
  console.error('Unable to update Supabase. Supply valid private/catalog.json and private/supabase-offer.json.');
  process.exitCode = 1;
}
