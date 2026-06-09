"use client";

import { useCallback, useState } from "react";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { alerts as mockAlerts } from "@/lib/mock-data";

export function useUnreadAlerts() {
  const { apiMode } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!apiMode) {
      setCount(mockAlerts.filter((a) => !a.read).length);
      return;
    }
    try {
      const list = await api.listAlerts(true);
      setCount(list.length);
    } catch {
      setCount(0);
    }
  }, [apiMode]);

  useLoadEffect(refresh, [refresh], () => setCount(0));

  return { unreadCount: count, refresh };
}
