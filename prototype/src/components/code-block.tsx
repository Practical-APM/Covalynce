"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "bash",
  title,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-[oklch(0.2_0.01_95)] text-[oklch(0.92_0.006_95)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <span className="font-mono text-xs text-white/50">
          {title ?? language}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 text-white/60 hover:bg-white/10 hover:text-white"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
