import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../src/catalog.mjs';

// Apply only the three confirmed partner offers to the authoritative private catalog.
// Existing partner URLs, codes, catalog metadata and unrelated records stay intact.
const catalogPath = fileURLToPath(new URL('../private/catalog.json', import.meta.url));
const temporary = `${catalogPath}.residency-${process.pid}.tmp`;
const reviewedAt = '2026-11-26';
try {
  const catalog = loadCatalog(catalogPath);
  const existing = id => {
    const perk = catalog.perks.find(perk => perk.id === id);
    if (!perk) throw new Error(`Missing existing offer: ${id}`);
    return perk;
  };
  const programs = ['ikigai Launchpad', 'Launch Station'];
  Object.assign(existing('linear'), {
    offer: '3 months of Linear Business free',
    eligibility: 'Eligible members of the 886 Studios community with fewer than 50 employees. The workspace must never have had a paid plan. One offer per workspace; an admin must redeem it.',
    instructions: 'Open the 886 Studios partner application, sign in as a workspace admin, and apply the offer to an eligible workspace. Linear confirms final eligibility.',
    programs, reviewedAt,
  });
  Object.assign(existing('docsend'), {
    headline: 'Up to 90% off your first year',
    offer: 'Up to 90% off the first year of an annual DocSend plan',
    eligibility: 'New customers only; one offer per startup. Pre-seed and seed teams with up to $2M raised: 90% off Standard or Advanced. Series A up to $10M: 50% off Advanced. Series B and beyond up to $20M: 20% off Advanced.',
    instructions: 'Apply through the 886 Studios partner form with your company and funding details. The approved discount depends on your funding stage and annual plan.',
    programs, reviewedAt,
  });
  Object.assign(existing('mercury'), {
    headline: 'Up to $1,100 in cash bonuses',
    offer: '$1,000 after depositing $100,000 within 90 days of account approval, plus $100 after spending $1,000 on Mercury debit or credit cards within 90 days. Terms apply.',
    eligibility: 'Companies registered in the U.S. or a U.S. territory with existing or planned U.S. operations. Non-U.S. founders can apply, subject to country restrictions and account approval. Company formation documents, an EIN and owner identification are required.',
    instructions: 'Apply using the 886 Studios partner link. After approval, meet the deposit and card-spend milestones within the first 90 days. The current offer does not advertise a separate account-opening bonus.',
    programs, reviewedAt,
  });
  // Remove only the public programs introduced on November 26; these are not 886 partnerships.
  catalog.perks = catalog.perks.filter(perk => !['posthog', 'microsoft'].includes(perk.id));
  const aws = existing('aws');
  aws.instructions = aws.instructions.split('\n\nPublic Founders alternative:')[0];
  aws.links = aws.links.filter(link => link.label !== 'Apply to public AWS Founders');
  writeFileSync(temporary, JSON.stringify(catalog, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  loadCatalog(temporary);
  if (readFileSync(catalogPath, 'utf8') === readFileSync(temporary, 'utf8')) unlinkSync(temporary);
  else renameSync(temporary, catalogPath);
  console.log(`Updated confirmed partner offers; removed non-partner public programs; catalog contains ${catalog.perks.length} entries.`);
} catch (error) {
  try { unlinkSync(temporary); } catch { /* No temporary output to remove. */ }
  console.error(`Unable to update Residency offers: ${error.message}`);
  process.exitCode = 1;
}
