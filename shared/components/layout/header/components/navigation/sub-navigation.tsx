import type { FC } from 'react';
import invariant from 'tiny-invariant';

import { PopoverNoClickBackdrop, usePopupMenu } from '../popup';
import type { PageRoute } from './types';
import { isRouteActive } from './utils';
import {
  NavigationDropDownArrow,
  NavigationDropDownButton,
  NavigationDropDownIcon,
  NavigationDropDownLink,
  NavigationDropDownMenu,
  NavigationDropDownTrigger,
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
  const {
    opened,
    close,
    wrapperProps,
    triggerProps,
    menuProps,
    backdropProps,
  } = usePopupMenu({
    mode: 'link',
    persistKey: route.name,
  });

  const primaryPath = route.subRoutes[0]?.path;
  invariant(primaryPath, 'SubNavigation requires a primary path');

  return (
    <NavigationDropDownButton {...wrapperProps}>
      <PopoverNoClickBackdrop {...backdropProps} />
      <NavigationDropDownTrigger href={primaryPath} {...triggerProps}>
        <NavLink active={isActive}>
          {route.icon}
          <span>{route.name}</span>
          <NavigationDropDownArrow
            data-testid="nav-canExpanded"
            $opened={opened}
          />
        </NavLink>
      </NavigationDropDownTrigger>
      <NavigationDropDownMenu
        data-testid="stakeNavList"
        $opened={opened}
        {...menuProps}
      >
        {route.subRoutes.map((subRoute) => {
          const isSubRouteActive = isRouteActive(subRoute, currentPath);
          invariant(subRoute.path, 'SubRoute requires a path');
          return (
            <NavigationDropDownLink
              data-testid={`subRouteRow=${subRoute.path}`}
              key={subRoute.path}
              onClick={close}
              $active={isSubRouteActive}
              href={subRoute.path}
            >
              <NavigationDropDownIcon>{subRoute.icon}</NavigationDropDownIcon>
              {subRoute.name}
            </NavigationDropDownLink>
          );
        })}
      </NavigationDropDownMenu>
    </NavigationDropDownButton>
  );
};
