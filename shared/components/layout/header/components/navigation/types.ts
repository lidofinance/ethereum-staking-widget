/**
 * Represents a page route in the navigation menu.
 */
export type PageRoute = {
  name: string;
  icon: React.ReactNode;
  subPaths?: string[];
  showNew?: boolean;
} & (
  | {
      path: string;
      rootActivePath?: string;
      subRoutes?: undefined;
    }
  | {
      path?: undefined;
      subRoutes: PageRoute[];
    }
);
