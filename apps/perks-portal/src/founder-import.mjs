import { normalizeEmail, teamRecord, ApprovalConflict } from './approved-emails.mjs';

// Reviewed private roster, never a raw export of applications or arbitrary emails.
export function validateRoster(input) {
  if (!Array.isArray(input.teams) || !input.teams.length) throw new Error('Roster must contain teams.');
  const ids = new Set(), emails = new Set(), names = new Set();
  return input.teams.map(row => {
    const team = teamRecord(row), email = normalizeEmail(row.email);
    const name = team.name.toLowerCase();
    if (ids.has(team.id) || emails.has(email) || names.has(name)) throw new Error('Duplicate team or founder in roster.');
    ids.add(team.id); emails.add(email); names.add(name);
    return { ...team, email };
  });
}

export async function importFounders(store, input, { apply = false } = {}) {
  const rows = validateRoster(input), existing = await store.teams();
  // Check every row before making changes; store-level atomic checks handle races.
  for (const row of rows) {
    const team = existing.find(team => team.id === row.id);
    const emailApproval = await store.get(row.email);
    if ((team?.approval && team.approval.email !== row.email) ||
        (emailApproval && emailApproval.teamId !== row.id) ||
        existing.some(team => team.name.toLowerCase() === row.name.toLowerCase() && team.id !== row.id)) {
      throw new ApprovalConflict('Roster conflicts with existing approvals. Review the team mapping; do not create another entitlement.');
    }
  }
  if (apply) for (const row of rows) {
    await store.registerTeam(row);
    await store.approve(row.email, row.id);
  }
  return { teams: rows.length, applied: apply };
}
