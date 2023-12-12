import { FC, memo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';

import {
  HOME_PATH,
  WRAP_PATH,
  WITHDRAWALS_REQUEST_PATH,
  WITHDRAWALS_CLAIM_PATH,
  REWARDS_PATH,
} from 'config/urls';
import { LocalLink } from 'shared/components/local-link';
import { useRouterPath } from 'shared/hooks/use-router-path';

import { Nav, NavLink } from './styles';

const routes = [
  {
    name: 'Stake',
    path: HOME_PATH,
    icon: <Stake data-testid="navStake" />,
    exact: true,
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
  const pathnameWithoutQuery = pathname.split('?')[0];

  return (
    <Nav>
      {routes.map(({ name, path, subPaths, icon }) => {
        const isActive =
          pathnameWithoutQuery === path ||
          (path.length > 1 && pathnameWithoutQuery.startsWith(path)) ||
          (Array.isArray(subPaths) &&
            subPaths?.indexOf(pathnameWithoutQuery) > -1);

        return (
          <LocalLink key={path} href={path}>
            <NavLink active={isActive}>
              {icon}
              <span>{name}</span>
            </NavLink>
          </LocalLink>
        );
      })}
    </Nav>
  );
});
