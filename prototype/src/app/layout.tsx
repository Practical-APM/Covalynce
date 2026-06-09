import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { EditionFeaturesProvider } from "@/components/edition-features-provider";
import { PermissionsProvider } from "@/components/permissions-provider";
import { ToastProvider } from "@/components/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LANDING_SEO } from "@/lib/landing-copy";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: LANDING_SEO.title,
  description: LANDING_SEO.description,
  keywords: LANDING_SEO.keywords,
  openGraph: {
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <TooltipProvider delay={200}>
            <AuthProvider>
              <ToastProvider>
                <EditionFeaturesProvider>
                  <PermissionsProvider>{children}</PermissionsProvider>
                </EditionFeaturesProvider>
              </ToastProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
