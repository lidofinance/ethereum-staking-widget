import { FC, memo, useMemo } from 'react';
import { Wallet, Stake, Wrap, Withdraw } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';

import { Nav, NavLink } from './styles';
import { LocalLink } from './local-link';
import { useConnectorInfo } from 'reef-knot/web3-react';
import { useAppFlag } from 'shared/hooks/useAppFlag';

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
  // TODO: remove when ledger live fixes their issue
  const appFlag = useAppFlag();
  const { isLedgerLive } = useConnectorInfo();
  const shouldHideWithdrawals = appFlag === 'ledger-live' || isLedgerLive;
  const router = useRouter();
  const _routes = useMemo(() => {
    if (shouldHideWithdrawals)
      return routes.filter((r) => r.path !== '/withdrawals');
    return routes;
  }, [shouldHideWithdrawals]);
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
