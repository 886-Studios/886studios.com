import { normalizeEmail, teamRecord, ApprovalConflict } from './approved-emails.mjs';

// Reviewed private roster, never a raw export of applications or arbitrary emails.
export function validateRoster(input) {
  if (!Array.isArray(input.teams) || !input.teams.length) throw new Error('Roster must contain teams.');
  const ids = new Set(), emails = new Set(), names = new Set();
  return input.teams.map(row => {
    const team = teamRecord(row);
    const addresses = row.emails ?? (row.email ? [row.email] : []);
    if (!Array.isArray(addresses) || !addresses.length || addresses.length > 50) throw new Error('Provide between one and 50 founder emails per team.');
    const normalized = addresses.map(normalizeEmail);
    const name = team.name.toLowerCase();
    if (ids.has(team.id) || names.has(name)) throw new Error('Duplicate team or founder in roster.');
    for (const email of normalized) {
      if (emails.has(email)) throw new Error('Duplicate team or founder in roster.');
      emails.add(email);
    }
    ids.add(team.id); names.add(name);
    return { ...team, emails: normalized };
  });
}

export async function importFounders(store, input, { apply = false } = {}) {
  const rows = validateRoster(input), existing = await store.teams();
  // Check every row before making changes; store-level atomic checks handle races.
  for (const row of rows) {
    if (existing.some(team => team.name.toLowerCase() === row.name.toLowerCase() && team.id !== row.id)) {
      throw new ApprovalConflict('Roster conflicts with an existing team. Keep its original ID.');
    }
    for (const email of row.emails) {
      const approval = await store.get(email);
      if (approval && approval.teamId !== row.id) throw new ApprovalConflict('Roster conflicts with an existing email assignment.');
    }
  }
  if (apply) for (const row of rows) {
    await store.registerTeam(row);
    for (const email of row.emails) await store.approve(email, row.id);
  }
  return { teams: rows.length, emails: rows.reduce((sum, row) => sum + row.emails.length, 0), applied: apply };
}
