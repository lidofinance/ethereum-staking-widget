import type { ExternalConfig } from 'config/external-config';
import type { PageRoute } from './types';
import type { ManifestConfigPage } from 'config/external-config';
import { getPathWithoutFirstSlash } from 'consts/urls';

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
    (
      routes
        .map((route) => {
          if (route === null) return null;
          if (route.subRoutes) {
            const filteredSubRoutes = filterAvailableRoutes(
              route.subRoutes,
              configPages,
            );
            if (filteredSubRoutes.length === 0) {
              return null;
            }
            return {
              ...route,
              subRoutes: filteredSubRoutes,
            };
          }
          return route;
        })
        // this predicate filters out routes that should be disabled
        //  based on whether they are banned by external config or all subRoutes are banned out
        .filter((route) => {
          if (route === null) return false;
          if ('path' in route && route.path) {
            const path = paths.find((path) => route.path.includes(path));
            if (!path) return true;
            return !configPages[path]?.shouldDisable;
          }
          return true;
        }) as PageRoute[]
    ).map((route) => {
      if ('path' in route && route.path) {
        const path = paths.find((path) => route.path.includes(path));
        return {
          ...route,
          showNew: !!path && configPages[path]?.showNew,
        };
      }
      return route;
    })
  );
};

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
