import type { ExternalConfig } from 'config/external-config';
import type { PageRoute } from './types';
import type { ManifestConfigPage } from 'config/external-config';
import { isDisabledPath } from 'config/external-config/disabled-path';
import { getPathWithoutFirstSlash } from 'consts/urls';

// config page of a route: exact key or its parent; `/` matches only itself
const findPageKey = (routePath: string, paths: ManifestConfigPage[]) =>
  paths.find(
    (path) =>
      routePath === path || (path !== '/' && routePath.startsWith(`${path}/`)),
  );

/**
 * Recursively filters the available routes based on the external configuration.
 * Removes routes that are disabled or have all subRoutes disabled.
 * Adds the `showNew` property to routes based on the external configuration.
 * @param routes The array of route declarations to filter.
 * @param configPages The external configuration pages used to determine route availability and properties.
 */
export const filterAvailableRoutes = (
  routes: PageRoute[],
  configPages: ExternalConfig['pages'],
): PageRoute[] => {
  const paths = Object.keys(configPages) as ManifestConfigPage[];
  return (
    routes
      .flatMap((route): PageRoute[] => {
        if (!route.subRoutes) return [route];
        const filteredSubRoutes = filterAvailableRoutes(
          route.subRoutes,
          configPages,
        );
        // drops a section whose subRoutes are all disabled
        if (filteredSubRoutes.length === 0) return [];
        return [{ ...route, subRoutes: filteredSubRoutes }];
      })
      // this predicate filters out routes that should be disabled
      //  based on whether they are banned by external config or all subRoutes are banned out
      .filter(
        (route) => !route.path || !isDisabledPath(route.path, configPages),
      )
      .map((route) => {
        if (!route.path) return route;
        const path = findPageKey(route.path, paths);
        return {
          ...route,
          showNew: !!path && configPages[path]?.showNew,
        };
      })
  );
};

// the only section left (e.g. stake-only integrations) is shown as a flat list of its pages
export const flattenSingleSection = (routes: PageRoute[]): PageRoute[] =>
  routes.length === 1 && routes[0].subRoutes ? routes[0].subRoutes : routes;

/**
 * Sanitizes a URL path by removing query parameters and trailing slashes.
 * @param path The URL path to sanitize.
 * @returns The sanitized path without query parameters and trailing slashes.
 */
export const sanitizePath = (path: string) => {
  let sanitizedPath = path.split('?')[0];
  if (sanitizedPath[sanitizedPath.length - 1] === '/') {
    sanitizedPath = sanitizedPath.slice(0, -1);
  }
  return sanitizedPath;
};

/**
 * Determines if a given route is active based on the current path name.
 * @param route The route to check.
 * @param pathName The current path name.
 * @returns True if the route is active, false otherwise.
 */
export const isRouteActive = (route: PageRoute, pathName: string): boolean => {
  const sanitizedPathName = sanitizePath(pathName);
  if ('path' in route && route.path) {
    // active path usually equals link path,
    // but sometimes we want to have broader routing scope
    const routePath = sanitizePath(route.rootActivePath ?? route.path);
    if (sanitizedPathName === getPathWithoutFirstSlash(routePath)) return true;
    if (routePath.length > 1 && sanitizedPathName.startsWith(routePath))
      return true;
  }
  if (Array.isArray(route.subRoutes)) {
    return route.subRoutes.some((subRoute) =>
      isRouteActive(subRoute, pathName),
    );
  }
  return false;
};
