import invariant from 'tiny-invariant';
import { useRef } from 'react';
import type { FC } from 'react';

import { useIsomorphicLayoutEffect } from 'shared/hooks/use-isomorphic-layout-effect';

import {
  MobileOnlySubNavigationActiveBar,
  MobileOnlySubNavigationLink,
  MobileOnlySubNavigationSizer,
  MobileOnlySubNavigationWrapper,
} from './styles';

import { isRouteActive } from './utils';
import type { PageRoute } from './types';

type SubNavigationProps = {
  route: PageRoute;
  currentPath: string;
};

// Layout is rendered per page, so this component remounts on every route change.
// The bar position lives as CSS variables on <html>, which outlives the layout,
// so on remount the bar is already at its previous position at first paint and
// only needs to animate to the new one. Scroll offset is kept alongside as a data attribute.
const BAR_LEFT_VAR = '--sub-nav-bar-left';
const BAR_WIDTH_VAR = '--sub-nav-bar-width';
const SCROLL_LEFT_KEY = 'subNavScrollLeft';

export const MobileSubNavigation: FC<Omit<SubNavigationProps, 'isActive'>> = ({
  route,
  currentPath,
}) => {
  invariant(route.subRoutes, 'MobileSubNavigation requires subRoutes');
  const wrapperRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Aligns the active bar with the currently active sub-navigation link
  // TODO: simplify this when next.js is deprecated
  useIsomorphicLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const bar = barRef.current;
    invariant(wrapper && bar, 'MobileSubNavigation refs must be attached');

    const root = document.documentElement;

    const setBar = ({ left, width }: { left: number; width: number }) => {
      root.style.setProperty(BAR_LEFT_VAR, `${left}px`);
      root.style.setProperty(BAR_WIDTH_VAR, `${width}px`);
    };

    // offsetLeft is relative to the wrapper (position: relative) and is
    // unaffected by scroll, same as the absolutely positioned bar
    const measure = () => {
      const active = wrapper.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) return null;
      return { left: active.offsetLeft, width: active.offsetWidth };
    };

    const centerOf = ({ left, width }: { left: number; width: number }) =>
      left - (wrapper.clientWidth - width) / 2;

    const target = measure();
    const hasPrevious = root.style.getPropertyValue(BAR_LEFT_VAR) !== '';

    // Before first paint: the bar already reads its previous position from CSS,
    // only the scroll offset needs restoring. Without previous state snap to target.
    if (hasPrevious) {
      const previousScroll = root.dataset[SCROLL_LEFT_KEY];
      if (previousScroll !== undefined)
        wrapper.scrollLeft = Number(previousScroll);
    } else if (target) {
      setBar(target);
      wrapper.scrollLeft = centerOf(target);
    }

    // Next frame: enable transition and animate to the target
    const frame = requestAnimationFrame(() => {
      bar.dataset.ready = 'true';
      if (!target) {
        root.style.setProperty(BAR_WIDTH_VAR, '0px');
        return;
      }
      setBar(target);
      // scrolling the wrapper only, unlike scrollIntoView this never scrolls the page
      wrapper.scrollTo({
        left: centerOf(target),
        behavior: hasPrevious ? 'smooth' : 'auto',
      });
    });

    const onScroll = () => {
      root.dataset[SCROLL_LEFT_KEY] = String(wrapper.scrollLeft);
    };
    wrapper.addEventListener('scroll', onScroll, { passive: true });

    // re-measure on resize, font load, or when the nav becomes visible
    const observer = new ResizeObserver(() => {
      if (bar.dataset.ready !== 'true') return;
      const position = measure();
      if (position) setBar(position);
    });
    observer.observe(wrapper);
    for (const child of wrapper.children) observer.observe(child);

    return () => {
      cancelAnimationFrame(frame);
      wrapper.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [currentPath, route]);

  return (
    <MobileOnlySubNavigationSizer>
      <MobileOnlySubNavigationWrapper ref={wrapperRef}>
        {route.subRoutes.map((subRoute) => {
          const isSubRouteActive = isRouteActive(subRoute, currentPath);
          invariant(subRoute.path, 'SubRoute requires a path');
          return (
            <MobileOnlySubNavigationLink
              data-active={isSubRouteActive}
              key={subRoute.path}
              href={subRoute.path}
            >
              {subRoute.name}
            </MobileOnlySubNavigationLink>
          );
        })}
        <MobileOnlySubNavigationActiveBar ref={barRef} />
      </MobileOnlySubNavigationWrapper>
    </MobileOnlySubNavigationSizer>
  );
};
