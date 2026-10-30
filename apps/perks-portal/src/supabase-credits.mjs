const HOSTS = { staging: 'https://api.supabase.green', production: 'https://api.supabase.com' };

export class SupabaseCreditsError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = 'SupabaseCreditsError';
    this.kind = kind;
  }
}

export function creditsConfig(env = process.env) {
  const environment = env.SUPABASE_PARTNER_ENVIRONMENT || 'staging';
  const apiKey = env.SUPABASE_PARTNER_API_KEY;
  if (!Object.hasOwn(HOSTS, environment) || typeof apiKey !== 'string' || !/^sb_partner_[a-zA-Z0-9_-]+$/.test(apiKey)) {
    throw new SupabaseCreditsError('configuration', 'Configure SUPABASE_PARTNER_ENVIRONMENT and SUPABASE_PARTNER_API_KEY.');
  }
  // Staging is the default; production requires an explicit environment choice.
  return { environment, apiKey, endpoint: `${HOSTS[environment]}/partners/credits/get-code` };
}

export function validateIdentifier(value) {
  if (typeof value !== 'string' || !value || value.length > 254 || value !== value.trim() || /[\s\p{Cc}\p{Cf}]/u.test(value)) {
    throw new SupabaseCreditsError('identifier', 'Use the approved customer’s stable email or user ID.');
  }
  return value;
}

export async function issueSupabaseCredit({ userIdentifier, env = process.env, fetchImpl = fetch }) {
  const config = creditsConfig(env);
  validateIdentifier(userIdentifier);
  let response;
  try {
    response = await fetchImpl(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-partner-api-key': config.apiKey },
      body: JSON.stringify({ user_identifier: userIdentifier }),
      signal: AbortSignal.timeout(10_000),
      // Never forward the partner key to a redirect destination.
      redirect: 'error',
    });
  } catch {
    throw new SupabaseCreditsError('unavailable', 'Supabase could not be reached. Try again later with the same customer identifier.');
  }
  // Do not log or relay upstream bodies: they may contain credentials or customer data.
  if (response.status === 400) throw new SupabaseCreditsError('already-redeemed', 'Supabase could not issue a code. This customer may already have redeemed the offer. Contact the 886 team.');
  if ([401, 403].includes(response.status)) throw new SupabaseCreditsError('configuration', 'Supabase credits are not configured correctly. Contact the 886 team.');
  if (response.status === 429) throw new SupabaseCreditsError('rate-limit', 'Supabase is receiving too many requests. Please try again later.');
  if (response.status !== 201) throw new SupabaseCreditsError('unavailable', 'Supabase credits are temporarily unavailable. Please try again later.');
  let body;
  try { body = await response.json(); } catch { /* Validate below. */ }
  if (typeof body?.code !== 'string' || !/^[A-Za-z0-9_-]{4,200}$/.test(body.code)) {
    throw new SupabaseCreditsError('response', 'Supabase returned an invalid code. Contact the 886 team.');
  }
  return {
    code: body.code,
    environment: config.environment,
    // The staging key can issue codes, but those codes cannot be redeemed.
    // Build the canonical dashboard URL ourselves; never trust an upstream link
    // as a redirect destination. The old /redeem route returns 404.
    redemptionUrl: config.environment === 'production' ? `https://supabase.com/dashboard/redeem?${new URLSearchParams({ code: body.code })}` : null,
  };
}
