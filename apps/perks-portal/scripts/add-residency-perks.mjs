import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../src/catalog.mjs';

// Apply only the six reviewed offers to the authoritative private catalog.
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
  const aws = existing('aws');
  const foundersMarker = '\n\nPublic Founders alternative:';
  aws.instructions = aws.instructions.split(foundersMarker)[0] + foundersMarker + ' Self-funded teams can apply directly for $1,000 in AWS credits; selected participants may receive up to $5,000. Choose Founders, with no partner Org ID. Applicants must be founded within the past 10 years, before Series B, on AWS Paid Tier, and new to Activate or requesting more credits than previously received. The provider offer above is separate; its Org ID is not approved for general Residency distribution.';
  const foundersHref = 'https://aws.amazon.com/startups/credits/';
  aws.links = [...aws.links.filter(link => link.href !== foundersHref), { label: 'Apply to public AWS Founders', href: foundersHref }];
  aws.reviewedAt = reviewedAt;
  // Preserve the provider package's existing applicability; only the public tier is shared with Residency.
  const additions = [
    {
      id: 'posthog', name: 'PostHog', category: 'Engineering',
      headline: '$50,000 in credits for 12 months',
      description: 'Product analytics and developer tools for startups.',
      about: 'PostHog combines product analytics, session replay, feature flags, experiments and other developer tools. Teams can use it to understand product usage, test changes and investigate user experiences.',
      aboutSource: 'https://posthog.com/', aboutReviewedAt: reviewedAt,
      offer: '$50,000 in PostHog credits, valid for 12 months after approval.',
      eligibility: 'Startups under two years old with less than $5M raised, a company-domain email and a PostHog account created on or after January 1, 2023. One grant per founder and company; an ineligible parent company cannot qualify through a new subsidiary. Approval is discretionary.',
      instructions: 'Apply directly to the public startup program. Add a payment method and use a paid plan to apply credits. AI products, BAA fees and paid services are excluded; charges apply outside the credit allowance. No 886 referral code is required.',
      href: 'https://app.posthog.com/startups', action: 'Apply',
      links: [{ label: 'Program terms', href: 'https://posthog.com/startups' }],
      source: 'https://www.notion.so/424b93834d6981d082b8e4d86bf7cb8e',
      programs, logo: '/assets/logos/posthog.svg', pending: false, reviewedAt,
    },
    {
      id: 'microsoft', name: 'Microsoft for Startups', category: 'Engineering',
      headline: 'Azure startup credits',
      description: 'Azure credits and resources for software startups.',
      about: 'Microsoft for Startups offers Azure cloud resources and support for building software businesses. Azure provides infrastructure, databases, developer services and AI tools for running applications.',
      aboutSource: 'https://www.microsoft.com/en/startups', aboutReviewedAt: reviewedAt,
      offer: '$200 in starter Azure credits through the no-referral path. Expanded benefits are subject to Microsoft approval.',
      eligibility: 'Privately held, for-profit software startups before Series C, based where Azure is available, with no more than $350,000 in prior free Azure credits. Educational institutions, government entities, agencies, consultancies and crypto mining businesses are excluded.',
      instructions: 'Apply directly through the Azure startup portal without an investor referral code. Complete business verification for expanded benefits. Azure charges apply after credits expire or run out.',
      href: 'https://portal.azure.com/?homeview=startup', action: 'Apply',
      links: [{ label: 'Eligibility and application', href: 'https://learn.microsoft.com/en-us/startups/microsoft-for-startups/application' }],
      source: 'https://www.notion.so/424b93834d6981ecb8c3d3fc67b32a28',
      programs, logo: '/assets/logos/microsoft.png', pending: false, reviewedAt,
    },
  ];
  for (const offer of additions) {
    const index = catalog.perks.findIndex(perk => perk.id === offer.id);
    if (index < 0) catalog.perks.push(offer);
    else catalog.perks[index] = { ...catalog.perks[index], ...offer };
  }
  writeFileSync(temporary, JSON.stringify(catalog, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  loadCatalog(temporary);
  if (readFileSync(catalogPath, 'utf8') === readFileSync(temporary, 'utf8')) unlinkSync(temporary);
  else renameSync(temporary, catalogPath);
  console.log(`Updated six reviewed offers; catalog contains ${catalog.perks.length} entries.`);
} catch (error) {
  try { unlinkSync(temporary); } catch { /* No temporary output to remove. */ }
  console.error(`Unable to update Residency offers: ${error.message}`);
  process.exitCode = 1;
}
