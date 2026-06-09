"use client";

import {
  siAmazonwebservices,
  siAnthropic,
  siGooglegemini,
  siOpenai,
} from "simple-icons";
import { cn } from "@/lib/utils";

type IconData = { title: string; path: string; hex: string };

function BrandSvg({
  icon,
  color,
  className,
  title,
}: {
  icon: IconData;
  color?: string;
  className?: string;
  title: string;
}) {
  const fill = color ?? `#${icon.hex}`;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-full", className)}
      aria-label={title}
    >
      <title>{title}</title>
      <path d={icon.path} fill={fill} />
    </svg>
  );
}

/** Microsoft Azure mark (standard triangle lockup) */
function AzureLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Microsoft Azure" role="img">
      <path fill="#0078D4" d="M5.27 23h7.35L5.5 8.55 2.55 23H5.27zm12.78 0h6.95L13.86 2.2 8.3 23h9.75z" />
      <path fill="#50A0DC" d="M13.86 2.2 19.5 23h-5.64L13.86 12.5V2.2z" />
    </svg>
  );
}

/** Cursor cube mark (official path, padded viewBox) */
function CursorLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-15.5 -12 80 80"
      className={className}
      aria-label="Cursor"
      role="img"
    >
      <path
        fill="#26251E"
        d="M48.0226 13.2547L25.6601 0.311786C24.942 -0.103929 24.0559 -0.103929 23.3378 0.311786L0.976347 13.2547C0.372691 13.6041 0 14.2503 0 14.9502V41.0498C0 41.7496 0.372691 42.3958 0.976347 42.7453L23.3389 55.6882C24.057 56.1039 24.943 56.1039 25.6611 55.6882L48.0237 42.7453C48.6273 42.3958 49 41.7496 49 41.0498V14.9502C49 14.2503 48.6273 13.6041 48.0237 13.2547H48.0226ZM46.6179 15.9964L25.0302 53.4802C24.8842 53.7328 24.4989 53.6296 24.4989 53.337V28.793C24.4989 28.3026 24.2375 27.849 23.8134 27.6027L2.61094 15.3312C2.35898 15.1849 2.46186 14.7987 2.75372 14.7987H45.9292C46.5423 14.7987 46.9255 15.4649 46.619 15.9974L46.6179 15.9964Z"
      />
    </svg>
  );
}

export type ProviderBrandId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "azure"
  | "aws"
  | "cursor";

export const PROVIDER_ACCENT_COLORS: Record<ProviderBrandId, string> = {
  openai: "#10A37F",
  anthropic: "#D97757",
  gemini: "#8E75B2",
  azure: "#0078D4",
  aws: "#FF9900",
  cursor: "#26251E",
};

export function ProviderBrandLogo({
  id,
  className,
}: {
  id: ProviderBrandId;
  className?: string;
}) {
  const box = cn("size-9 shrink-0 sm:size-10", className);

  switch (id) {
    case "openai":
      return (
        <BrandSvg
          icon={siOpenai}
          color={PROVIDER_ACCENT_COLORS.openai}
          className={box}
          title="OpenAI"
        />
      );
    case "anthropic":
      return (
        <BrandSvg
          icon={siAnthropic}
          color={PROVIDER_ACCENT_COLORS.anthropic}
          className={box}
          title="Anthropic"
        />
      );
    case "gemini":
      return (
        <BrandSvg
          icon={siGooglegemini}
          color={PROVIDER_ACCENT_COLORS.gemini}
          className={box}
          title="Google Gemini"
        />
      );
    case "aws":
      return (
        <BrandSvg
          icon={siAmazonwebservices}
          color="#232F3E"
          className={box}
          title="Amazon Web Services"
        />
      );
    case "azure":
      return <AzureLogo className={box} />;
    case "cursor":
      return <CursorLogo className={box} />;
  }
}

export const PROVIDER_BRANDS = [
  {
    id: "openai" as const,
    name: "OpenAI",
    status: "live" as const,
    tint: "oklch(0.55 0.08 165 / 0.1)",
  },
  {
    id: "anthropic" as const,
    name: "Anthropic",
    status: "live" as const,
    tint: "oklch(0.62 0.07 45 / 0.1)",
  },
  {
    id: "gemini" as const,
    name: "Google Gemini",
    status: "live" as const,
    tint: "oklch(0.58 0.07 290 / 0.1)",
  },
  {
    id: "azure" as const,
    name: "Azure OpenAI",
    status: "gateway" as const,
    tint: "oklch(0.55 0.08 250 / 0.1)",
  },
  {
    id: "aws" as const,
    name: "AWS Bedrock",
    status: "gateway" as const,
    tint: "oklch(0.65 0.09 65 / 0.1)",
  },
  {
    id: "cursor" as const,
    name: "Cursor",
    status: "roadmap" as const,
    tint: "oklch(0.5 0.01 95 / 0.12)",
  },
] as const;
