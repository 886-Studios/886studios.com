import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { CATEGORIES, SORT_OPTIONS, matches, normalizeSort, sortPerks } from './catalog.mjs';
import { ACCESS_CODE_MAX } from './config.mjs';

const assetVersion = path => createHash('sha256').update(readFileSync(new URL(path, import.meta.url))).digest('hex').slice(0, 12);
const stylesVersion = assetVersion('../public/styles.css');
const scriptVersion = assetVersion('../public/app.js');

export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const lock = '<svg width="18" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const searchIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const paragraphs = text => text.split('\n').filter(Boolean).map(line => `<p>${escape(line)}</p>`).join('');
const link = (href, label, className = '') => `<a class="${className}" href="${escape(href)}"${href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(label)}${arrow}${href.startsWith('https:') ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a>`;
// Reuse the main site's public logo sharing image; never include private offers.
const sharingImage = 'https://www.886studios.com/assets/886-studios-preview.png';
const sharingImageAlt = 'Purple 886 Studios logo on a dark purple and blue background';

function page(body, { title = '886 Studios Exclusive Perks', basePath = '', referrerPolicy = 'same-origin' } = {}) {
  const description = 'Partner benefits for 886 Studios portfolio companies.';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex"><meta name="referrer" content="${escape(referrerPolicy)}"><meta name="theme-color" content="#050507"><meta name="description" content="${description}"><title>${escape(title)}</title>
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="886 Studios">
  <meta property="og:url" content="https://www.886studios.com/perks">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${sharingImage}">
  <meta property="og:image:secure_url" content="${sharingImage}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${sharingImageAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@886Studios">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${sharingImage}">
  <meta name="twitter:image:alt" content="${sharingImageAlt}">
  <link rel="icon" href="${basePath}/assets/favicon-32.png"><link rel="stylesheet" href="${basePath}/styles.css?v=${stylesVersion}"><link rel="preload" as="font" type="font/ttf" href="${basePath}/assets/fonts/geist-400.ttf" crossorigin><script src="${basePath}/app.js?v=${scriptVersion}" defer></script></head><body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header"><nav class="nav-inner" aria-label="Main navigation"><a class="brand" href="https://www.886studios.com" aria-label="886 Studios home"><img src="${basePath}/assets/886-logo.avif" width="384" height="384" alt="886 Studios"></a></nav></header>
  ${body}
  </body></html>`;
}

export function renderLogin({ error = '', ready = true, basePath = '' } = {}) {
  return page(`<main id="main-content" class="login-main"><div class="login-intro"><h1>886 Studios Exclusive Perks</h1></div><section class="login-panel" aria-labelledby="login-title"><div class="lock-tile">${lock}</div><h2 id="login-title">Welcome to your perks.</h2><p>Enter your portfolio access code to explore<br class="desktop-break"> partner offers and redemption details.</p><form action="${basePath}/login" method="post"><label for="access-code">Portfolio access code</label><div class="password-field"><input id="access-code" name="code" type="password" autocomplete="current-password" required maxlength="${ACCESS_CODE_MAX}" placeholder="Enter your access code" aria-describedby="login-message" ${error ? 'aria-invalid="true"' : ''}><button class="password-toggle" type="button" aria-label="Show access code" aria-pressed="false" data-password-toggle hidden><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg></button></div><p id="login-message" class="form-message" ${error ? 'role="alert"' : ''}>${escape(error || (!ready ? 'Portfolio access is being set up. Please contact the team.' : 'Your access code is case-sensitive.'))}</p><button class="button button-primary login-submit" type="submit" ${!ready ? 'disabled' : ''}>Explore your perks <span aria-hidden="true">→</span></button></form><div class="access-help">Need an access code? <a href="mailto:carter@886studios.com?subject=Portfolio%20perks%20access">Ask the 886 team ${arrow}</a></div></section></main>`, { basePath });
}

export function renderSupabaseClaim({ basePath = '', error = '', stagingCode = '', invitation = '' } = {}) {
  return page(`<main id="main-content" class="login-main"><div class="login-intro"><h1>Claim your Supabase perk</h1></div><section class="login-panel" aria-labelledby="claim-title"><img src="${basePath}/assets/logos/supabase.svg" alt="" width="44" height="44"><h2 id="claim-title">Your company’s invitation</h2>
  ${stagingCode ? `<p>Test code generated successfully. Staging codes cannot be redeemed.</p><div class="redemption-code"><code id="supabase-test-code">${escape(stagingCode)}</code><button type="button" data-copy="supabase-test-code" hidden>Copy</button></div>` : `<p>Use the private claim link sent to your approved email. Continue to generate your company’s code, then choose your organization in Supabase to redeem it.</p><form action="${basePath}/supabase" method="post" data-supabase-claim><div data-claim-code><label for="claim-token">Invitation code</label><div class="password-field"><input id="claim-token" name="claim" type="password" required maxlength="1200" autocomplete="off" spellcheck="false" value="${escape(invitation)}" aria-describedby="claim-message"></div></div><p id="claim-message" class="form-message" ${error ? 'role="alert"' : ''}>${escape(error || 'Your invitation is private and valid for seven days. You can also paste the code after # in your claim link.')}</p><button class="button button-primary login-submit" type="submit">Continue to Supabase <span aria-hidden="true">→</span></button></form>`}
  <div class="access-help"><a href="mailto:carter@886studios.com?subject=Supabase%20perk%20claim">Ask the 886 team for help ${arrow}</a></div></section></main>`, { basePath, title: 'Claim your Supabase perk | 886 Studios' });
}

export function renderClaimRequest({ basePath = '', message = '', error = '' } = {}) {
  return page(`<main id="main-content" class="login-main"><div class="login-intro"><h1>Claim your Supabase perk</h1></div><section class="login-panel" aria-labelledby="request-title"><h2 id="request-title">Send a link to your inbox</h2><p>Enter the email approved by the 886 team. We’ll email you a private link to claim your company’s credits. Any approved founder can start the claim. Each team can claim this offer once.</p>
    <form action="${basePath}/supabase/request" method="post"><label for="founder-email">Your email</label><div class="password-field"><input id="founder-email" name="email" type="email" autocomplete="email" maxlength="254" required></div><p class="form-message" role="${error ? 'alert' : 'status'}">${escape(error || message)}</p><button type="submit" class="button button-primary login-submit">Email my claim link</button></form>
    <div class="access-help"><a href="mailto:carter@886studios.com?subject=Supabase%20perk%20access">Need access? Contact the 886 team</a></div></section></main>`, { basePath, title: 'Request your Supabase perk | 886 Studios' });
}

export function renderPerksAdmin({ basePath = '', authenticated = false, ready = true, approvals = [], teams = [], messages = [], local = false, notice = '', error = '' } = {}) {
  if (!authenticated) return page(`<main id="main-content" class="login-main"><div class="login-intro"><h1>Perks administration</h1></div><section class="login-panel"><h2>Staff access</h2><p>Sign in to manage approved founder emails.</p><form action="${basePath}/admin/login" method="post"><label for="admin-code">Staff access code</label><div class="password-field"><input id="admin-code" type="password" name="code" autocomplete="current-password" maxlength="256" required></div><p class="form-message" role="alert">${escape(error || (!ready ? 'Staff access is not configured yet.' : ''))}</p><button class="button button-primary login-submit" ${ready ? '' : 'disabled'}>Sign in</button></form></section></main>`, { basePath, title: 'Perks administration | 886 Studios' });
  const groups = new Map();
  for (const entry of approvals) {
    if (!groups.has(entry.teamId)) groups.set(entry.teamId, { id: entry.teamId, name: entry.teamName, approvals: [] });
    groups.get(entry.teamId).approvals.push(entry);
  }
  const companies = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  for (const company of companies) company.approvals.sort((a, b) => a.email.localeCompare(b.email, 'en', { sensitivity: 'base' }));
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  return page(`<main id="main-content" class="directory-main admin-main"><div class="admin-heading"><h1>Approved founder emails</h1><form action="${basePath}/admin/logout" method="post"><button class="button button-subtle">Sign out</button></form></div><p class="admin-intro">Approve eligible founder emails under their company. The first founder to continue from their private claim link locks the team’s single benefit. Revoking access does not reset that claim.</p>
    ${local ? '<p class="admin-notice">Local preview: emails stay in the test inbox below. Nothing is sent externally.</p>' : ''}
    <p class="form-message" role="${error ? 'alert' : 'status'}">${escape(error || notice)}</p>
    <form class="admin-add" action="${basePath}/admin/approve" method="post"><label for="approved-team">Team</label><select id="approved-team" name="team" required><option value="">Select a team</option>${sortedTeams.map(team => `<option value="${escape(team.id)}">${escape(team.name)}${team.claimant ? ' — claim started' : ''}</option>`).join('')}</select><label for="approved-email">Founder email</label><div class="password-field"><input id="approved-email" name="email" type="email" autocomplete="off" maxlength="254" required placeholder="founder@company.com"></div><button class="button button-primary">Approve email</button></form>
    <section aria-labelledby="approved-heading"><h2 id="approved-heading">${approvals.length} approved ${approvals.length === 1 ? 'email' : 'emails'}</h2>${companies.length ? companies.map((company, index) => `<div class="admin-company"><h3 id="approved-company-${index}">${escape(company.name)}<span>${company.approvals.length} ${company.approvals.length === 1 ? 'founder' : 'founders'}</span></h3><ul class="admin-list" aria-labelledby="approved-company-${index}">${company.approvals.map(entry => `<li><span>${escape(entry.email)}</span><form action="${basePath}/admin/revoke" method="post"><input type="hidden" name="email" value="${escape(entry.email)}"><button class="button button-subtle" aria-label="Revoke access for ${escape(entry.email)}">Revoke access</button></form></li>`).join('')}</ul></div>`).join('') : '<p>No emails approved yet.</p>'}</section>
    ${teams.some(team => team.claimant) ? `<section aria-labelledby="claims-heading"><h2 id="claims-heading">Claims started</h2><ul class="admin-list">${teams.filter(team => team.claimant).map(team => `<li><span><strong>${escape(team.name)}</strong><br>${escape(team.claimant.email)}</span><span>Reserved for this founder</span></li>`).join('')}</ul></section>` : ''}
    ${local ? `<section aria-labelledby="outbox-heading"><h2 id="outbox-heading">Local test inbox</h2><p>Only staff can see these test messages.</p>${messages.length ? `<ul class="admin-list">${messages.map(message => `<li><span>${escape(message.email)}</span><a class="button button-subtle" href="${escape(message.claimUrl)}">Open test claim link</a></li>`).join('')}</ul>` : '<p>No test emails yet.</p>'}</section>` : ''}
    <a class="button button-subtle" href="${basePath || '/'}">Back to perks</a></main>`, { basePath, title: 'Perks administration | 886 Studios' });
}

function row(perk, query, category, basePath, ranks) {
  const searchable = [perk.name, perk.category, perk.headline, perk.description, perk.about, perk.offer, perk.eligibility].join(' ').toLowerCase();
  return `<details class="perk-row" id="${perk.id}" data-perk data-category="${escape(perk.category)}" data-search="${escape(searchable)}" data-sort-category="${ranks.category.get(perk.id)}" data-sort-alphabetical="${ranks.alphabetical.get(perk.id)}" ${matches(perk, query, category) ? '' : 'hidden'}>
    <summary>
      <span class="partner"><span class="partner-logo">${perk.logo ? `<img src="${basePath}${perk.logo}" alt="" width="40" height="40" loading="lazy">` : `<span class="wordmark wordmark-${perk.id}" aria-hidden="true">${escape(perk.name === 'Beyond Border' ? 'BB' : perk.name === 'Goodwin' ? 'G' : perk.name)}</span>`}</span><span class="partner-name">${escape(perk.name)}</span></span>
      <span class="benefit"><span class="benefit-title">${escape(perk.headline)}</span><span class="benefit-description">${escape(perk.description)}</span></span>
      <span class="perk-type"><span class="mobile-field-label">Type</span><span>${escape(perk.category)}</span></span>
      <span class="view-perk"><span class="closed-label">View perk</span><span class="open-label">Close details</span><svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </summary>
    <div class="perk-detail">
      <div class="detail-about"><h3>About ${escape(perk.name)}</h3><div class="detail-copy">${paragraphs(perk.about)}</div></div>
      <div class="detail-offer"><h3>Perk</h3><div class="detail-copy">${paragraphs(perk.offer)}${perk.pending ? '<p class="pending-note">Availability and terms are awaiting confirmation.</p>' : ''}</div></div>
      <div class="detail-eligibility"><h3>Eligibility</h3><div class="detail-copy">${paragraphs(perk.eligibility || 'For 886 Studios companies. The partner will confirm your eligibility and current terms.')}</div></div>
      <div class="detail-redemption"><h3>How to redeem</h3><div class="detail-copy">${paragraphs(perk.instructions)}${perk.code ? `<div class="redemption-code"><span>Organization ID</span><code id="code-${perk.id}">${escape(perk.code)}</code><button type="button" data-copy="code-${perk.id}" hidden>Copy</button></div><p class="small-note">For eligible portfolio companies only. Keep this ID within your company.</p>` : ''}<div class="redemption-actions">${link(perk.id === 'supabase' ? `${basePath}/supabase/request` : perk.href, perk.id === 'supabase' ? 'Claim credits' : perk.action, 'button button-primary redeem-link')}${perk.links.length ? `<div class="secondary-links">${perk.links.map(item => link(item.href, item.label)).join('')}</div>` : ''}</div></div></div>
    </div>
  </details>`;
}

export function renderDirectory(catalog, { query = '', category = '', sort = 'alphabetical', basePath = '' } = {}) {
  sort = normalizeSort(sort);
  const orders = Object.fromEntries(SORT_OPTIONS.map(option => [option.value, sortPerks(catalog.perks, option.value)]));
  const ranks = Object.fromEntries(SORT_OPTIONS.map(option => [option.value, new Map(orders[option.value].map((perk, index) => [perk.id, index]))]));
  const resetHref = `${basePath || '/'}${sort === 'category' ? '?sort=category' : ''}`;
  const count = catalog.perks.filter(perk => matches(perk, query, category)).length;
  return page(`<main id="main-content" class="directory-main"><section class="hero" aria-labelledby="page-title"><div><h1 id="page-title">886 Studios Exclusive Perks</h1></div></section>
  <section class="directory" aria-label="Partner perks"><form class="filter-form" action="${basePath || '/'}" method="get" role="search">
    <div class="search-row">
      <div class="search-field">${searchIcon}<label class="sr-only" for="perk-search">Search partners or perks</label><input id="perk-search" name="q" type="search" placeholder="Search partners or perks" autocomplete="off" value="${escape(query)}"></div>
      <fieldset class="sort-toggle"><legend class="sr-only">Sort by</legend>${SORT_OPTIONS.map(option => `<label class="sort-option"><input type="radio" name="sort" value="${option.value}" aria-label="${option.label}"${sort === option.value ? ' checked' : ''}><span>${option.value === 'alphabetical' ? 'A–Z' : option.label}</span></label>`).join('')}</fieldset>
      <button type="submit" name="category" value="${escape(category)}" class="button button-subtle filter-submit">Search</button>
    </div>
    <div class="filters" role="group" aria-label="Filter by type">${['', ...CATEGORIES].map(item => `<button type="submit" name="category" value="${escape(item)}" class="filter ${item === category ? 'is-active' : ''}" aria-pressed="${item === category}" data-filter="${escape(item)}">${escape(item || 'All perks')}</button>`).join('')}</div>
    <p class="result-count" id="result-count" role="status" aria-live="polite">${count} ${count === 1 ? 'partner' : 'partners'}</p>
  </form><div class="list-header" aria-hidden="true"><span>Partner</span><span>Type</span><span>Perk</span></div><div class="perk-list">${orders[sort].map(perk => row(perk, query, category, basePath, ranks)).join('')}</div><div class="empty-state" ${count ? 'hidden' : ''}><h2>No perks found.</h2><p>Try another partner, benefit, or category.</p><a class="button button-subtle" href="${escape(resetHref)}" data-reset>Clear filters</a></div></section>
  <div class="directory-footer"><p class="directory-note">For ikigai Launchpad and Launch Station teams only. Please keep partner links and codes within your company. Offers are subject to partner eligibility and approval.</p><p class="perk-request">Have any products &amp; services you use but that's not on this list? Contact Carter or Patryk and we'll try to get them for you!</p></div></main>`, { basePath });
}
