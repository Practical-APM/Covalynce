"use client";

import { useCallback, useEffect, useState } from "react";

const PIN_KEY = "covalynce_sidebar_pinned";

export function useSidebar() {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        setPinned(localStorage.getItem(PIN_KEY) === "true");
      } catch {
        /* ignore */
      }
      setHydrated(true);
    });
  }, []);

  /** Desktop: expanded when hovered or pinned; mobile sheet always full width */
  const expanded = pinned || hovered;

  const togglePinned = useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PIN_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return {
    expanded,
    pinned,
    hovered,
    setHovered,
    mobileOpen,
    hydrated,
    togglePinned,
    openMobile,
    closeMobile,
    setMobileOpen,
    /** @deprecated use expanded */
    collapsed: !expanded,
    /** @deprecated use togglePinned */
    toggleCollapsed: togglePinned,
  };
}
