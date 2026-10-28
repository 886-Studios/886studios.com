import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';

export function normalizeEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email) ||
      email.split('@')[0].length > 64 || email.startsWith('.') || email.includes('..') || email.includes('.@')) {
    throw new Error('Enter a valid email address.');
  }
  return email;
}

export const emailKey = email => createHash('sha256').update(normalizeEmail(email)).digest('hex');
export class ApprovalConflict extends Error {}
const teamNameKey = name => name.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();
const duplicateTeam = 'A team with this name already exists. Add the founder to that team instead.';
export function normalizeTeamId(value) {
  const id = String(value ?? '').toLowerCase().replaceAll('-', '');
  if (!/^[a-f0-9]{32}$/.test(id)) throw new ApprovalConflict('Select a registered team.');
  return id;
}
export function teamRecord({ id, name }) {
  id = normalizeTeamId(id);
  if (typeof name !== 'string' || !name.trim() || name.length > 160 || /[\x00-\x1f]/.test(name)) throw new ApprovalConflict('Enter a valid team name.');
  return { id, name: name.trim(), nameKey: teamNameKey(name), userIdentifier: `886-team:${id}` };
}
const newApproval = (email, team) => ({ email: normalizeEmail(email), teamId: team.id, teamName: team.name,
  userIdentifier: team.userIdentifier, version: randomUUID(), approvedAt: new Date().toISOString() });
const sortTeams = teams => teams.sort((a, b) => a.name.localeCompare(b.name));
const approvalList = teams => sortTeams(teams).flatMap(team => Object.values(team.approvals ?? {}).sort((a, b) => a.email.localeCompare(b.email)));
function migrateTeam(team) {
  team.approvals ??= {};
  if (team.approval) { team.approvals[team.approval.email] ??= team.approval; delete team.approval; }
  return team;
}
const conflict = 'This email belongs to another team. Review the company mapping before approving it.';

