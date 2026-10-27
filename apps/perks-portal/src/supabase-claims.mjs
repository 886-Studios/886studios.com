import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { validateIdentifier } from './supabase-credits.mjs';

const LIFETIME = 7 * 24 * 60 * 60 * 1000;
function key(secret) {
  if (typeof secret !== 'string' || secret.length < 43) throw new Error('Configure SUPABASE_CLAIM_SECRET with at least 32 random bytes encoded as base64url.');
  return createHash('sha256').update(`886-supabase-claims-v1:${secret}`).digest();
}

// Authenticated encryption keeps the customer identifier out of URLs and logs.
// This is a bearer invitation: staff share it only with the approved recipient.
export function createClaim({ userIdentifier, secret, environment, now = Date.now(), approvalVersion, email }) {
  validateIdentifier(userIdentifier);
  if (!['staging', 'production'].includes(environment)) throw new Error('Invalid claim environment.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(secret), iv);
  cipher.setAAD(Buffer.from('886-supabase-claim-v1'));
  if (approvalVersion !== undefined && !/^[a-f0-9-]{36}$/.test(approvalVersion)) throw new Error('Invalid approval version.');
  const payload = JSON.stringify({ userIdentifier, environment, issuedAt: now, expiresAt: now + LIFETIME, approvalVersion, email, email });
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

export function readClaim(token, { secret, environment, now = Date.now() }) {
  try {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,1200}$/.test(token)) return null;
    const bytes = Buffer.from(token, 'base64url');
    if (bytes.toString('base64url') !== token) return null;
    const decipher = createDecipheriv('aes-256-gcm', key(secret), bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from('886-supabase-claim-v1'));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const claim = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8'));
    if (claim.environment !== environment || !Number.isSafeInteger(claim.issuedAt) || !Number.isSafeInteger(claim.expiresAt) ||
        claim.issuedAt > now || claim.expiresAt <= now || claim.expiresAt - claim.issuedAt !== LIFETIME) return null;
    validateIdentifier(claim.userIdentifier);
    return claim;
  } catch { return null; }
}
