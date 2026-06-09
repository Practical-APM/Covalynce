import { DocsShell } from "@/components/docs-shell";
import { HelpHome } from "@/components/help-home";

export default function HelpHomePage() {
  return (
    <DocsShell
      title="Help Center"
      description="Task-based guides for finance, platform, and engineering teams. Search above or pick a path below."
      readTime="1 min"
    >
      <HelpHome />
    </DocsShell>
  );
}
