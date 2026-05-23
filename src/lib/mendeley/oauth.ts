const MENDELEY_AUTH = 'https://api.mendeley.com/oauth/authorize';
const MENDELEY_TOKEN = 'https://api.mendeley.com/oauth/token';

export interface MendeleyTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

function getClientId(): string {
  return import.meta.env.VITE_MENDELEY_CLIENT_ID ?? '';
}

function getRedirectUri(): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?phase=library&oauth=mendeley`;
}

export function buildMendeleyAuthUrl(): string {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Set VITE_MENDELEY_CLIENT_ID in your environment to use Mendeley OAuth.');
  }
  const state = crypto.randomUUID();
  sessionStorage.setItem('mendeley_oauth_state', state);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'all',
    state,
  });
  return `${MENDELEY_AUTH}?${params.toString()}`;
}

export async function exchangeMendeleyCode(code: string): Promise<MendeleyTokens> {
  const clientId = getClientId();
  const clientSecret = import.meta.env.VITE_MENDELEY_CLIENT_SECRET ?? '';
  if (!clientId) throw new Error('Mendeley client ID not configured');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(MENDELEY_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) throw new Error(`Mendeley token exchange failed: ${res.statusText}`);
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: new Date(Date.now() + json.expires_in * 1000).toISOString(),
  };
}

export function parseMendeleyOAuthCallback(): { code: string; state: string } | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get('oauth') !== 'mendeley') return null;
  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) return null;
  const expected = sessionStorage.getItem('mendeley_oauth_state');
  if (expected && expected !== state) return null;
  return { code, state };
}

export function clearMendeleyOAuthParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('oauth');
  window.history.replaceState({}, '', url.toString());
  sessionStorage.removeItem('mendeley_oauth_state');
}
