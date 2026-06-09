"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AuthFlowShell } from "@/components/auth/auth-flow-shell";
import { LinkButton } from "@/components/link-button";
import { fadeUp } from "@/lib/motion";

export default function SignupPage() {
  const reduce = useReducedMotion();

  return (
    <AuthFlowShell
      headline="Set up AI spend visibility in minutes"
      description="Create your organization, connect providers, and invite teammates. No credit card for the community edition."
      backHref="/login"
      backLabel="Sign in"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-2xl font-semibold tracking-tight"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Create your organization
        </motion.h2>
        <motion.p
          className="mt-2 text-sm text-muted-foreground"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Company name and admin email on the next screen — about two minutes total.
        </motion.p>

        <motion.ul
          className="mt-6 space-y-2 text-sm text-muted-foreground lg:hidden"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          {["Guided 3-step setup", "Demo data in one click", "Help Center built in"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-foreground" />
                {item}
              </li>
            )
          )}
        </motion.ul>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-8"
          whileHover={reduce ? undefined : { scale: 1.01 }}
          whileTap={reduce ? undefined : { scale: 0.99 }}
        >
          <LinkButton className="h-11 w-full shadow-sm" href="/onboarding">
            Continue to setup
            <ArrowRight className="size-4" />
          </LinkButton>
        </motion.div>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have a workspace?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthFlowShell>
  );
}
