import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTip } from "@/components/help-tip";

interface PageHeaderProps {
  title: string;
  description?: string;
  help?: React.ReactNode;
  docHref?: string;
  docLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  help,
  docHref,
  docLabel = "Learn more in Help",
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <h1 className="page-title">
            {title}
          </h1>
          {help && <HelpTip content={help} side="right" />}
        </div>
        {description && (
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {docHref && (
          <Link
            href={docHref}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
          >
            <BookOpen className="size-3.5 opacity-70" />
            {docLabel}
          </Link>
        )}
      </div>
      {children && (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
