export type PortfolioEntry = [string, number, number];
export const PORTFOLIO_TIER_ORDER = ['tier-2', 'tier-1', 'tier0', 'tier1'] as const;
export type PortfolioTier = (typeof PORTFOLIO_TIER_ORDER)[number];
export type PortfolioTiers = {
  'tier-2'?: PortfolioEntry[];
  'tier-1'?: PortfolioEntry[];
  tier0: PortfolioEntry[];
  tier1: PortfolioEntry[];
};
export type Photo = { i: number; src: string; w: number; h: number; landscape: boolean; star: boolean; tier: PortfolioTier };

/** Priority is independent of storage: promoted film photos keep their existing URLs. */
export const portfolioImageTier = (tier: PortfolioTier) => tier === 'tier-2' ? 'tier-1' : tier;

/** Preserve saved order within tiers and highlight only the highest populated tier. */
export function portfolioPhotos(tiers: PortfolioTiers): Photo[] {
  const highest = PORTFOLIO_TIER_ORDER.find((tier) => tiers[tier]?.length);
  return PORTFOLIO_TIER_ORDER.flatMap((tier) =>
    (tiers[tier] ?? []).map(([src, w, h]) => ({ src, w, h, landscape: w > h, star: tier === highest, tier }))
  ).map((photo, i) => ({ ...photo, i }));
}
