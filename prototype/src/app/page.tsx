import type { Metadata } from "next";
import { LandingPageClient } from "@/components/landing/landing-page-client";
import { LANDING_SEO } from "@/lib/landing-copy";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: LANDING_SEO.title,
    template: "%s | Covalynce",
  },
  description: LANDING_SEO.description,
  keywords: LANDING_SEO.keywords,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
    type: "website",
    url: SITE_URL,
    siteName: "Covalynce",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}
