import { ApiGate } from "@/components/api-gate";
import { AppShell } from "@/components/app-shell";
import { GettingStartedPanel } from "@/components/getting-started-panel";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <GettingStartedPanel />
      <ApiGate>{children}</ApiGate>
    </AppShell>
  );
}
