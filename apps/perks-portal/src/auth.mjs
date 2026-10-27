import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { validateCredentials } from './config.mjs';
export { createRateLimiter } from './rate-limit.mjs';

export const SESSION_SECONDS = 7 * 24 * 60 * 60;
const digest = value => createHash('sha256').update(value).digest();
export const equal = (a, b) => timingSafeEqual(digest(a), digest(b));

export function createAuth({ code, secret, secure = true, now = Date.now, basePath = '', name = '886_perks', sessionSeconds = SESSION_SECONDS }) {
  validateCredentials({ code, secret }, { strict: false });
  if (!/^[a-z0-9_]+$/.test(name) || !Number.isSafeInteger(sessionSeconds) || sessionSeconds < 1) throw new Error('Invalid session settings.');
  // Rotating either credential immediately invalidates all existing sessions.
  const key = createHmac('sha256', secret).update(code).digest();
  const sign = value => createHmac('sha256', key).update(value).digest('base64url');
  const cookieName = `${secure ? (basePath ? '__Secure-' : '__Host-') : ''}${name}`;
  const attributes = `Path=${basePath || '/'}; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
  return {
    verifyCode: value => equal(String(value), code),
    issue() {
      const payload = `${Math.floor(now() / 1000)}.${randomBytes(24).toString('base64url')}`;
      return `${cookieName}=${payload}.${sign(payload)}; Max-Age=${sessionSeconds}; ${attributes}`;
    },
    valid(cookie = '') {
      if (typeof cookie !== 'string') return false;
      const tokens = cookie.split(';').map(s => s.trim()).filter(s => s.startsWith(`${cookieName}=`));
      if (tokens.length !== 1) return false;
      const token = tokens[0].slice(cookieName.length + 1);
      if (!/^\d{10}\.[\w-]{32}\.[\w-]{43}$/.test(token)) return false;
      const [issued, nonce, signature] = token.split('.');
      const age = Math.floor(now() / 1000) - Number(issued);
      return age >= 0 && age < sessionSeconds && equal(signature, sign(`${issued}.${nonce}`));
    },
    clear: () => `${cookieName}=; Max-Age=0; ${attributes}`,
  };
}
