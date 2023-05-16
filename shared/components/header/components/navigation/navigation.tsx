import { FC, memo, useMemo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';

import { Nav, NavLink } from './styles';
import { LocalLink } from './local-link';
import { useConnectorInfo } from 'reef-knot/web3-react';

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
  // TODO: remove when ledger live fixes their issue
  const { isLedgerLive } = useConnectorInfo();
  const _routes = useMemo(() => {
    if (isLedgerLive) return routes.filter((r) => r.path !== '/withdrawals');
    return routes;
  }, [isLedgerLive]);
  return (
    <Nav>
      {_routes.map(({ name, path, icon }) => (
        <LocalLink key={path} href={path}>
          <NavLink active={router.pathname === path}>
            {icon}
            <span>{name}</span>
          </NavLink>
        </LocalLink>
      ))}
    </Nav>
  );
});
