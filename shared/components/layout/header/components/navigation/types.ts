/**
 * Represents a page route in the navigation menu.
 */
export type PageRoute = {
  name: string;
  // longer label for the desktop dropdown, the mobile track keeps `name`
  menuName?: string;
  icon: React.ReactNode;
  showNew?: boolean;
  // a top-level link kept outside a flattened section, e.g. Portfolio
  standalone?: boolean;
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
