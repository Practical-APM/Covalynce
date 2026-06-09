"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { api } from "@/lib/api";
import {
  defaultPermissionsForRole,
  type Permission,
} from "@/lib/permissions";

interface PermissionsContextValue {
  loading: boolean;
  permissions: Record<string, boolean> | null;
  hasPermission: (permission: Permission | string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { session, apiMode } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const refreshPermissions = useCallback(async () => {
    if (!apiMode || !session) {
      setPermissions(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.myPermissions();
      setPermissions(res.permissions);
    } catch {
      setPermissions(defaultPermissionsForRole(session.user.role));
    } finally {
      setLoading(false);
    }
  }, [apiMode, session]);

  useLoadEffect(refreshPermissions, [refreshPermissions]);

  const hasPermission = useCallback(
    (permission: Permission | string) => {
      if (!apiMode) return true;
      const role = session?.user.role ?? "VIEWER";
      const map =
        permissions ?? defaultPermissionsForRole(role);
      return map[permission] ?? false;
    },
    [apiMode, permissions, session?.user.role]
  );

  const value = useMemo(
    () => ({
      loading,
      permissions,
      hasPermission,
      refreshPermissions,
    }),
    [loading, permissions, hasPermission, refreshPermissions]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return ctx;
}