// Single-process, loopback development only. Never use ephemeral function storage in production.
export function createLocalEmailStore(path, { now = Date.now } = {}) {
  const read = () => {
    const data = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { limits: {} };
    // Legacy email-only approvals are deliberately not valid team approvals.
    data.teams ??= {}; data.emailTeams ??= {}; data.limits ??= {};
    for (const team of Object.values(data.teams)) migrateTeam(team);
    return data;
  };
  const write = data => {
    const temporary = `${path}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
    renameSync(temporary, path);
  };
  return {
    async teams() { return sortTeams(Object.values(read().teams)); },
    async createTeam({ name, email }) {
      const team = teamRecord({ id: randomUUID(), name }), approval = newApproval(email, team), data = read();
      if (Object.values(data.teams).some(existing => teamNameKey(existing.name) === team.nameKey)) throw new ApprovalConflict(duplicateTeam);
      const key = emailKey(email);
      if (data.emailTeams[key]) throw new ApprovalConflict(conflict);
      data.teams[team.id] = { ...team, approvals: { [approval.email]: approval } };
      data.emailTeams[key] = team.id;
      write(data); return data.teams[team.id];
    },
    async registerTeam(value) {
      const team = teamRecord(value), data = read();
      data.teams[team.id] ??= { ...team, approvals: {} };
      const existing = data.teams[team.id];
      existing.name = team.name;
      existing.nameKey = team.nameKey;
      for (const approval of Object.values(existing.approvals)) approval.teamName = team.name;
      write(data); return existing;
    },
    async list() { return approvalList(Object.values(read().teams)); },
    async get(email) {
      const data = read(), key = emailKey(email), approval = data.teams[data.emailTeams[key]]?.approvals[normalizeEmail(email)];
      return approval?.email === normalizeEmail(email) ? approval : null;
    },
    async approve(email, teamId) {
      const data = read(), key = emailKey(email), id = normalizeTeamId(teamId), team = data.teams[id];
      if (!team) throw new ApprovalConflict('Select a registered team.');
      if (data.emailTeams[key] && data.emailTeams[key] !== id) throw new ApprovalConflict(conflict);
      team.approvals[normalizeEmail(email)] ??= newApproval(email, team);
      data.emailTeams[key] = id; write(data); return team.approvals[normalizeEmail(email)];
    },
    async revoke(email) {
      const data = read(), team = data.teams[data.emailTeams[emailKey(email)]];
      if (team) delete team.approvals[normalizeEmail(email)];
      // Retain the team identity and historical email binding permanently.
      write(data);
    },
    async reserveClaim(claim) {
      const data = read(), key = emailKey(claim.email), team = data.teams[data.emailTeams[key]], approval = team?.approvals[normalizeEmail(claim.email)];
      if (!approval || approval.version !== claim.approvalVersion || team.userIdentifier !== claim.userIdentifier) return 'invalid';
      if (team.claimant && team.claimant.emailKey !== key) return 'claimed';
      team.claimant ??= { emailKey: key, email: approval.email, reservedAt: new Date(now()).toISOString() };
      write(data); return 'allowed';
    },
    async consume(key, limit, seconds) {
      const data = read(), time = now();
      for (const [k, entry] of Object.entries(data.limits)) if (entry.until <= time) delete data.limits[k];
      const entry = data.limits[key] ?? { count: 0, until: time + seconds * 1000 };
      entry.count++;
      data.limits[key] = entry;
      write(data);
      return entry.count <= limit;
    },
  };
}

export function createRedisEmailStore(env, { fetchImpl = fetch } = {}) {
  const url = new URL(env.UPSTASH_REDIS_REST_URL);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.upstash.io') || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash || !env.UPSTASH_REDIS_REST_TOKEN) throw new Error('Approved email storage is not configured.');
  const environment = env.SUPABASE_PARTNER_ENVIRONMENT || 'staging';
  if (!['staging', 'production'].includes(environment)) throw new Error('Invalid credit environment.');
  const prefix = `886:perks:${environment}:`;
  const teams = `${prefix}teams`;
  const emails = `${prefix}team-emails`;
  async function command(args) {
    try {
      const response = await fetchImpl(url.origin, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
        headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.error || !Object.hasOwn(data, 'result')) throw new Error();
      return data.result;
    } catch { throw new Error('Approved email storage is temporarily unavailable.'); }
  }
  return {
    async teams() { return sortTeams((await command(['HVALS', teams])).map(value => migrateTeam(JSON.parse(value)))); },
    async createTeam({ name, email }) {
      const team = teamRecord({ id: randomUUID(), name }), approval = newApproval(email, team);
      // Legacy records have no normalized name key. Check them before the atomic
      // insert; all newly created/registered records carry a key for race checks.
      if ((await this.teams()).some(existing => teamNameKey(existing.name) === team.nameKey)) throw new ApprovalConflict(duplicateTeam);
      const value = { ...team, approvals: { [approval.email]: approval } };
      const result = await command(['EVAL', CREATE_TEAM, 2, teams, emails, team.id, emailKey(email), JSON.stringify(value)]);
      if (result === 'duplicate') throw new ApprovalConflict(duplicateTeam);
      if (result === 'conflict') throw new ApprovalConflict(conflict);
      if (result === 'collision') throw new ApprovalConflict('Could not create the team. Please try again.');
      return JSON.parse(result);
    },
    async registerTeam(value) {
      const team = teamRecord(value);
      return migrateTeam(JSON.parse(await command(['EVAL', REGISTER_TEAM, 1, teams, team.id, JSON.stringify(team)])));
    },
    async list() { return approvalList(await this.teams()); },
    async get(email) {
      const id = await command(['HGET', emails, emailKey(email)]);
      if (!id) return null;
      const value = await command(['HGET', teams, id]);
      const approval = value ? migrateTeam(JSON.parse(value)).approvals[normalizeEmail(email)] : null;
      return approval?.email === normalizeEmail(email) ? approval : null;
    },
    async approve(email, teamId) {
      const id = normalizeTeamId(teamId), normalized = normalizeEmail(email);
      // All checks and writes execute atomically across serverless instances.
      const result = await command(['EVAL', APPROVE_TEAM, 2, teams, emails, id, emailKey(email), normalized, randomUUID(), new Date().toISOString()]);
      if (result === 'missing') throw new ApprovalConflict('Select a registered team.');
      if (result === 'conflict') throw new ApprovalConflict(conflict);
      return JSON.parse(result);
    },
    async revoke(email) { await command(['EVAL', REVOKE_TEAM, 2, teams, emails, emailKey(email), normalizeEmail(email)]); },
    async reserveClaim(claim) {
      const result = await command(['EVAL', RESERVE_CLAIM, 2, teams, emails, emailKey(claim.email), claim.approvalVersion, claim.userIdentifier, new Date().toISOString(), normalizeEmail(claim.email)]);
      if (!['invalid', 'claimed', 'allowed'].includes(result)) throw new Error('Invalid storage response.');
      return result;
    },
    async consume(key, limit, seconds) {
      const hash = createHash('sha256').update(key).digest('hex');
      // Increment and TTL are atomic across function instances; failed requests count too.
      const count = await command(['EVAL', "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return n", 1, `${prefix}limit:${hash}`, seconds]);
      if (!Number.isSafeInteger(count) || count < 1) throw new Error('Invalid storage response.');
      return count <= limit;
    },
  };
}

// Atomic mutations preserve the original singleton approvals during migration.
const MIGRATE_APPROVAL = `
team.approvals = team.approvals or {}
if team.approval then
  team.approvals[team.approval.email] = team.approvals[team.approval.email] or team.approval
  team.approval = nil
end`;
const REGISTER_TEAM = `
local raw = redis.call('HGET', KEYS[1], ARGV[1])
local incoming = cjson.decode(ARGV[2])
local team = raw and cjson.decode(raw) or incoming
${MIGRATE_APPROVAL}
team.name = incoming.name
team.nameKey = incoming.nameKey
for email, approval in pairs(team.approvals) do approval.teamName = team.name end
redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(team))
return cjson.encode(team)`;
const CREATE_TEAM = `
local incoming = cjson.decode(ARGV[3])
for _, raw in ipairs(redis.call('HVALS', KEYS[1])) do
  local existing = cjson.decode(raw)
  if existing.nameKey == incoming.nameKey or existing.name == incoming.name then return 'duplicate' end
end
if redis.call('HGET', KEYS[2], ARGV[2]) then return 'conflict' end
if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 1 then return 'collision' end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[3])
redis.call('HSET', KEYS[2], ARGV[2], ARGV[1])
return ARGV[3]`;
const APPROVE_TEAM = `
local raw = redis.call('HGET', KEYS[1], ARGV[1])
if not raw then return 'missing' end
local team = cjson.decode(raw)
${MIGRATE_APPROVAL}
local owner = redis.call('HGET', KEYS[2], ARGV[2])
if owner and owner ~= ARGV[1] then return 'conflict' end
if not team.approvals[ARGV[3]] then
  team.approvals[ARGV[3]] = { email = ARGV[3], teamId = team.id, teamName = team.name, userIdentifier = team.userIdentifier, version = ARGV[4], approvedAt = ARGV[5] }
