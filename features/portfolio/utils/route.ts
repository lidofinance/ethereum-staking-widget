export const OVERVIEW_TAB = 'overview';
export const ACTIVITY_TAB = 'activity';
export const TOKEN_SEGMENT = 'token';

export type PortfolioTab = typeof OVERVIEW_TAB | typeof ACTIVITY_TAB;

export type PortfolioView = { tab: PortfolioTab; tokenId: string | null };

// /portfolio, /portfolio/activity, /portfolio/token/{id}; null for anything else
export const parsePortfolioSlug = (
  slug: string[] | undefined,
): PortfolioView | null => {
  if (!slug || slug.length === 0) return { tab: OVERVIEW_TAB, tokenId: null };
  if (slug.length === 1 && slug[0] === ACTIVITY_TAB) {
    return { tab: ACTIVITY_TAB, tokenId: null };
  }
  if (slug.length === 2 && slug[0] === TOKEN_SEGMENT && slug[1]) {
    return { tab: OVERVIEW_TAB, tokenId: slug[1] };
  }
  return null;
};
