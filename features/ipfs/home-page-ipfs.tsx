import { FC, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  getPathWithoutFirstSlash,
  HOME_PATH,
  REWARDS_PATH,
  SETTINGS_PATH,
  WITHDRAWALS_PATH,
  WITHDRAWALS_REQUEST_PATH,
  WRAP_PATH,
  REFERRAL_PATH,
} from 'config/urls';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { usePrefixedReplace } from 'shared/hooks/use-prefixed-history';
import { StakePage } from 'features/stake';
import WrapPage from 'pages/wrap/[[...mode]]';
import WithdrawalsPage from 'pages/withdrawals/[mode]';
import ReferralPage from 'pages/referral';
import RewardsPage from 'pages/rewards';
import SettingsPage from 'pages/settings';
import { FaqWithMeta } from 'utils/faq';

/**
 * We are using single index.html endpoint
 * with hash-based routing in ipfs build mode.
 * It is necessary because ipfs infrastructure does not support
 * redirects to make dynamic routes workable.
 */

const IPFS_ROUTABLE_PAGES = [
  // HOME_PATH not need here
  getPathWithoutFirstSlash(WRAP_PATH),
  getPathWithoutFirstSlash(WITHDRAWALS_PATH),
  getPathWithoutFirstSlash(REWARDS_PATH),
  getPathWithoutFirstSlash(REFERRAL_PATH),
  getPathWithoutFirstSlash(SETTINGS_PATH),
];

export type HomePageIpfsProps = {
  faqWithMetaStakePage: FaqWithMeta | null;
  faqWithMetaWrapPage: FaqWithMeta | null;
  faqWithMetaWithdrawalsPageRequest: FaqWithMeta | null;
  faqWithMetaWithdrawalsPageClaim: FaqWithMeta | null;
};

const HomePageIpfs: FC<HomePageIpfsProps> = ({
  faqWithMetaStakePage,
  faqWithMetaWrapPage,
  faqWithMetaWithdrawalsPageRequest,
  faqWithMetaWithdrawalsPageClaim,
}) => {
  const router = useRouter();
  const { asPath } = router;

  const replace = usePrefixedReplace();

  const parsedPath = useMemo(() => {
    const hashPath = asPath.split('#')[1];
    if (!hashPath) return [];
    return hashPath.split('/').splice(1);
  }, [asPath]);

  useEffect(() => {
    if (
      parsedPath[0] === getPathWithoutFirstSlash(WITHDRAWALS_PATH) &&
      !parsedPath[1]
    ) {
      void replace(
        WITHDRAWALS_REQUEST_PATH,
        router.query as Record<string, string>,
      );
    }

    if (parsedPath[0] && !IPFS_ROUTABLE_PAGES.includes(parsedPath[0])) {
      void replace(HOME_PATH, router.query as Record<string, string>);
    }
  }, [replace, parsedPath, router.query]);

  /**
   * TODO:
   * We can upgrade this routing algorithm with a `match` method
   * and router config if we will need more functionality
   * Example: https://v5.reactrouter.com/web/api/match
   */
  let spaPage;
  switch (parsedPath[0]) {
    case getPathWithoutFirstSlash(WRAP_PATH): {
      if (parsedPath[1] === 'unwrap') {
        spaPage = (
          <WrapPage mode={'unwrap'} faqWithMeta={faqWithMetaWrapPage} />
        );
      } else {
        spaPage = <WrapPage mode={'wrap'} faqWithMeta={faqWithMetaWrapPage} />;
      }
      break;
    }

    case getPathWithoutFirstSlash(WITHDRAWALS_PATH): {
      if (parsedPath[1] === 'claim') {
        spaPage = (
          <WithdrawalsPage
            mode={'claim'}
            faqWithMetaWithdrawalsPageClaim={faqWithMetaWithdrawalsPageClaim}
            faqWithMetaWithdrawalsPageRequest={
              faqWithMetaWithdrawalsPageRequest
            }
          />
        );
      } else {
        spaPage = (
          <WithdrawalsPage
            mode={'request'}
            faqWithMetaWithdrawalsPageClaim={faqWithMetaWithdrawalsPageClaim}
            faqWithMetaWithdrawalsPageRequest={
              faqWithMetaWithdrawalsPageRequest
            }
          />
        );
      }
      break;
    }

    case getPathWithoutFirstSlash(REWARDS_PATH): {
      spaPage = <RewardsPage />;
      break;
    }

    case getPathWithoutFirstSlash(REFERRAL_PATH): {
      spaPage = <ReferralPage />;
      break;
    }

    case getPathWithoutFirstSlash(SETTINGS_PATH): {
      spaPage = <SettingsPage />;
      break;
    }

    default: {
      spaPage = <StakePage faqWithMeta={faqWithMetaStakePage} />;
    }
  }

  // Fix for runtime of `dev-ipfs` (see: package.json scripts)
  return <NoSSRWrapper>{spaPage}</NoSSRWrapper>;
};

export default HomePageIpfs;
