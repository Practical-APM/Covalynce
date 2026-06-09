const TOKEN_KEY = "covalynce_token";
const REFRESH_KEY = "covalynce_refresh";
const SESSION_KEY = "covalynce_session";

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    plan?: string;
  };
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  if (session.refreshToken) {
    localStorage.setItem(REFRESH_KEY, session.refreshToken);
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function updateAccessTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
  const session = getStoredSession();
  if (session) {
    setSession({
      ...session,
      accessToken,
      refreshToken: refreshToken ?? session.refreshToken,
    });
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function isApiEnabled() {
  return process.env.NEXT_PUBLIC_USE_API === "true";
}
