import { FC, memo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';

import { Nav, NavLink } from './styles';
import { LocalLink } from 'shared/components/local-link';

const routes = [
  {
    name: 'Stake',
    path: '/',
    icon: <Stake />,
    exact: true,
  },
  {
    name: 'Wrap',
    path: '/wrap',
    icon: <Wrap />,
  },
  {
    name: 'Withdrawals',
    path: '/withdrawals',
    full_path: '/withdrawals/request',
    icon: <Withdraw />,
  },
  {
    name: 'Rewards',
    path: '/rewards',
    icon: <Wallet />,
  },
];
export const Navigation: FC = memo(() => {
  const router = useRouter();
  return (
    <Nav>
      {routes.map(({ name, path, icon, exact, full_path }) => {
        const href = full_path ?? path;
        const isActive = exact
          ? router.pathname === path
          : router.pathname.startsWith(path);
        return (
          <LocalLink key={path} href={href}>
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
