const STORAGE_KEY = "covalynce_getting_started_v1";

export type GettingStartedStepId =
  | "org"
  | "provider"
  | "dashboard"
  | "budget"
  | "gateway";

export interface GettingStartedStep {
  id: GettingStartedStepId;
  title: string;
  description: string;
  href: string;
  docHref?: string;
}

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    id: "org",
    title: "Create your organization",
    description: "Set up your workspace and sign in as an admin.",
    href: "/onboarding",
    docHref: "/help/getting-started",
  },
  {
    id: "provider",
    title: "Connect an AI provider",
    description: "Link OpenAI, Anthropic, or Gemini so spend data can sync.",
    href: "/providers",
    docHref: "/help/concepts#provider",
  },
  {
    id: "dashboard",
    title: "Review your overview",
    description: "Confirm spend, teams, and models look correct.",
    href: "/dashboard",
    docHref: "/help/concepts#overview",
  },
  {
    id: "budget",
    title: "Set a monthly budget",
    description: "Define limits and alerts before costs surprise anyone.",
    href: "/budgets",
    docHref: "/help/features/budgets",
  },
  {
    id: "gateway",
    title: "Optional: route traffic through Gateway",
    description: "Enforce policies and record every LLM request in real time.",
    href: "/gateway",
    docHref: "/help/features/gateway",
  },
];

export interface GettingStartedState {
  completed: GettingStartedStepId[];
  dismissed: boolean;
}

export function loadGettingStarted(): GettingStartedState {
  if (typeof window === "undefined") {
    return { completed: [], dismissed: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], dismissed: false };
    return JSON.parse(raw) as GettingStartedState;
  } catch {
    return { completed: [], dismissed: false };
  }
}

export function saveGettingStarted(state: GettingStartedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markStepComplete(stepId: GettingStartedStepId) {
  const state = loadGettingStarted();
  if (!state.completed.includes(stepId)) {
    state.completed = [...state.completed, stepId];
    saveGettingStarted(state);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("getting-started-updated"));
    }
  }
  return state;
}
