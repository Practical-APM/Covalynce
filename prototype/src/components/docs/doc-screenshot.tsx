"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DocAnnotation = {
  label: string;
  /** 0–100 percent from left */
  x: number;
  /** 0–100 percent from top */
  y: number;
};

export function DocScreenshot({
  caption,
  alt,
  children,
  annotations,
  className,
  bleed = false,
}: {
  caption?: string;
  alt: string;
  children: ReactNode;
  annotations?: DocAnnotation[];
  className?: string;
  bleed?: boolean;
}) {
  return (
    <figure
      className={cn(
        "doc-screenshot",
        bleed && "doc-screenshot-bleed",
        className
      )}
    >
      <div className="doc-screenshot-frame" role="img" aria-label={alt}>
        <div className="doc-screenshot-chrome" aria-hidden>
          <span className="doc-screenshot-dot bg-[#ff5f57]" />
          <span className="doc-screenshot-dot bg-[#febc2e]" />
          <span className="doc-screenshot-dot bg-[#28c840]" />
          <span className="doc-screenshot-title">Covalynce</span>
        </div>
        <div className="doc-screenshot-body">{children}</div>
        {annotations?.map((a) => (
          <span
            key={a.label}
            className="doc-screenshot-pin"
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
          >
            <span className="doc-screenshot-pin-dot" />
            <span className="doc-screenshot-pin-label">{a.label}</span>
          </span>
        ))}
      </div>
      {caption && (
        <figcaption className="doc-screenshot-caption">{caption}</figcaption>
      )}
    </figure>
  );
}

export function DocGraphic({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("doc-graphic", className)}>
      {title && <p className="doc-graphic-title">{title}</p>}
      <div className="doc-graphic-inner">{children}</div>
    </div>
  );
}
