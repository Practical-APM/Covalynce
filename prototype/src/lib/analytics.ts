import { isApiEnabled, getStoredToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** PRD MVP product analytics events */
export type AnalyticsEvent =
  | "organization_created"
  | "user_invited"
  | "provider_connected"
  | "demo_seeded"
  | "dashboard_viewed"
  | "budget_created"
  | "alert_triggered";

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    properties: properties ?? {},
    ts: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload);
  }

  if (!isApiEnabled()) return;

  const token = getStoredToken();
  if (!token) return;

  fetch(`${API_BASE}/api/v1/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ event, properties }),
  }).catch(() => {
    /* non-blocking */
  });
}
