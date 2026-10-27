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
const newApproval = email => ({ email: normalizeEmail(email), version: randomUUID(), approvedAt: new Date().toISOString() });

// Single-process, loopback development only. Never use ephemeral function storage in production.
export function createLocalEmailStore(path, { now = Date.now } = {}) {
  const read = () => existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { approvals: {}, limits: {} };
  const write = data => {
    const temporary = `${path}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
    renameSync(temporary, path);
  };
  return {
    async list() { return Object.values(read().approvals).sort((a, b) => a.email.localeCompare(b.email)); },
    async get(email) { return read().approvals[emailKey(email)] ?? null; },
    async approve(email) {
      const data = read(), key = emailKey(email);
      data.approvals[key] ??= newApproval(email);
      write(data);
      return data.approvals[key];
    },
    async revoke(email) { const data = read(); delete data.approvals[emailKey(email)]; write(data); },
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
  const approvals = `${prefix}approved-emails`;
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
    async list() { return (await command(['HVALS', approvals])).map(JSON.parse).sort((a, b) => a.email.localeCompare(b.email)); },
    async get(email) { const result = await command(['HGET', approvals, emailKey(email)]); return result ? JSON.parse(result) : null; },
    async approve(email) {
      // HSETNX preserves a current approval version under concurrent or repeated additions.
      await command(['HSETNX', approvals, emailKey(email), JSON.stringify(newApproval(email))]);
      return this.get(email);
    },
    async revoke(email) { await command(['HDEL', approvals, emailKey(email)]); },
    async consume(key, limit, seconds) {
      const hash = createHash('sha256').update(key).digest('hex');
      // Increment and TTL are atomic across function instances; failed requests count too.
      const count = await command(['EVAL', "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return n", 1, `${prefix}limit:${hash}`, seconds]);
      if (!Number.isSafeInteger(count) || count < 1) throw new Error('Invalid storage response.');
      return count <= limit;
    },
  };
}
