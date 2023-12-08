import { FC, memo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';

import {
  HOME_PATH,
  WRAP_PATH,
  WITHDRAWALS_REQUEST_PATH,
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
      {routes.map(({ name, path, icon }) => {
        const isActive =
          pathnameWithoutQuery === path ||
          (path.length > 1 && pathnameWithoutQuery.startsWith(path)) ||
          // fix for withdrawals/claim
          (pathname.indexOf('withdrawals') > -1 &&
            path.indexOf('withdrawals') > -1);

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
