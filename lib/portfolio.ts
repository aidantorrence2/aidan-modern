export type PortfolioEntry = [string, number, number];
export type PortfolioTier = 'tier-1' | 'tier0' | 'tier1';
export type PortfolioTiers = {
  'tier-1'?: PortfolioEntry[];
  tier0: PortfolioEntry[];
  tier1: PortfolioEntry[];
};
export type Photo = { i: number; src: string; w: number; h: number; landscape: boolean; star: boolean; tier: PortfolioTier };

/** Keep the saved order within each tier; only the user-selected tier gets top billing. */
export function portfolioPhotos(tiers: PortfolioTiers): Photo[] {
  return (['tier-1', 'tier0', 'tier1'] as const).flatMap((tier) =>
    (tiers[tier] ?? []).map(([src, w, h]) => ({ src, w, h, landscape: w > h, star: tier === 'tier-1', tier }))
  ).map((photo, i) => ({ ...photo, i }));
}
