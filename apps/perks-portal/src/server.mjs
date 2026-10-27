import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createAuth, createRateLimiter } from './auth.mjs';
import { renderDirectory, renderLogin, renderSupabaseClaim } from './render.mjs';
import { creditsConfig, issueSupabaseCredit, SupabaseCreditsError } from './supabase-credits.mjs';
import { readClaim } from './supabase-claims.mjs';
import { CATEGORIES, loadCatalog, normalizeSort } from './catalog.mjs';
import { ACCESS_CODE_MAX, validateOrigin, validateBasePath } from './config.mjs';

const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.ttf': 'font/ttf', '.txt': 'text/plain' };
const HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
};

function publicFiles(directory, prefix = '') {
  const assets = new Map();
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (item.isSymbolicLink() || item.name.startsWith('.')) continue;
    const path = join(directory, item.name);
    const url = `${prefix}/${item.name}`;
    if (item.isDirectory()) for (const entry of publicFiles(path, url)) assets.set(...entry);
    else if (TYPES[extname(item.name)]) assets.set(url, { path, type: TYPES[extname(item.name)] });
  }
  return assets;
}

async function readBody(req) {
  if (Number(req.headers['content-length']) > 2048) throw Object.assign(new Error('Request is too large.'), { status: 413 });
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 2048) throw Object.assign(new Error('Request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
}

export function createUnavailableHandler() {
  return (req, res) => {
    for (const [name, value] of Object.entries(HEADERS)) res.setHeader(name, value);
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '60' });
    res.end(req.method === 'HEAD' ? undefined : 'Portfolio access is temporarily unavailable.');
  };
}

