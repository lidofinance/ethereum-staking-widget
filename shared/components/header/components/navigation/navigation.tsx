import { FC, memo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';

import { Nav, NavLink } from './styles';
import { LocalLink } from './local-link';

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
      {routes.map(({ name, path, icon, exact }) => (
        <LocalLink key={path} href={path}>
          <NavLink
            active={
              exact
                ? router.pathname === path
                : router.pathname.startsWith(path)
            }
          >
            {icon}
            <span>{name}</span>
          </NavLink>
        </LocalLink>
      ))}
    </Nav>
  );
});
