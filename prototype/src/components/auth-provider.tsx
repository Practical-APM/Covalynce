"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  type AuthSession,
  clearSession,
  getStoredRefreshToken,
  getStoredSession,
  isApiEnabled,
  setSession,
} from "@/lib/auth";
import { api, setUnauthorizedHandler } from "@/lib/api";
import { track } from "@/lib/analytics";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  apiMode: boolean;
  login: (email: string, organizationSlug: string) => Promise<void>;
  requestMagicLink: (email: string, organizationSlug: string) => Promise<{
    sent: boolean;
    demo?: boolean;
    message: string;
    verifyUrl?: string;
  }>;
  loginWithSso: (email: string, organizationSlug: string) => Promise<void>;
  registerOrganization: (data: {
    name: string;
    slug: string;
    adminEmail: string;
    adminName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (organizationSlug: string) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const apiMode = isApiEnabled();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(apiMode);

  const applySession = useCallback((s: AuthSession) => {
    setSession(s);
    setSessionState(s);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!apiMode || !getStoredSession()) return;
    const me = await api.getMe();
    const current = getStoredSession();
    if (!current) return;
    applySession({
      ...current,
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        organizationId: me.organizationId,
      },
      organization: me.organization,
    });
  }, [apiMode, applySession]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!apiMode) {
        setLoading(false);
        return;
      }
      const stored = getStoredSession();
      if (!stored) {
        setSessionState(null);
        setLoading(false);
        return;
      }
      setSessionState(stored);
      refreshMe()
        .catch(() => {
          clearSession();
          setSessionState(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [apiMode, refreshMe]);

  useEffect(() => {
    if (!apiMode) return;
    setUnauthorizedHandler(() => {
      setSessionState(null);
      router.push("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [apiMode, router]);

  const loginWithSso = useCallback(
    async (email: string, organizationSlug: string) => {
      const res = await api.ssoExchange(
        organizationSlug,
        `mock-sso:${email}`
      );
      const next: AuthSession = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
        organization: res.organization,
      };
      applySession(next);
      router.push("/dashboard");
    },
    [applySession, router]
  );

  const requestMagicLink = useCallback(
    async (email: string, organizationSlug: string) => {
      return api.requestMagicLink({ email, organizationSlug });
    },
    []
  );

  const login = useCallback(
    async (email: string, organizationSlug: string) => {
      const res = await api.login({ email, organizationSlug });
      const next: AuthSession = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
        organization: res.organization,
      };
      applySession(next);
      router.push("/dashboard");
    },
    [applySession, router]
  );

  const registerOrganization = useCallback(
    async (data: {
      name: string;
      slug: string;
      adminEmail: string;
      adminName?: string;
    }) => {
      const res = await api.createOrganization(data);
      const next: AuthSession = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
        organization: res.organization,
      };
      applySession(next);
      track("organization_created", {
        organizationId: res.organization.id,
        slug: res.organization.slug,
      });
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    if (apiMode) {
      const refresh = getStoredRefreshToken();
      try {
        await api.logout(refresh ?? undefined);
      } catch {
        /* best-effort revoke */
      }
    }
    clearSession();
    setSessionState(null);
    router.push("/login");
  }, [apiMode, router]);

  const switchOrganization = useCallback(
    async (organizationSlug: string) => {
      const res = await api.switchOrganization(organizationSlug);
      const next: AuthSession = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
        organization: res.organization,
      };
      applySession(next);
      router.refresh();
    },
    [applySession, router]
  );

  const value = useMemo(
    () => ({
      session,
      loading,
      apiMode,
      login,
      requestMagicLink,
      loginWithSso,
      registerOrganization,
      logout,
      switchOrganization,
      refreshMe,
    }),
    [session, loading, apiMode, login, requestMagicLink, loginWithSso, registerOrganization, logout, switchOrganization, refreshMe]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
