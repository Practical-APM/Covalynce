"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { AuthFlowShell } from "@/components/auth/auth-flow-shell";
import { useLoadEffect } from "@/hooks/use-load-effect";

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { apiMode } = useAuth();
  const token = searchParams.get("token");
  const [message, setMessage] = useState(() => {
    if (!token) return "Missing sign-in token.";
    if (!apiMode) return "API mode required.";
    return "Verifying sign-in link…";
  });

  useLoadEffect(() => {
    if (!token || !apiMode) return;

    return api
      .verifyMagicLink(token)
      .then((res) => {
        setSession({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: res.user,
          organization: res.organization,
        });
        router.replace("/dashboard");
      })
      .catch((err) => {
        setMessage(
          err instanceof Error ? err.message : "Sign-in link invalid or expired"
        );
      });
  }, [token, apiMode, router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function LoginVerifyPage() {
  return (
    <AuthFlowShell headline="Signing you in" description="" maxWidth="md">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        }
      >
        <VerifyInner />
      </Suspense>
    </AuthFlowShell>
  );
}
