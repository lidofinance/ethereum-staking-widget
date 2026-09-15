import { useRef, useState, type FC } from 'react';
import type { PageRoute } from './types';
import invariant from 'tiny-invariant';
import { PopoverNoClickBackdrop, useClickOutside } from '../popup';
import { NavigationDropDownMenu } from './styles';

import { isRouteActive } from './utils';
import {
  NavigationDropDownArrow,
  NavigationDropDownButton,
  NavigationDropDownLink,
  NavLink,
} from './styles';

type SubNavigationProps = {
  route: PageRoute;
  isActive: boolean;
  currentPath: string;
};

/**
 * SubNavigation component renders a dropdown menu for sub-routes of a given route.
 */
export const SubNavigation: FC<SubNavigationProps> = ({
  route,
  isActive,
  currentPath,
}) => {
  invariant(route.subRoutes, 'SubNavigation requires subRoutes');
  const [opened, setOpened] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  useClickOutside(popupRef, () => setOpened(false));

  return (
    <>
      <PopoverNoClickBackdrop $backdrop={opened} />
      <NavigationDropDownButton ref={popupRef}>
        <NavLink active={isActive} onClick={() => setOpened(!opened)}>
          {route.icon}
          <span>{route.name}</span>
          <NavigationDropDownArrow
            data-testid="nav-canExpanded"
            $opened={opened}
          />
        </NavLink>
        <NavigationDropDownMenu data-testid="chainList" $opened={opened}>
          {route.subRoutes.map((subRoute) => {
            const isSubRouteActive = isRouteActive(subRoute, currentPath);
            invariant(subRoute.path, 'SubRoute requires a path');
            return (
              <NavigationDropDownLink
                data-testid={`subRouteRow=${subRoute.path}`}
                key={subRoute.path}
                onClick={() => setOpened(false)}
                $active={isSubRouteActive}
                href={subRoute.path}
              >
                {subRoute.name}
              </NavigationDropDownLink>
            );
          })}
        </NavigationDropDownMenu>
      </NavigationDropDownButton>
    </>
  );
};
