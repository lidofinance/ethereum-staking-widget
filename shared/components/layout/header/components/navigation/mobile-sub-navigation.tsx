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

type ActiveBarState = {
  left: number;
  width: number;
  scrollLeft: number;
};

type SubNavigationProps = {
  route: PageRoute;
  currentPath: string;
};

// Layout is rendered per page, so this component remounts on every route change.
// Keeping the last position at module level lets the bar animate from where it
// was instead of appearing at the new position.
// Only needed because next.js structure remounts the layout on every route change
let lastActiveBarState: ActiveBarState | null = null;

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

    const applyBar = (left: number, width: number) => {
      bar.style.transform = `translateX(${left}px)`;
      bar.style.width = `${width}px`;
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

    const save = (position: { left: number; width: number }) => {
      lastActiveBarState = { ...position, scrollLeft: wrapper.scrollLeft };
    };

    const target = measure();
    const previous = lastActiveBarState;

    // Before first paint: restore previous position (or snap to target)
    if (previous) {
      applyBar(previous.left, previous.width);
      wrapper.scrollLeft = previous.scrollLeft;
    } else if (target) {
      applyBar(target.left, target.width);
      wrapper.scrollLeft = centerOf(target);
    }

    // Next frame: enable transition and animate to the target
    const frame = requestAnimationFrame(() => {
      bar.dataset.ready = 'true';
      if (!target) {
        bar.style.width = '0px';
        return;
      }
      applyBar(target.left, target.width);
      save(target);
      // scrolling the wrapper only, unlike scrollIntoView this never scrolls the page
      wrapper.scrollTo({
        left: centerOf(target),
        behavior: previous ? 'smooth' : 'auto',
      });
    });

    const onScroll = () => {
      if (lastActiveBarState)
        lastActiveBarState.scrollLeft = wrapper.scrollLeft;
    };
    wrapper.addEventListener('scroll', onScroll, { passive: true });

    // re-measure on resize, font load, or when the nav becomes visible
    const observer = new ResizeObserver(() => {
      if (bar.dataset.ready !== 'true') return;
      const position = measure();
      if (!position) return;
      applyBar(position.left, position.width);
      save(position);
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
