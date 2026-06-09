"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { setApiErrorHandler } from "@/lib/api";

type ToastVariant = "error" | "success" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  toastError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
      window.setTimeout(() => dismiss(id), 6000);
    },
    [dismiss]
  );

  const toastError = useCallback(
    (message: string) => toast(message, "error"),
    [toast]
  );

  useEffect(() => {
    setApiErrorHandler((message) => toastError(message));
    return () => setApiErrorHandler(null);
  }, [toastError]);

  const value = useMemo(
    () => ({ toast, toastError }),
    [toast, toastError]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
              t.variant === "error" &&
                "border-destructive/30 bg-destructive/10 text-destructive",
              t.variant === "success" &&
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
              t.variant === "info" &&
                "border-border bg-background text-foreground"
            )}
          >
            <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
