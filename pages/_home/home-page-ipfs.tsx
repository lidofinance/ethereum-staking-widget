import { FC, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';

import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { usePrefixedReplace } from 'shared/hooks/use-prefixed-history';

import HomePageRegular from './home-page-regular';
import WrapPage from '../wrap/[[...mode]]';
import WithdrawalsPage from '../withdrawals/[mode]';
import ReferralPage from '../referral';
import RewardsPage from '../rewards';

/**
 * We are using single index.html endpoint
 * with hash-based routing in ipfs build mode.
 * It is necessary because ipfs infrastructure does not support
 * redirects to make dynamic routes workable.
 */

const IPFS_ROUTABLE_PAGES = [
  'index',
  'wrap',
  'withdrawals',
  'rewards',
  'referral',
  'settings',
];

const HomePageIpfs: FC = () => {
  const router = useRouter();
  const { asPath } = router;

  const replace = usePrefixedReplace();

  const parsedPath = useMemo(() => {
    const hashPath = asPath.split('#')[1];
    if (!hashPath) return [];
    return hashPath.split('/').splice(1);
  }, [asPath]);

  useEffect(() => {
    if (parsedPath[0] === 'withdrawals' && !parsedPath[1]) {
      void replace('/withdrawals/request');
    }

    if (parsedPath[0] && !IPFS_ROUTABLE_PAGES.includes(parsedPath[0])) {
      void replace('/');
    }
  }, [replace, parsedPath]);

  /**
   * TODO:
   * We can upgrade this routing algorithm with a `match` method
   * and router config if we will need more functionality
   * Example: https://v5.reactrouter.com/web/api/match
   */
  let spaPage;
  switch (parsedPath[0]) {
    case 'stake': {
      spaPage = <HomePageRegular />;
      break;
    }

    case 'wrap': {
      if (parsedPath[1] === 'unwrap') {
        spaPage = <WrapPage mode={'unwrap'} />;
      } else {
        spaPage = <WrapPage mode={'wrap'} />;
      }
      break;
    }

    case 'withdrawals': {
      if (parsedPath[1] === 'claim') {
        spaPage = <WithdrawalsPage mode={'claim'} />;
      } else {
        spaPage = <WithdrawalsPage mode={'request'} />;
      }
      break;
    }

    case 'rewards': {
      spaPage = <RewardsPage />;
      break;
    }

    case 'referral': {
      spaPage = <ReferralPage />;
      break;
    }

    default: {
      spaPage = <HomePageRegular />;
    }
  }

  // TODO: fix for runtime of `dev-ipfs` (see: package.json scripts)
  return <NoSSRWrapper>{spaPage}</NoSSRWrapper>;
};

export default HomePageIpfs;
