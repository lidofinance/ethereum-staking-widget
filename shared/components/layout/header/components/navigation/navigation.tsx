import { FC, memo, useMemo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';

import {
  HOME_PATH,
  WRAP_PATH,
  WITHDRAWALS_REQUEST_PATH,
  WITHDRAWALS_CLAIM_PATH,
  REWARDS_PATH,
  getPathWithoutFirstSlash,
} from 'consts/urls';
import { useConfig } from 'config';
import { ManifestConfigPage } from 'config/external-config';
import { LocalLink } from 'shared/components/local-link';
import { useRouterPath } from 'shared/hooks/use-router-path';
import { NavIconEarn } from 'assets/earn';

import { Nav, NavLink } from './styles';

type PageRoute = {
  name: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
  full_path?: string;
  subPaths?: string[];
  showNew?: boolean;
};

const routes: PageRoute[] = [
  {
    name: 'Stake',
    path: HOME_PATH,
    icon: <Stake data-testid="navStake" />,
    exact: true,
  },
  {
    name: 'Earn',
    path: '/earn',
    icon: <NavIconEarn data-testid="navEarn" />,
  },
  {
    name: 'Wrap',
    path: WRAP_PATH,
    icon: <Wrap data-testid="navWrap" />,
  },
  {
    name: 'Withdrawals',
    path: WITHDRAWALS_REQUEST_PATH,
    full_path: WITHDRAWALS_REQUEST_PATH,
    subPaths: [WITHDRAWALS_CLAIM_PATH],
    icon: <Withdraw data-testid="navWithdrawals" />,
  },
  {
    name: 'Rewards',
    path: REWARDS_PATH,
    icon: <Wallet data-testid="navRewards" />,
  },
];

export const Navigation: FC = memo(() => {
  const pathname = useRouterPath();
  const {
    externalConfig: { pages },
  } = useConfig();

  const availableRoutes = useMemo(() => {
    if (!pages) return routes;

    const paths = Object.keys(pages) as ManifestConfigPage[];
    return routes
      .filter((route) => {
        const path = paths.find((path) => route.path.includes(path));
        if (!path) return true;
        return !pages[path]?.shouldDisable;
      })
      .map((route) => {
        const path = paths.find((path) => route.path.includes(path));
        return {
          ...route,
          showNew: !!path && pages[path]?.showNew,
        };
      });
  }, [pages]);

  let pathnameWithoutQuery = pathname.split('?')[0];
  if (pathnameWithoutQuery[pathnameWithoutQuery.length - 1] === '/') {
    // Remove last '/'
    pathnameWithoutQuery = pathnameWithoutQuery.slice(0, -1);
  }

  return (
    <Nav>
      {availableRoutes.map(({ name, path, subPaths, icon, showNew }) => {
        const isActive =
          pathnameWithoutQuery === getPathWithoutFirstSlash(path) ||
          (path.length > 1 && pathnameWithoutQuery.startsWith(path)) ||
          (Array.isArray(subPaths) &&
            subPaths?.indexOf(pathnameWithoutQuery) > -1);

        return (
          <LocalLink key={path} href={path}>
            <NavLink active={isActive} showNew={showNew}>
              {icon}
              <span>{name}</span>
            </NavLink>
          </LocalLink>
        );
      })}
    </Nav>
  );
});
