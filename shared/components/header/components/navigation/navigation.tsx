import { Wallet, Stake, Wrap } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';
import { FC, memo } from 'react';
import { LocalLink } from './local-link';
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
      {routes.map(({ name, path, icon }) => (
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
