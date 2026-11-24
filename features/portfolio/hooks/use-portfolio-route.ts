import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import {
  ACTIVITY_TAB,
  OVERVIEW_TAB,
  TOKEN_SEGMENT,
  parsePortfolioSlug,
  type PortfolioTab,
} from '../utils/route';

export { ACTIVITY_TAB, OVERVIEW_TAB, type PortfolioTab };

// /portfolio, /portfolio/activity, /portfolio/token/{id}: the tab and the drawer live in the URL
export const usePortfolioRoute = () => {
  const router = useRouter();
  const { slug, ...query } = router.query;
  // other paths are a 404 page, so they never get here
  const { tab, tokenId } = parsePortfolioSlug(
    Array.isArray(slug) ? slug : undefined,
  ) ?? { tab: OVERVIEW_TAB, tokenId: null };

  // product params and the like stay in the URL while switching views
  const navigateToSlug = useCallback(
    (nextSlug: string[], shouldReplace = false) =>
      void router[shouldReplace ? 'replace' : 'push'](
        { pathname: router.pathname, query: { ...query, slug: nextSlug } },
        undefined,
        { shallow: true, scroll: false },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.pathname, JSON.stringify(query)],
  );

  return useMemo(
    () => ({
      tab,
      tokenId,
      openTab: (nextTab: PortfolioTab) =>
        navigateToSlug(nextTab === ACTIVITY_TAB ? [ACTIVITY_TAB] : []),
      openToken: (openedTokenId: string) =>
        navigateToSlug([TOKEN_SEGMENT, openedTokenId]),
      closeToken: () => navigateToSlug([]),
      // a link to a token the wallet does not hold leaves no history entry
      dropToken: () => navigateToSlug([], true),
    }),
    [tab, tokenId, navigateToSlug],
  );
};
