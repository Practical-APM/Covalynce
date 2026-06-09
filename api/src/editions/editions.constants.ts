/** Commercial capabilities gated on Community Edition orgs */
export const ENTERPRISE_FEATURES = [
  'sso',
  'compliance_export',
  'multi_org',
  'rbac_overrides',
] as const;

export type EnterpriseFeature = (typeof ENTERPRISE_FEATURES)[number];

export const ENTERPRISE_FEATURE_LABELS: Record<EnterpriseFeature, string> = {
  sso: 'Single sign-on (SSO)',
  compliance_export: 'Compliance export bundle',
  multi_org: 'Multi-workspace switching',
  rbac_overrides: 'Custom RBAC permission overrides',
};
