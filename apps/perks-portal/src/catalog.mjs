import { readFileSync } from 'node:fs';

export const CATEGORIES = ['Engineering', 'Productivity', 'Finance & legal', 'Marketing', 'Design'];
export const SORT_OPTIONS = [{ value: 'category', label: 'Category' }, { value: 'alphabetical', label: 'Alphabetical (A–Z)' }];
export const normalizeSort = value => value === 'category' ? value : 'alphabetical';

export function sortPerks(perks, order = 'alphabetical') {
  const byCategory = normalizeSort(order) === 'category';
  return [...perks].sort((a, b) => {
    const categoryOrder = byCategory ? CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) : 0;
    return categoryOrder || a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }) || a.id.localeCompare(b.id, 'en');
  });
}

export function loadCatalog(path) {
  const catalog = JSON.parse(readFileSync(path, 'utf8'));
  const ids = new Set();
  if (!Array.isArray(catalog.perks) || !catalog.perks.length) throw new Error('The private perk catalog is missing or empty.');
  for (const perk of catalog.perks) {
    if (!/^[a-z0-9-]+$/.test(perk.id) || ids.has(perk.id)) throw new Error('Invalid or duplicate perk ID.');
    ids.add(perk.id);
    if (!CATEGORIES.includes(perk.category)) throw new Error(`Invalid category: ${perk.id}`);
    for (const field of ['name', 'headline', 'description', 'about', 'aboutSource', 'offer', 'instructions', 'href', 'source', 'action']) {
      if (typeof perk[field] !== 'string' || !perk[field]) throw new Error(`Missing ${field}: ${perk.id}`);
    }
    for (const href of [perk.href, ...perk.links.map(link => link.href)]) {
      if (!['https:', 'mailto:'].includes(new URL(href).protocol)) throw new Error(`Unsafe link: ${perk.id}`);
    }
    if (new URL(perk.aboutSource).protocol !== 'https:') throw new Error(`Unsafe about source: ${perk.id}`);
    if (perk.logo && !/^\/assets\/logos\/[a-z0-9.-]+$/.test(perk.logo)) throw new Error('Invalid logo path.');
  }
  return catalog;
}

export function matches(perk, query = '', category = '') {
  const text = [perk.name, perk.category, perk.headline, perk.description, perk.about, perk.offer, perk.eligibility].join(' ').toLowerCase();
  return (!category || category === perk.category) && query.toLowerCase().split(/\s+/).every(word => text.includes(word));
}
