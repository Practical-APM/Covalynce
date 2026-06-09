"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LandingButton } from "@/components/landing/landing-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#problem", label: "Problem" },
  { href: "#product", label: "Product" },
  { href: "#platform", label: "Platform" },
  { href: "#integrations", label: "Integrations" },
  { href: "/help", label: "Docs" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled ? "border-border/80 bg-background/90 backdrop-blur-md" : "border-transparent bg-background/80"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandLogo size="sm" href="/" showWordmark animated className="[&_span]:text-xl" />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="landing-nav-link text-[13px] font-medium text-muted-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <LandingButton href="/onboarding" className="h-9 px-4 py-2 text-xs">
            Start free
            <ArrowRight className="size-3.5" />
          </LandingButton>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <nav className="border-t border-border/60 px-5 py-4 md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle variant="outline" size="sm" />
          </div>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              {l.label}
            </a>
          ))}
          <LandingButton href="/onboarding" className="mt-4 w-full">
            Start free
          </LandingButton>
        </nav>
      )}
    </header>
  );
}
