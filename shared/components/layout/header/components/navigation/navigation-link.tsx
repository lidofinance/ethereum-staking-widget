import invariant from 'tiny-invariant';

import { Link } from 'shared/components/link';

import { NavLink } from './styles';
import type { PageRoute } from './types';

type NavigationLinkProps = {
  route: PageRoute;
  isActive: boolean;
};
export const NavigationLink = ({ route, isActive }: NavigationLinkProps) => {
  invariant(route.path, 'NavigationLink requires a route with a path');
  return (
    <Link href={route.path} aria-current={isActive ? 'page' : undefined}>
      <NavLink $active={isActive} $showNew={route.showNew}>
        {route.icon}
        <span>{route.name}</span>
      </NavLink>
    </Link>
  );
};
