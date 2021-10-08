import { History, Stake, Wrap } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';
import { FC, memo } from 'react';
import { LocalLink } from './localLink';
import { Nav, NavLink } from './navigationStyles';

const getRoutes = () => {
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
      name: 'History',
      path: '/rewards',
      icon: <History />,
    },
    // TODO: delete?
    // {
    //   name: 'Referral',
    //   path: '/referral',
    //   icon: <Referral />,
    // },
  ];

  // if (DEPOSIT_PAGE) {
  //   routes.push({
  //     name: 'Deposit',
  //     path: '/deposit',
  //     icon: <Deposit />,
  //   });
  // }

  return routes;
};

const Navigation: FC = () => {
  const router = useRouter();

  return (
    <Nav>
      {getRoutes().map(({ name, path, icon }) => (
        <LocalLink key={path} href={path}>
          <NavLink active={router.pathname === path}>
            {icon}
            <span>{name}</span>
          </NavLink>
        </LocalLink>
      ))}
    </Nav>
  );
};

export default memo(Navigation);
