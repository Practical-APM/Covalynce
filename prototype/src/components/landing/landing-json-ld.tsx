import { LANDING_SEO, PRODUCT_HUNT_TAGLINE } from "@/lib/landing-copy";
import { SITE_URL } from "@/lib/site-config";

export function LandingJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Covalynce",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Docker",
    description: LANDING_SEO.description,
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Community Edition — Apache 2.0, self-hosted",
    },
    featureList: [
      "Unified AI spend dashboard",
      "OpenAI, Anthropic, and Gemini billing sync",
      "Team and model cost attribution",
      "Budget monitoring and alerts",
      "Self-host with Docker Compose",
    ],
    slogan: PRODUCT_HUNT_TAGLINE,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
