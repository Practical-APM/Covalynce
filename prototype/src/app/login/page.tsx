"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { AuthFlowShell } from "@/components/auth/auth-flow-shell";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Callout } from "@/components/callout";
import { LabelWithHelp } from "@/components/help-tip";
import { LinkButton } from "@/components/link-button";
import { api, SESSION_EXPIRED_KEY } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { fadeUp } from "@/lib/motion";

export default function LoginPage() {
  const reduce = useReducedMotion();
  const { login, loginWithSso, requestMagicLink, apiMode } = useAuth();
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    if (sessionStorage.getItem(SESSION_EXPIRED_KEY)) {
      sessionStorage.removeItem(SESSION_EXPIRED_KEY);
      return "Session expired. Please sign in again.";
    }
    return "";
  });
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [authConfig, setAuthConfig] = useState<{
    passwordlessLoginAllowed: boolean;
    magicLinkEnabled: boolean;
    emailDeliveryConfigured: boolean;
  } | null>(null);

  useLoadEffect(() => {
    if (!apiMode) return;
    return api.authConfig().then(setAuthConfig).catch(() => setAuthConfig(null));
  }, [apiMode]);

  useLoadEffect(() => {
    if (!apiMode || !slug.trim()) {
      setSsoEnabled(false);
      return;
    }
    return api
      .ssoStatus(slug.trim())
      .then((s) => setSsoEnabled(s.enabled))
      .catch(() => setSsoEnabled(false));
  }, [apiMode, slug]);

  const useMagicLink =
    authConfig?.magicLinkEnabled && !authConfig.passwordlessLoginAllowed;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiMode) return;
    setLoading(true);
    setError("");
    setInfo("");
    try {
      if (useMagicLink) {
        const res = await requestMagicLink(email, slug);
        setInfo(res.message);
        if (res.verifyUrl) {
          setInfo(`${res.message} Dev link: ${res.verifyUrl}`);
        }
      } else {
        await login(email, slug);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSso() {
    if (!apiMode || !email || !slug) return;
    setLoading(true);
    setError("");
    try {
      await loginWithSso(email, slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SSO login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFlowShell
      headline="Sign in to your Community workspace"
      description="Use the email and organization slug from setup. Exploring solo is fine—invite teammates later from Settings."
      maxWidth="md"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold tracking-tight lg:hidden">Sign in</h2>
        <h2 className="hidden text-2xl font-semibold tracking-tight lg:block">Welcome back</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {apiMode
            ? useMagicLink
              ? "We'll email you a one-time sign-in link."
              : "Work email and organization slug (dev mode)."
            : "Demo mode — explore with sample data, no API required."}
        </p>

        {info && (
          <Callout variant="success" title="Check your email" className="mt-6">
            {info}
          </Callout>
        )}

        <div className="mt-8 space-y-4">
          {apiMode ? (
            <>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fadeUp} custom={0} className="space-y-2">
                  <LabelWithHelp
                    htmlFor="email"
                    label="Work email"
                    help="The email you used when creating the organization."
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="h-11"
                  />
                </motion.div>
                <motion.div variants={fadeUp} custom={1} className="space-y-2">
                  <LabelWithHelp
                    htmlFor="slug"
                    label="Organization slug"
                    help="Short ID from signup (e.g. acme-corp). Not your display name."
                  />
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="acme"
                    required
                    className="h-11"
                  />
                </motion.div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <motion.div variants={fadeUp} custom={2}>
                  <Button type="submit" className="h-11 w-full" disabled={loading}>
                    {loading
                      ? useMagicLink
                        ? "Sending link…"
                        : "Signing in…"
                      : useMagicLink
                        ? "Email sign-in link"
                        : "Continue"}
                  </Button>
                </motion.div>
              </motion.form>
              {ssoEnabled && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wide text-muted-foreground">
                      <span className="bg-background px-2">or</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full"
                    disabled={loading || !email}
                    onClick={handleSso}
                  >
                    Sign in with SSO
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Callout variant="note" title="Exploring the product?">
                Open the demo dashboard with realistic sample data. No login required.
              </Callout>
              <LinkButton className="h-11 w-full" href="/dashboard">
                Open demo dashboard
              </LinkButton>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground sm:text-left">
          New here?{" "}
          <Link href="/onboarding" className="font-medium text-foreground hover:underline">
            Start free on Community Edition
          </Link>
          {!apiMode && (
            <>
              {" "}
              or{" "}
              <Link href="/dashboard" className="font-medium text-foreground hover:underline">
                open the demo dashboard
              </Link>
            </>
          )}
        </p>

        <Link
          href="/help/getting-started"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          <BookOpen className="size-4" />
          Setup guide
        </Link>
      </motion.div>
    </AuthFlowShell>
  );
}
