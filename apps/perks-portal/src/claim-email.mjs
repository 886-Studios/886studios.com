import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { normalizeEmail } from './approved-emails.mjs';

export function createLocalMailer(path) {
  const list = () => existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : [];
  return {
    local: true,
    list,
    async send({ email, claimUrl }) {
      const messages = list();
      messages.unshift({ email: normalizeEmail(email), claimUrl, createdAt: new Date().toISOString() });
      writeFileSync(path, JSON.stringify(messages.slice(0, 50), null, 2) + '\n', { mode: 0o600 });
    },
  };
}

export function createResendMailer(env, { fetchImpl = fetch } = {}) {
  if (!/^re_[A-Za-z0-9_-]+$/.test(env.RESEND_API_KEY ?? '')) throw new Error('Claim email delivery is not configured.');
  const from = normalizeEmail(env.PERKS_EMAIL_FROM);
  return {
    local: false,
    async send({ email, claimUrl }) {
      try {
        const response = await fetchImpl('https://api.resend.com/emails', {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID() },
          body: JSON.stringify({ from: `886 Studios <${from}>`, to: [normalizeEmail(email)],
            subject: 'Your Supabase claim link from 886 Studios',
            text: `Use this private link to claim your company’s Supabase perk:\n\n${claimUrl}\n\nThis link expires in seven days. Open it and select Continue to Supabase. Keep it within your company.\n\nIf you did not request this email, you can ignore it.\n\n886 Studios` }),
        });
        if (!response.ok || typeof (await response.json()).id !== 'string') throw new Error();
      } catch { throw new Error('Claim email could not be sent.'); }
    },
  };
}
