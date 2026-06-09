"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast-provider";
import { useLoadEffect } from "@/hooks/use-load-effect";

function ProviderOAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, toastError } = useToast();
  const provider = searchParams.get("provider") as
    | "OPENAI"
    | "ANTHROPIC"
    | "GEMINI"
    | null;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const [message, setMessage] = useState(() =>
    !provider || !code || !state
      ? "Missing OAuth parameters."
      : "Completing connection…"
  );

  useLoadEffect(() => {
    if (!provider || !code || !state) return;

    return api
      .completeProviderOAuth(provider, { code, state })
      .then(() => {
        toast(`${provider} connected via OAuth.`, "success");
        router.replace("/providers");
      })
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : "OAuth connection failed";
        setMessage(msg);
        toastError(msg);
      });
  }, [provider, code, state, router, toast, toastError]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function ProviderOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProviderOAuthCallbackInner />
    </Suspense>
  );
}
