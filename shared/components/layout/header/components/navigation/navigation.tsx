import { type FC, useMemo, Fragment } from 'react';

import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';

import {
  HOME_PATH,
  WRAP_PATH,
  WITHDRAWALS_REQUEST_PATH,
  REWARDS_PATH,
  WITHDRAWALS_PATH,
} from 'consts/urls';
import { useConfig } from 'config';
import { useRouterPath } from 'shared/hooks/use-router-path';
import { NavIconEarn } from 'assets/earn';

import { SubNavigation } from './sub-navigation';

import { MobileSubNavigation } from './mobile-sub-navigation';
import { NavigationLink } from './navigation-link';
import { Nav } from './styles';

import { filterAvailableRoutes, sanitizePath, isRouteActive } from './utils';
import type { PageRoute } from './types';

const routes: PageRoute[] = [
  {
    name: 'Staking',
    icon: <Stake data-testid="navStake" />,
    subRoutes: [
      {
        name: 'Stake',
        path: HOME_PATH,
        icon: <Stake data-testid="navStake" />,
      },
      {
        name: 'Wrap',
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
];

const useNavigation = () => {
  const pathname = useRouterPath();
  const {
    externalConfig: { pages },
  } = useConfig();

  const availableRoutes = useMemo(() => {
    return filterAvailableRoutes(routes, pages);
  }, [pages]);

  const pathnameWithoutQuery = sanitizePath(pathname);

  const activeNestedRoute = useMemo(() => {
    return availableRoutes.find(
      (route) =>
        isRouteActive(route, pathnameWithoutQuery) && 'subRoutes' in route,
    );
  }, [availableRoutes, pathnameWithoutQuery]);

  return {
    availableRoutes,
    activeNestedRoute,
    pathnameWithoutQuery,
  };
};

export const MobileSliderNavigation: FC = () => {
  const { activeNestedRoute, pathnameWithoutQuery } = useNavigation();

  if (!activeNestedRoute) {
    return null;
  }

  return (
    <MobileSubNavigation
      route={activeNestedRoute}
      currentPath={pathnameWithoutQuery}
    />
  );
};

export const Navigation: FC = () => {
  const { availableRoutes, pathnameWithoutQuery } = useNavigation();

  return (
    <Nav>
      {availableRoutes.map((route) => {
        const isActive = isRouteActive(route, pathnameWithoutQuery);

        return (
          <Fragment key={route.path}>
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
