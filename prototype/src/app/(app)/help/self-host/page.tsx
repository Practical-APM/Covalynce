import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import {
  DocInAppLink,
  DocSection,
  DocSteps,
  DocTable,
} from "@/components/docs-parts";

export const metadata: Metadata = {
  title: "Self-host Covalynce — step-by-step guide",
  description:
    "Run Covalynce Community Edition on your own infrastructure. Every credential explained: where to create it, what it costs, and where to paste it.",
};

const bootstrapSteps = [
  {
    title: "Clone the repository",
    time: "1 min",
    body: (
      <CodeBlock
        language="bash"
        title="Terminal"
        code={`git clone https://github.com/PracticalAPM/Covalynce.git
cd Covalynce`}
      />
    ),
  },
  {
    title: "Create your environment file",
    time: "1 min",
    body: (
      <>
        <p>
          Copy the template, then fill in the values described in the sections
          below. This file never leaves your server.
        </p>
        <CodeBlock language="bash" title="Terminal" code={`cp .env.prod.example .env.prod`} />
      </>
    ),
  },
  {
    title: "Generate your secrets",
    time: "1 min",
    body: (
      <>
        <p>
          Two random strings protect your deployment:{" "}
          <code>JWT_SECRET</code> signs sessions and{" "}
          <code>CREDENTIALS_ENCRYPTION_KEY</code> encrypts every credential you
          store. Generate each one separately:
        </p>
        <CodeBlock
          language="bash"
          title="Terminal"
          code={`openssl rand -base64 32   # run twice: once per secret`}
        />
        <p className="mt-2">
          Paste the outputs into <code>.env.prod</code>. Do not reuse the
          defaults; the app warns you on the{" "}
          <Link href="/settings/self-host">Self-host settings page</Link> if it
          detects placeholder values.
        </p>
      </>
    ),
  },
  {
    title: "Set a database password",
    time: "1 min",
    body: (
      <>
        Set <code>POSTGRES_PASSWORD</code> in <code>.env.prod</code>. The
        bundled Docker Compose file runs Postgres 16 and Redis 7 for you, so
        there is nothing else to install. Using managed Postgres instead? See{" "}
        <a href="#database">bring your own database</a>.
      </>
    ),
  },
  {
    title: "Start everything",
    time: "3 min",
    body: (
      <>
        <CodeBlock
          language="bash"
          title="Terminal"
          code={`docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`}
        />
        <p className="mt-2">
          Four containers start: Postgres, Redis, the API (port 3001), and the
          web app (port 3000). Open{" "}
          <code>http://localhost:3000</code>, create your organization, and you
          are in.
        </p>
      </>
    ),
  },
];

const resendSteps = [
  {
    title: "Create a Resend account",
    time: "2 min",
    body: (
      <>
        Sign up at{" "}
        <a href="https://resend.com" target="_blank" rel="noopener noreferrer">
          resend.com
        </a>
        . The free tier (3,000 emails/month) is plenty for sign-in links and
        alerts on most teams.
      </>
    ),
  },
  {
    title: "Verify your sending domain",
    time: "5 min",
    body: (
      <>
        In the Resend dashboard, open <strong>Domains → Add domain</strong> and
        add the DNS records it gives you (usually two TXT records and one MX).
        Verification typically completes in minutes. Until then you can send
        only to your own address.
      </>
    ),
  },
  {
    title: "Create an API key",
    time: "1 min",
    body: (
      <>
        Open <strong>API Keys → Create API key</strong>. Choose{" "}
        <strong>Sending access</strong> only: Covalynce never needs more. Copy
        the key now; Resend shows it once.
      </>
    ),
  },
  {
    title: "Paste it into Covalynce",
    time: "1 min",
    body: (
      <>
        Go to{" "}
        <Link href="/settings/self-host">Settings → Self-host → Email delivery</Link>
        , paste the key, set the from address to a verified domain (for
        example <code>alerts@yourdomain.com</code>), save, and hit{" "}
        <strong>Send test email</strong>. The key is encrypted with AES-256-GCM
        before it is written to your database, and applies immediately: no
        restart.
      </>
    ),
  },
];

const oauthRows = [
  [
    "OpenAI",
    <a
      key="openai"
      href="https://platform.openai.com/settings/organization/general"
      target="_blank"
      rel="noopener noreferrer"
    >
      platform.openai.com → Settings
    </a>,
    "Organization owner",
  ],
  [
    "Anthropic",
    <a
      key="anthropic"
      href="https://console.anthropic.com/settings"
      target="_blank"
      rel="noopener noreferrer"
    >
      console.anthropic.com → Settings
    </a>,
    "Organization admin",
  ],
  [
    "Google (Gemini)",
    <a
      key="google"
      href="https://console.cloud.google.com/apis/credentials"
      target="_blank"
      rel="noopener noreferrer"
    >
      console.cloud.google.com → APIs & Services → Credentials
    </a>,
    "Project editor",
  ],
];

