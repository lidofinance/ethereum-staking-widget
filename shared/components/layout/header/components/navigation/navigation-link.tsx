import invariant from 'tiny-invariant';

import { LocalLink } from 'shared/components/local-link';

import { NavLink } from './styles';
import type { PageRoute } from './types';

type NavigationLinkProps = {
  route: PageRoute;
  isActive: boolean;
};
export const NavigationLink = ({ route, isActive }: NavigationLinkProps) => {
  invariant(route.path, 'NavigationLink requires a route with a path');
  return (
    <LocalLink href={route.path}>
      <NavLink active={isActive} showNew={route.showNew}>
        {route.icon}
        <span>{route.name}</span>
      </NavLink>
    </LocalLink>
  );
};
