import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../src/catalog.mjs';

// Keep the partner offer in ignored data, and preserve every other catalog entry.
const catalogPath = fileURLToPath(new URL('../private/catalog.json', import.meta.url));
const offerPath = new URL('../private/granola-offer.json', import.meta.url);
const temporary = `${catalogPath}.granola-${process.pid}.tmp`;
try {
  const catalog = loadCatalog(catalogPath);
  const offer = JSON.parse(readFileSync(offerPath, 'utf8'));
  if (offer.id !== 'granola' || offer.logo !== '/assets/logos/granola.png') throw new Error('Invalid Granola offer.');
  const existing = catalog.perks.findIndex(perk => perk.id === 'granola');
  if (existing < 0) catalog.perks.push(offer);
  else catalog.perks[existing] = offer;
  writeFileSync(temporary, JSON.stringify(catalog, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  loadCatalog(temporary);
  renameSync(temporary, catalogPath);
  console.log('Updated the private Granola offer; all other catalog entries were preserved.');
} catch {
  try { unlinkSync(temporary); } catch { /* No temporary output to remove. */ }
  console.error('Unable to update Granola. Supply valid private/catalog.json and private/granola-offer.json.');
  process.exitCode = 1;
}
