import { FC, memo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';

import { Nav, NavLink } from './styles';
import { LocalLink } from 'shared/components/local-link';
import { useRouterPath } from 'shared/hooks/use-router-path';

const routes = [
  {
    name: 'Stake',
    path: '/',
    icon: <Stake data-testid="navStake" />,
    exact: true,
  },
  {
    name: 'Wrap',
    path: '/wrap',
    icon: <Wrap data-testid="navWrap" />,
  },
  {
    name: 'Withdrawals',
    path: '/withdrawals',
    full_path: '/withdrawals/request',
    icon: <Withdraw data-testid="navWithdrawals" />,
  },
  {
    name: 'Rewards',
    path: '/rewards',
    icon: <Wallet data-testid="navRewards" />,
  },
];
export const Navigation: FC = memo(() => {
  const pathname = useRouterPath();

  return (
    <Nav>
      {routes.map(({ name, path, icon }) => {
        const isActive =
          pathname === path || (path.length > 1 && pathname.startsWith(path));

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
