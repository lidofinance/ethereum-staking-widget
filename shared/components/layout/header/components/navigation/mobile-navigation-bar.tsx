import { useEffect, useState, type FC } from 'react';
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
import { isRouteActive } from './utils';
import type { PageRoute } from './types';

type MobileNavigationBarProps = {
  routes: PageRoute[];
  currentPath: string;
};

// Layout remounts per page: a value starts from the last mount and animates to the new one.
// undefined means "no value": nothing to animate from, and the rendered value is kept.
const createRemountTransition = <T,>() => {
  let last: T | undefined;

  return function useRemountTransition(value: T | undefined) {
    const [rendered, setRendered] = useState(() => last ?? value);

    useEffect(() => {
      last = value;
      if (value === undefined) return;
      const frame = requestAnimationFrame(() => setRendered(value));
      return () => cancelAnimationFrame(frame);
    }, [value]);

    return rendered;
  };
};

const useTrackExpanded = createRemountTransition<boolean>();
const usePillIndex = createRemountTransition<number>();

const ariaCurrent = (isActive: boolean) => (isActive ? 'page' : undefined);

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
                    aria-current={ariaCurrent(
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
              aria-current={ariaCurrent(isRouteActive(route, currentPath))}
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
