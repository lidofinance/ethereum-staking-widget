import type { FC } from 'react';
import invariant from 'tiny-invariant';

import { NavigationLink } from './navigation-link';
import type { PageRoute } from './types';
import { getAriaCurrent, isRouteActive } from './utils';
import { createRemountTransition } from './use-remount-transition';
import {
  SubNavigationAnchor,
  SubNavigationLink,
  SubNavigationRow,
} from './styles';

type SubNavigationProps = {
  route: PageRoute;
  isActive: boolean;
  currentPath: string;
};

const useRowExpanded = createRemountTransition<boolean>();

/**
 * Section link with its sub-routes row, shown while the section is active.
 */
export const SubNavigation: FC<SubNavigationProps> = ({
  route,
  isActive,
  currentPath,
}) => {
  invariant(route.subRoutes, 'SubNavigation requires subRoutes');
  const primaryPath = route.subRoutes[0]?.path;
  invariant(primaryPath, 'SubNavigation requires a primary path');
  const isRowExpanded = useRowExpanded(isActive) === true;

  return (
    <SubNavigationAnchor>
      <NavigationLink
        route={{ ...route, path: primaryPath, subRoutes: undefined }}
        isActive={isActive}
      />
      <SubNavigationRow
        aria-label={route.name}
        aria-hidden={!isActive}
        $expanded={isRowExpanded}
        data-testid="stakeNavList"
      >
        {route.subRoutes.map((subRoute) => {
          invariant(subRoute.path, 'SubRoute requires a path');
          return (
            <SubNavigationLink
              key={subRoute.path}
              href={subRoute.path}
              aria-current={getAriaCurrent(
                isRouteActive(subRoute, currentPath),
              )}
              tabIndex={isActive ? undefined : -1}
              data-testid={`subRouteRow=${subRoute.path}`}
            >
              {subRoute.icon}
              {subRoute.name}
            </SubNavigationLink>
          );
        })}
      </SubNavigationRow>
    </SubNavigationAnchor>
  );
};
