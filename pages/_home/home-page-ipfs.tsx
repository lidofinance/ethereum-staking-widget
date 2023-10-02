import { FC, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';

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
  switch (parsedPath[0]) {
    case 'stake': {
      return <HomePageRegular />;
    }

    case 'wrap': {
      if (parsedPath[1] === 'unwrap') {
        return <WrapPage mode={'unwrap'} />;
      } else {
        return <WrapPage mode={'wrap'} />;
      }
    }

    case 'withdrawals': {
      if (parsedPath[1] === 'claim') {
        return <WithdrawalsPage mode={'claim'} />;
      } else {
        return <WithdrawalsPage mode={'request'} />;
      }
    }

    case 'rewards': {
      return <RewardsPage />;
    }

    case 'referral': {
      return <ReferralPage />;
    }

    default: {
      return <HomePageRegular />;
    }
  }
};

export default HomePageIpfs;
