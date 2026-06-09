"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { AuthFlowShell } from "@/components/auth/auth-flow-shell";
import { OnboardingStepper } from "@/components/auth/onboarding-stepper";
import { isApiEnabled } from "@/lib/auth";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Plug,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/callout";
import { LabelWithHelp } from "@/components/help-tip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { navigateTo } from "@/lib/navigation";
import { markStepComplete } from "@/lib/getting-started";
import { track } from "@/lib/analytics";
import { slideInRight } from "@/lib/motion";

const steps = [
  { id: 1, title: "Organization", icon: Building2 },
  { id: 2, title: "Providers", icon: Plug },
  { id: 3, title: "Team", icon: Users },
];

const providers = [
  {
    id: "openai",
    apiName: "OPENAI" as const,
    name: "OpenAI",
    hint: "GPT-4o, o3, embeddings",
    initial: "O",
  },
  {
    id: "anthropic",
    apiName: "ANTHROPIC" as const,
    name: "Anthropic",
    hint: "Claude models",
    initial: "A",
  },
  {
    id: "gemini",
    apiName: "GEMINI" as const,
    name: "Google Gemini",
    hint: "Gemini Pro and Flash",
    initial: "G",
  },
];

const DEMO_API_KEY = "sk-demo-test-key";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function ProviderCard({
  name,
  hint,
  initial,
  isConnected,
  isConnecting,
  disabled,
  onConnect,
}: {
  name: string;
  hint: string;
  initial: string;
  isConnected: boolean;
  isConnecting: boolean;
  disabled: boolean;
  onConnect: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors",
        isConnected
          ? "border-foreground/20 bg-muted/40"
          : "border-border/80 bg-card hover:border-border"
      )}
      whileHover={reduce || isConnected ? undefined : { y: -2 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border text-sm font-semibold",
            isConnected
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-muted/50"
          )}
        >
          {isConnected ? <Check className="size-4" /> : initial}
        </div>
        <div>
          <span className="font-medium">{name}</span>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <Button
        variant={isConnected ? "secondary" : "outline"}
        size="sm"
        disabled={isConnected || isConnecting || disabled}
        onClick={onConnect}
      >
        {isConnecting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connecting…
          </>
        ) : isConnected ? (
          "Connected"
        ) : (
          "Connect with OAuth"
        )}
      </Button>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { registerOrganization, apiMode, session } = useAuth();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [orgCreated, setOrgCreated] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [hasSampleData, setHasSampleData] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleCreateOrg() {
    if (!orgName.trim()) return;
    if (!apiMode) {
      markStepComplete("org");
      setStep(2);
      return;
    }
    if (!adminEmail.trim()) {
      setError("Admin email is required for API signup");
      return;
    }
    setSubmitting(true);
    setError("");
    setInfo("");
    try {
      await registerOrganization({
        name: orgName.trim(),
        slug: slugify(orgName),
        adminEmail: adminEmail.trim(),
        adminName: adminEmail.split("@")[0],
      });
      markStepComplete("org");
      setOrgCreated(true);
      setInfo(`Organization "${orgName.trim()}" created. You're signed in as admin.`);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create org");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConnectProvider(
    providerId: string,
    apiName: "OPENAI" | "ANTHROPIC" | "GEMINI"
  ) {
    if (!apiMode) {
      setConnected((prev) =>
        prev.includes(providerId) ? prev : [...prev, providerId]
      );
      return;
    }
    if (connected.includes(providerId)) return;

    setConnectingId(providerId);
    setError("");
    try {
      const res = await api.startProviderOAuth(
        apiName,
        typeof window !== "undefined" ? window.location.origin : undefined
      );
      if (res.authorizationUrl) {
        navigateTo(res.authorizationUrl);
        return;
      }
      await api.connectProvider({ name: apiName, apiKey: DEMO_API_KEY });
      track("provider_connected", {
        provider: apiName,
        source: "onboarding",
        auth: "api_key",
      });
      markStepComplete("provider");
      setConnected((prev) => [...prev, providerId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect provider");
    } finally {
      setConnectingId(null);
    }
  }

  async function handleSeedDemo() {
    if (!apiMode) {
      setConnected(providers.map((p) => p.id));
      setStep(3);
      return;
    }
    setSeeding(true);
    setError("");
    try {
      const result = await api.seedDemo();
      if (result.seeded) {
        markStepComplete("provider");
        setHasSampleData(true);
        setInfo("Sample spend data loaded. You can explore the dashboard right away.");
        setConnected(["openai"]);
        track("demo_seeded", { source: "onboarding" });
      } else {
        setInfo("Sample data already exists or providers are connected.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sample data");
    } finally {
      setSeeding(false);
    }
  }

  async function finishOnboarding(invite: boolean) {
    setFinishing(true);
    setError("");

    if (invite && apiMode && session?.organization.id && inviteEmails.trim()) {
      const emails = inviteEmails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      for (const email of emails) {
        try {
          await api.inviteUser(session.organization.id, { email });
          track("user_invited", { email, source: "onboarding" });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : `Failed to invite ${email}`
          );
          setFinishing(false);
          return;
        }
      }
      setInfo(
        emails.length === 1
          ? `Invited ${emails[0]}`
          : `Invited ${emails.length} teammates`
      );
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("covalynce_onboarding_complete", "1");
    }
    router.push("/dashboard?welcome=1");
  }

  const stepHeadlines: Record<number, { title: string; subtitle: string }> = {
    1: {
      title: "Create your workspace",
      subtitle: "Name your organization and set the admin account.",
    },
    2: {
      title: "Connect AI providers",
      subtitle: "Link vendors or load sample data to populate your dashboard.",
    },
    3: {
      title: "Invite teammates (optional)",
      subtitle: "Solo? Skip this step — Community Edition works great for one person.",
    },
  };

  const { title, subtitle } = stepHeadlines[step];

  return (
    <AuthFlowShell
      headline="Set up AI spend control in minutes"
      description="Three guided steps: organization, providers, and teammates. Demo data is available instantly."
      maxWidth="lg"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <OnboardingStepper steps={steps} current={step} />

        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

        {step === 1 && (
          <Callout variant="tip" title="Community Edition" className="mt-4">
            Everything in setup is included free. SSO and compliance exports stay on
            Enterprise until you upgrade.
          </Callout>
        )}

        {info && (
          <Callout variant="success" title="Success" className="mt-6">
            {info}
          </Callout>
        )}
        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}

        <div className="relative mt-8 min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <LabelWithHelp
                      htmlFor="org"
                      label="Organization name"
                      help="Your company or team name as shown in the app (e.g. Acme Corp)."
                    />
                    <Input
                      id="org"
                      placeholder="Acme Corp"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="h-11"
                      autoFocus
                    />
                  </div>
                  {isApiEnabled() && (
                    <div className="space-y-2">
                      <LabelWithHelp
                        htmlFor="admin-email"
                        label="Your work email"
                        help="You become the first admin. Use the same email to sign in later."
                      />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="you@acme.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  )}
                  <Button
                    className="h-11 w-full"
                    onClick={handleCreateOrg}
                    disabled={!orgName.trim() || submitting}
                  >
                    {submitting ? "Creating…" : "Continue"}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {orgCreated && (
                  <Callout variant="success" title="Organization ready">
                    You&apos;re signed in. Connect a provider or load sample data.
                  </Callout>
                )}
                <Callout variant="tip" title="OAuth recommended">
                  Connect with OAuth when available — no secrets to copy. Demo keys
                  and sample data remain available as fallbacks.
                </Callout>
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                  <div className="space-y-3">
                    {providers.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <ProviderCard
                          name={p.name}
                          hint={p.hint}
                          initial={p.initial}
                          isConnected={connected.includes(p.id)}
                          isConnecting={connectingId === p.id}
                          disabled={seeding}
                          onConnect={() => handleConnectProvider(p.id, p.apiName)}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-4 h-11 w-full"
                    disabled={seeding || connectingId !== null}
                    onClick={handleSeedDemo}
                  >
                    {seeding ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Loading sample data…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Load sample data
                      </>
                    )}
                  </Button>
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="h-11" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      className="h-11 flex-1"
                      onClick={() => setStep(3)}
                      disabled={connected.length === 0 && !hasSampleData}
                    >
                      Continue
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
              >
                <div className="space-y-2">
                  <LabelWithHelp
                    htmlFor="emails"
                    label="Email addresses"
                    help="Comma-separated. Invites are sent immediately when using the API."
                  />
                  <Input
                    id="emails"
                    placeholder="colleague@company.com, finance@company.com"
                    className="h-11"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  />
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" className="h-11" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 flex-1"
                    disabled={finishing}
                    onClick={() => finishOnboarding(false)}
                  >
                    Skip for now
                  </Button>
                  <Button
                    className="h-11 flex-1"
                    disabled={finishing}
                    onClick={() => finishOnboarding(inviteEmails.trim().length > 0)}
                  >
                    {finishing
                      ? "Finishing…"
                      : inviteEmails.trim()
                        ? "Invite & open dashboard"
                        : "Open dashboard"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Questions?{" "}
          <Link
            href="/help/getting-started"
            className="font-medium text-foreground hover:underline"
          >
            Setup guide
          </Link>
        </p>
      </motion.div>
    </AuthFlowShell>
  );
}
