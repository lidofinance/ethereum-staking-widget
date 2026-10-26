import { type FC, useEffect, useMemo, useState, Fragment } from 'react';
import { useRouter } from 'next/router';

import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';

import {
  HOME_PATH,
  WRAP_PATH,
  WITHDRAWALS_REQUEST_PATH,
  REWARDS_PATH,
  WITHDRAWALS_PATH,
  SWAP_PATH,
} from 'consts/urls';

import { useConfig } from 'config';
import { useRouterPath } from 'shared/hooks/use-router-path';
import { NavIconEarn } from 'assets/earn';
import { ReactComponent as NavIconSwap } from 'assets/icons/nav-icon-swap.svg';

import { SubNavigation } from './sub-navigation';

import { MobileNavigationBar } from './mobile-navigation-bar';
import { NavigationLink } from './navigation-link';
import { Nav } from './styles';

import {
  filterAvailableRoutes,
  flattenSingleSection,
  sanitizePath,
  isRouteActive,
} from './utils';
import type { PageRoute } from './types';

const routes: PageRoute[] = [
  {
    name: 'Stake',
    icon: <Stake data-testid="navStake" />,
    subRoutes: [
      {
        name: 'Stake',
        path: HOME_PATH,
        icon: <Stake data-testid="navStake" />,
      },
      {
        name: 'Wrap',
        menuName: 'Wrap & Unwrap',
        path: WRAP_PATH,
        icon: <Wrap data-testid="navWrap" />,
      },
      {
        name: 'Withdrawals',
        path: WITHDRAWALS_REQUEST_PATH,
        rootActivePath: WITHDRAWALS_PATH,
        icon: <Withdraw data-testid="navWithdrawals" />,
      },
      {
        name: 'Rewards',
        path: REWARDS_PATH,
        icon: <Wallet data-testid="navRewards" />,
      },
    ],
  },
  {
    name: 'Earn',
    path: '/earn',
    icon: <NavIconEarn data-testid="navEarn" />,
  },
  {
    name: 'Swap',
    path: SWAP_PATH,
    icon: <NavIconSwap data-testid="navSwap" />,
  },
];

const useNavigation = () => {
  const pathname = useRouterPath();
  const {
    externalConfig: { pages },
  } = useConfig();

  const availableRoutes = useMemo(() => {
    return flattenSingleSection(filterAvailableRoutes(routes, pages));
  }, [pages]);

  const pathnameWithoutQuery = sanitizePath(pathname);
  // URL product params are read only once the router is ready;
  // set in an effect, so the first client render matches the server one
  const { isReady } = useRouter();
  const [isPending, setIsPending] = useState(true);
  useEffect(() => setIsPending(!isReady), [isReady]);

  return {
    availableRoutes,
    pathnameWithoutQuery,
    isPending,
  };
};

export const MobileNavigation: FC = () => {
  const { availableRoutes, pathnameWithoutQuery, isPending } = useNavigation();

  return (
    <MobileNavigationBar
      routes={availableRoutes}
      currentPath={pathnameWithoutQuery}
      isPending={isPending}
    />
  );
};

export const Navigation: FC = () => {
  const { availableRoutes, pathnameWithoutQuery, isPending } = useNavigation();

  return (
    <Nav $isPending={isPending}>
      {availableRoutes.map((route) => {
        const isActive = isRouteActive(route, pathnameWithoutQuery);

        return (
          <Fragment key={route.path ?? route.name}>
            {'subRoutes' in route ? (
              <SubNavigation
                route={route}
                isActive={isActive}
                currentPath={pathnameWithoutQuery}
              />
            ) : (
              <NavigationLink route={route} isActive={isActive} />
            )}
          </Fragment>
        );
      })}
    </Nav>
  );
};
