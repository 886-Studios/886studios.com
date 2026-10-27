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
export function normalizeTeamId(value) {
  const id = String(value ?? '').toLowerCase().replaceAll('-', '');
  if (!/^[a-f0-9]{32}$/.test(id)) throw new ApprovalConflict('Select a registered team.');
  return id;
}
export function teamRecord({ id, name }) {
  id = normalizeTeamId(id);
  if (typeof name !== 'string' || !name.trim() || name.length > 160 || /[\x00-\x1f]/.test(name)) throw new ApprovalConflict('Enter a valid team name.');
  return { id, name: name.trim(), userIdentifier: `886-team:${id}` };
}
const newApproval = (email, team) => ({ email: normalizeEmail(email), teamId: team.id, teamName: team.name,
  userIdentifier: team.userIdentifier, version: randomUUID(), approvedAt: new Date().toISOString() });
const sortTeams = teams => teams.sort((a, b) => a.name.localeCompare(b.name));
const approvalList = teams => sortTeams(teams).flatMap(team => team.approval ? [team.approval] : []);
const conflict = 'This team already has a designated founder, or this email belongs to another team. Revoke the current founder before replacing them.';

// Single-process, loopback development only. Never use ephemeral function storage in production.
export function createLocalEmailStore(path, { now = Date.now } = {}) {
  const read = () => {
    const data = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { limits: {} };
    // Legacy email-only approvals are deliberately not valid team approvals.
    data.teams ??= {}; data.emailTeams ??= {};
    return data;
  };
  const write = data => {
    const temporary = `${path}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
    renameSync(temporary, path);
  };
  return {
    async teams() { return sortTeams(Object.values(read().teams)); },
    async registerTeam(value) {
      const team = teamRecord(value), data = read();
      data.teams[team.id] ??= team; write(data); return data.teams[team.id];
    },
    async list() { return approvalList(Object.values(read().teams)); },
    async get(email) {
      const data = read(), approval = data.teams[data.emailTeams[emailKey(email)]]?.approval;
      return approval?.email === normalizeEmail(email) ? approval : null;
    },
    async approve(email, teamId) {
      const data = read(), key = emailKey(email), id = normalizeTeamId(teamId), team = data.teams[id];
      if (!team) throw new ApprovalConflict('Select a registered team.');
      if ((team.approval && team.approval.email !== normalizeEmail(email)) || (data.emailTeams[key] && data.emailTeams[key] !== id)) throw new ApprovalConflict(conflict);
      team.approval ??= newApproval(email, team);
      data.emailTeams[key] = id; write(data); return team.approval;
    },
    async revoke(email) {
      const data = read(), team = data.teams[data.emailTeams[emailKey(email)]];
      if (team?.approval?.email === normalizeEmail(email)) delete team.approval;
      // Retain the team identity and historical email binding permanently.
      write(data);
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
    async teams() { return sortTeams((await command(['HVALS', teams])).map(JSON.parse)); },
    async registerTeam(value) {
      const team = teamRecord(value);
      await command(['HSETNX', teams, team.id, JSON.stringify(team)]);
      return JSON.parse(await command(['HGET', teams, team.id]));
    },
    async list() { return approvalList(await this.teams()); },
    async get(email) {
      const id = await command(['HGET', emails, emailKey(email)]);
      if (!id) return null;
      const value = await command(['HGET', teams, id]);
      const approval = value ? JSON.parse(value).approval : null;
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
    async consume(key, limit, seconds) {
      const hash = createHash('sha256').update(key).digest('hex');
      // Increment and TTL are atomic across function instances; failed requests count too.
      const count = await command(['EVAL', "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return n", 1, `${prefix}limit:${hash}`, seconds]);
      if (!Number.isSafeInteger(count) || count < 1) throw new Error('Invalid storage response.');
      return count <= limit;
    },
  };
}

// Team records are never deleted, including after revocation. Supabase sees the same
// customer identifier across renamed products, retries, and replacement founders.
const APPROVE_TEAM = `
local raw = redis.call('HGET', KEYS[1], ARGV[1])
if not raw then return 'missing' end
local team = cjson.decode(raw)
local owner = redis.call('HGET', KEYS[2], ARGV[2])
if (owner and owner ~= ARGV[1]) or (team.approval and team.approval.email ~= ARGV[3]) then return 'conflict' end
if not team.approval then
  team.approval = { email = ARGV[3], teamId = team.id, teamName = team.name, userIdentifier = team.userIdentifier, version = ARGV[4], approvedAt = ARGV[5] }
end
redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(team))
redis.call('HSET', KEYS[2], ARGV[2], ARGV[1])
return cjson.encode(team.approval)`;
const REVOKE_TEAM = `
local id = redis.call('HGET', KEYS[2], ARGV[1])
if not id then return 0 end
local raw = redis.call('HGET', KEYS[1], id)
if not raw then return 0 end
local team = cjson.decode(raw)
if team.approval and team.approval.email == ARGV[2] then
  team.approval = nil
  redis.call('HSET', KEYS[1], id, cjson.encode(team))
end
return 1`;
