"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getStoredSession, isApiEnabled } from "@/lib/auth";

const PUBLIC_EXACT = ["/", "/login", "/signup", "/onboarding"];

export function ApiGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isApiEnabled() || loading) return;
    const isPublic = PUBLIC_EXACT.includes(pathname);
    if (!getStoredSession() && !isPublic) {
      router.replace("/login");
    }
  }, [loading, pathname, router]);

  if (isApiEnabled() && loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  return <>{children}</>;
}
