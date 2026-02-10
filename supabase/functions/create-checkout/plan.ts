const LEGACY_PLAN_ALIASES: Record<string, string> = {
  easyplus: 'nearvityplus',
};

export const normalizeCheckoutPlan = (plan?: string): string => {
  if (!plan) return 'nearvityplus';
  return LEGACY_PLAN_ALIASES[plan] ?? plan;
};