end
redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(team))
redis.call('HSET', KEYS[2], ARGV[2], ARGV[1])
return cjson.encode(team.approvals[ARGV[3]])`;
const REVOKE_TEAM = `
local id = redis.call('HGET', KEYS[2], ARGV[1])
if not id then return 0 end
local raw = redis.call('HGET', KEYS[1], id)
if not raw then return 0 end
local team = cjson.decode(raw)
${MIGRATE_APPROVAL}
team.approvals[ARGV[2]] = nil
redis.call('HSET', KEYS[1], id, cjson.encode(team))
return 1`;
const RESERVE_CLAIM = `
local id = redis.call('HGET', KEYS[2], ARGV[1])
if not id then return 'invalid' end
local raw = redis.call('HGET', KEYS[1], id)
if not raw then return 'invalid' end
local team = cjson.decode(raw)
${MIGRATE_APPROVAL}
local approval = team.approvals[ARGV[5]]
if not approval or approval.version ~= ARGV[2] or team.userIdentifier ~= ARGV[3] then return 'invalid' end
if team.claimant and team.claimant.emailKey ~= ARGV[1] then return 'claimed' end
team.claimant = team.claimant or { emailKey = ARGV[1], email = approval.email, reservedAt = ARGV[4] }
redis.call('HSET', KEYS[1], id, cjson.encode(team))
return 'allowed'`;
