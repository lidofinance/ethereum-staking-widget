import type { FC } from 'react';
import invariant from 'tiny-invariant';

import {
  MobileNav,
  MobileTabIcon,
  MobileTabLink,
  MobileTabs,
  MobileTrack,
  MobileTrackClip,
  MobileTrackCollapse,
  MobileTrackLink,
  MobileTrackPill,
} from './styles';
import { getAriaCurrent, isRouteActive } from './utils';
import { createRemountTransition } from './use-remount-transition';
import type { PageRoute } from './types';

type MobileNavigationBarProps = {
  routes: PageRoute[];
  currentPath: string;
};

const useTrackExpanded = createRemountTransition<boolean>();
const usePillIndex = createRemountTransition<number>();

export const MobileNavigationBar: FC<MobileNavigationBarProps> = ({
  routes,
  currentPath,
}) => {
  const sectionRoute = routes.find((route) => route.subRoutes);
  const isSectionActive =
    !!sectionRoute && isRouteActive(sectionRoute, currentPath);
  const isTrackExpanded = useTrackExpanded(isSectionActive) === true;
  const activeIndex = sectionRoute?.subRoutes?.findIndex((subRoute) =>
    isRouteActive(subRoute, currentPath),
  );
  // keeps the pill in place while the track collapses
  const pillIndex = usePillIndex(
    activeIndex !== undefined && activeIndex >= 0 ? activeIndex : undefined,
  );

  return (
    <MobileNav aria-label="Main">
      {sectionRoute?.subRoutes && (
        <MobileTrackCollapse
          $expanded={isTrackExpanded}
          aria-hidden={!isSectionActive}
        >
          <MobileTrackClip>
            <MobileTrack
              aria-label={sectionRoute.name}
              $count={sectionRoute.subRoutes.length}
            >
              <MobileTrackPill
                $count={sectionRoute.subRoutes.length}
                $index={pillIndex}
              />
              {sectionRoute.subRoutes.map((subRoute) => {
                invariant(subRoute.path, 'SubRoute requires a path');
                return (
                  <MobileTrackLink
                    key={subRoute.path}
                    href={subRoute.path}
                    aria-current={getAriaCurrent(
                      isRouteActive(subRoute, currentPath),
                    )}
                    tabIndex={isSectionActive ? undefined : -1}
                  >
                    {subRoute.name}
                  </MobileTrackLink>
                );
              })}
            </MobileTrack>
          </MobileTrackClip>
        </MobileTrackCollapse>
      )}
      <MobileTabs $count={routes.length}>
        {routes.map((route) => {
          const href = route.path ?? route.subRoutes?.[0]?.path;
          invariant(href, 'Route requires a path or a sub-route');
          return (
            <MobileTabLink
              key={href}
              href={href}
              aria-current={getAriaCurrent(isRouteActive(route, currentPath))}
              $showNew={route.showNew}
            >
              <MobileTabIcon>{route.icon}</MobileTabIcon>
              <span>{route.name}</span>
            </MobileTabLink>
          );
        })}
      </MobileTabs>
    </MobileNav>
  );
};