export default function SelfHostDocPage() {
  return (
    <DocsShell
      title="Self-host guide"
      description="Run Covalynce Community Edition on your own infrastructure in about 15 minutes. Your database, your credentials, your data."
      readTime="15 min"
    >
      <Callout variant="tip" title="What self-hosting gets you">
        Everything: dashboards, budgets, policies, the gateway, and unlimited
        seats run on your servers. The only data Covalynce keeps is the data
        you keep, because there is no &ldquo;our end.&rdquo; See{" "}
        <a href="#data-compliance">what your instance stores</a>.
      </Callout>

      <DocSection id="requirements" title="Before you start">
        <DocTable
          headers={["You need", "Why", "Cost"]}
          rows={[
            ["Docker + Docker Compose", "Runs the full stack with one command", "Free"],
            ["A server or laptop (2 GB RAM is enough)", "Hosts the four containers", "Yours already"],
            ["A Resend account (optional)", "Real sign-in links, invites, and alert emails", "Free tier"],
            ["Provider OAuth apps (optional)", "One-click provider connect instead of API keys", "Free"],
          ]}
        />
      </DocSection>

      <DocSection id="stack" title="Step 1 — Boot the stack">
        <DocSteps steps={bootstrapSteps} />
      </DocSection>

      <DocSection id="database" title="Step 2 (optional) — Bring your own database">
        <p>
          The compose file ships Postgres for you. To use managed Postgres
          (Neon, Supabase, RDS, Cloud SQL) instead, grab the connection string
          from your provider&rsquo;s dashboard. It always looks like this:
        </p>
        <CodeBlock
          language="bash"
          title=".env.prod"
          code={`DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"`}
        />
        <ul>
          <li>
            <strong>Neon:</strong> Project dashboard → Connect → copy the
            connection string (use the pooled one).
          </li>
          <li>
            <strong>Supabase:</strong> Project Settings → Database → Connection
            string → URI.
          </li>
          <li>
            <strong>RDS / Cloud SQL:</strong> instance endpoint + the user you
            created; make sure the API container can reach port 5432.
          </li>
        </ul>
        <p>
          Point <code>DATABASE_URL</code> at it, remove the bundled{" "}
          <code>postgres</code> service if you like, and run migrations once:
        </p>
        <CodeBlock language="bash" title="Terminal" code={`cd api && npx prisma migrate deploy`} />
      </DocSection>

      <DocSection id="resend" title="Step 3 — Email delivery with Resend">
        <p>
          Email powers magic-link sign-in, member invites, budget alerts, and
          emailed chargeback reports. Without it the app still works: sign-in
          links are printed to the API logs instead.
        </p>
        <DocSteps steps={resendSteps} />
      </DocSection>

      <DocSection id="provider-oauth" title="Step 4 (optional) — Provider OAuth apps">
        <p>
          By default your team connects AI providers by pasting an API key,
          which works fine. Registering OAuth apps upgrades that to a
          one-click consent screen. Create an OAuth client with each vendor you
          use:
        </p>
        <DocTable
          headers={["Provider", "Where to register", "Access needed"]}
          rows={oauthRows}
        />
        <p>For every client you create, use this redirect URI (replace the host with your deployment):</p>
        <CodeBlock
          language="bash"
          title="Redirect URI"
          code={`https://your-app.example.com/providers/oauth/callback`}
        />
        <p>
          Then paste each client ID, client secret, and redirect URI into{" "}
          <Link href="/settings/self-host">
            Settings → Self-host → Provider OAuth apps
          </Link>
          . Secrets are encrypted at rest and take effect immediately.
        </p>
      </DocSection>

      <DocSection id="data-compliance" title="What your instance stores">
        <p>
          Covalynce Community Edition is built to hold the minimum it needs to
          function, and nothing else. Everything below lives in{" "}
          <em>your</em> Postgres:
        </p>
        <DocTable
          headers={["Data", "Why it exists", "Protection"]}
          rows={[
            ["Account email, name, role", "Sign-in and access control", "Your database only"],
            ["Session + sign-in tokens", "Keeping you signed in", "SHA-256 hashed, revocable"],
            ["Provider / email / OAuth credentials", "Syncing usage, sending email", "AES-256-GCM encrypted"],
            ["Usage metadata (model, tokens, cost)", "The product itself", "Your database only"],
            ["Audit log of admin actions", "Accountability", "Your database only"],
          ]}
        />
        <p>What is never stored, anywhere:</p>
        <ul>
          <li>
            <strong>Prompts and completions.</strong> The gateway meters
            requests; it does not retain their content.
          </li>
          <li>
            <strong>Passwords.</strong> Sign-in is passwordless: magic link or
            SSO.
          </li>
          <li>
            <strong>Payment details.</strong> Community Edition has no billing.
          </li>
          <li>
            <strong>Telemetry to Covalynce.</strong> A self-hosted instance
            makes outbound requests only to the providers you connect.
          </li>
        </ul>
      </DocSection>

      <DocSection id="reset" title="Resetting credentials">
        <DocTable
          headers={["To reset", "Do this"]}
          rows={[
            [
              "Your sessions (lost laptop)",
              <span key="sessions">
                <Link href="/settings/self-host">Settings → Self-host → Reset access</Link>{" "}
                revokes every session and pending sign-in link, then sign in fresh.
              </span>,
            ],
            [
              "A stored credential (Resend, OAuth)",
              <span key="cred">
                Use <strong>Remove</strong> next to the field on the Self-host
                page, or paste a new value over it.
              </span>,
            ],
            [
              "JWT_SECRET",
              "Rotate it in .env.prod and restart the API. All users sign in again.",
            ],
            [
              "CREDENTIALS_ENCRYPTION_KEY",
              "Remove stored credentials first (they cannot be decrypted with a new key), rotate the key, restart, then re-enter credentials.",
            ],
          ]}
        />
      </DocSection>

      <DocInAppLink href="/settings/self-host">
        Open Self-host settings
      </DocInAppLink>
    </DocsShell>
  );
}
