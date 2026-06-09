"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { api } from "@/lib/api";
import {
  ENTERPRISE_FEATURES,
  type EditionFeaturesResponse,
  type EnterpriseFeature,
} from "@/lib/edition-features";
import { planToEdition } from "@/lib/editions";

interface EditionFeaturesContextValue {
  loading: boolean;
  flags: EditionFeaturesResponse | null;
  hasEnterpriseFeature: (feature: EnterpriseFeature) => boolean;
  refreshEditionFeatures: () => Promise<void>;
}

const EditionFeaturesContext =
  createContext<EditionFeaturesContextValue | null>(null);

function mockFlagsFromSession(
  plan?: string | null
): EditionFeaturesResponse {
  const edition = planToEdition(plan);
  const enterprise = edition === "enterprise";
  return {
    edition,
    deploymentEdition: edition,
    licensed: false,
    features: Object.fromEntries(
      ENTERPRISE_FEATURES.map((f) => [f, enterprise])
    ) as EditionFeaturesResponse["features"],
  };
}

export function EditionFeaturesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, apiMode } = useAuth();
  const [flags, setFlags] = useState<EditionFeaturesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshEditionFeatures = useCallback(async () => {
    if (!session) {
      setFlags(null);
      return;
    }
    if (!apiMode) {
      setFlags(mockFlagsFromSession(session.organization?.plan));
      return;
    }
    setLoading(true);
    try {
      setFlags(await api.editionFeatures());
    } catch {
      setFlags(mockFlagsFromSession(session.organization?.plan));
    } finally {
      setLoading(false);
    }
  }, [apiMode, session]);

  useLoadEffect(refreshEditionFeatures, [refreshEditionFeatures]);

  const hasEnterpriseFeature = useCallback(
    (feature: EnterpriseFeature) => {
      if (!session) return false;
      const map = flags ?? mockFlagsFromSession(session.organization?.plan);
      return map.features[feature] ?? false;
    },
    [flags, session]
  );

  const value = useMemo(
    () => ({
      loading,
      flags,
      hasEnterpriseFeature,
      refreshEditionFeatures,
    }),
    [loading, flags, hasEnterpriseFeature, refreshEditionFeatures]
  );

  return (
    <EditionFeaturesContext.Provider value={value}>
      {children}
    </EditionFeaturesContext.Provider>
  );
}

export function useEditionFeatures() {
  const ctx = useContext(EditionFeaturesContext);
  if (!ctx) {
    throw new Error(
      "useEditionFeatures must be used within EditionFeaturesProvider"
    );
  }
  return ctx;
}
