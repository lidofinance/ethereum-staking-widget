import { FC, memo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';
import { dynamics } from 'config';

import { Nav, NavLink } from './styles';

const routes = [
  {
    name: 'Stake',
    path: '/',
    icon: <Stake />,
  },
  {
    name: 'Wrap',
    path: '/wrap',
    icon: <Wrap />,
  },
  ...(dynamics.defaultChain !== 1
    ? [
        {
          name: 'Withdrawals',
          path: '/withdrawals',
          icon: <Withdraw />,
        },
      ]
    : []),
  {
    name: 'Rewards',
    path: '/rewards',
    icon: <Wallet />,
  },
];
export const Navigation: FC = memo(() => {
  const router = useRouter();

  const queryString = new URLSearchParams(
    router.query as Record<string, string>,
  ).toString();

  return (
    <Nav>
      {routes.map(({ name, path, icon }) => (
        <NavLink
          key={path}
          href={`${path}${queryString ? `?${queryString}` : ''}`}
          active={router.pathname === path}
        >
          {icon}
          <span>{name}</span>
        </NavLink>
      ))}
    </Nav>
  );
});