export function createHandler({ root, code, secret, origin, basePath = '', secure = true, now, catalog,
  limiter = createRateLimiter(), vercel = secure && process.env.VERCEL === '1',
  creditsEnv = process.env, issueCredit = issueSupabaseCredit, claimLimiter = createRateLimiter() }) {
  validateBasePath(basePath);
  const publicOrigin = validateOrigin(origin, { secure });
  const home = basePath || '/';
  const loginPage = options => renderLogin({ ...options, basePath });
  const assets = publicFiles(join(root, 'public'));
  let auth;
  let perks;
  try {
    auth = createAuth({ code, secret, secure, now, basePath });
    perks = catalog ?? loadCatalog(join(root, 'private/catalog.json'));
  } catch (error) {
    // Fail closed: never render the catalog if credentials or data are missing.
    console.error(`Perks configuration: ${error.message}`);
  }
  return async function handler(req, res) {
    for (const [name, value] of Object.entries(HEADERS)) res.setHeader(name, value);
    if (secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    const send = (status, body, type = 'text/html; charset=utf-8') => {
      res.writeHead(status, { 'Content-Type': type });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    const redirect = location => { res.writeHead(303, { Location: location }); res.end(); };
    try {
      const url = new URL(req.url, publicOrigin);
      if (basePath && url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`)) return send(404, 'Not found.', 'text/plain');
      const path = url.pathname.slice(basePath.length) || '/';
      if (path === '/supabase') res.setHeader('Referrer-Policy', 'no-referrer');
      if (req.method === 'GET' || req.method === 'HEAD') {
        if (path === '/robots.txt') return send(200, 'User-agent: *\nAllow: /\n', 'text/plain; charset=utf-8');
        if (assets.has(path)) {
          const asset = assets.get(path);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          return send(200, readFileSync(asset.path), asset.type);
        }
        // The encrypted invitation authorizes this single benefit, never catalog access.
        // GET/HEAD are safe for email scanners and cannot issue a code.
        if (path === '/supabase') return send(200, renderSupabaseClaim({ basePath }));
        if (path !== '/' && path !== '/login') return send(404, 'Not found.', 'text/plain; charset=utf-8');
        if (!auth || !perks) return send(503, loginPage({ ready: false }));
        if (!auth.valid(req.headers.cookie)) return send(200, loginPage());
        if (path === '/login') return redirect(home);
        const query = (url.searchParams.get('q') ?? '').slice(0, 200).trim();
        const category = CATEGORIES.includes(url.searchParams.get('category')) ? url.searchParams.get('category') : '';
        const sort = normalizeSort(url.searchParams.get('sort'));
        return send(200, renderDirectory(perks, { query, category, sort, basePath }));
      }
      if (req.method !== 'POST') { res.setHeader('Allow', 'GET, HEAD, POST'); return send(405, 'Method not allowed.', 'text/plain'); }
      if (!['/login', '/logout', '/supabase'].includes(path)) return send(404, 'Not found.', 'text/plain');
      if (req.headers.origin !== publicOrigin || req.headers['sec-fetch-site'] === 'cross-site') return send(403, 'Please submit this form from the perks website.', 'text/plain');
      if (!auth || !perks) return send(503, loginPage({ ready: false }));
      if (path === '/logout') { res.setHeader('Set-Cookie', auth.clear()); return redirect(home); }
      if (!String(req.headers['content-type'] ?? '').startsWith('application/x-www-form-urlencoded')) return send(415, 'Unsupported form format.', 'text/plain');
      const form = await readBody(req);
      // Vercel overwrites this header. Standalone servers use the socket address.
      const ip = vercel ? req.headers['x-vercel-forwarded-for'] || 'unknown' : req.socket?.remoteAddress || 'unknown';
      if (path === '/supabase') {
        const claimPage = options => renderSupabaseClaim({ basePath, ...options });
        if (claimLimiter.blocked(`ip:${ip}`)) {
          res.setHeader('Retry-After', '900');
          return send(429, claimPage({ error: 'Too many attempts. Please try again in 15 minutes.' }));
        }
        claimLimiter.fail(`ip:${ip}`);
        let invitation = '';
        try {
          const { environment } = creditsConfig(creditsEnv);
          const claim = readClaim(form.get('claim'), { secret: creditsEnv.SUPABASE_CLAIM_SECRET, environment, now: now?.() });
          if (!claim) return send(403, claimPage({ error: 'This invitation is invalid or has expired. Ask the 886 team for a new link.' }));
          invitation = form.get('claim');
          const customerKey = `customer:${claim.userIdentifier}`;
          if (claimLimiter.blocked(customerKey)) {
            res.setHeader('Retry-After', '900');
            return send(429, claimPage({ invitation, error: 'Too many attempts for this invitation. Please try again in 15 minutes.' }));
          }
          // Account before awaiting upstream to bound concurrent and repeated attempts.
          claimLimiter.fail(customerKey);
          const result = await issueCredit({ userIdentifier: claim.userIdentifier, env: creditsEnv });
          if (result.environment === 'staging') return send(200, claimPage({ stagingCode: result.code }));
          return redirect(result.redemptionUrl);
        } catch (error) {
          const status = error instanceof SupabaseCreditsError && error.kind === 'already-redeemed' ? 400 :
            error instanceof SupabaseCreditsError && error.kind === 'rate-limit' ? 429 : 503;
          return send(status, claimPage({ invitation, error: error instanceof SupabaseCreditsError && error.kind !== 'configuration' ? error.message : 'Supabase credits are temporarily unavailable. Please contact the 886 team.' }));
        }
      }
      // No await between this check, verification and accounting: concurrent
      // bodies cannot pass a stale check before another request records failure.
      if (limiter.blocked(ip)) {
        res.setHeader('Retry-After', '900');
        return send(429, loginPage({ error: 'Too many attempts. Please try again in 15 minutes.' }));
      }
      const value = form.get('code');
      if (!value || value.length > ACCESS_CODE_MAX || !auth.verifyCode(value)) {
        limiter.fail(ip);
        return send(401, loginPage({ error: 'That code doesn’t look right. Please try again or ask the 886 team.' }));
      }
      limiter.reset(ip);
      res.setHeader('Set-Cookie', auth.issue());
      return redirect(home);
    } catch (error) {
      if (!res.headersSent) return send(error.status ?? 500, error.status ? error.message : 'Something went wrong. Please try again.', 'text/plain');
      res.end();
    }
  };
}
