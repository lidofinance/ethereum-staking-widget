import { forwardRef, type PropsWithChildren } from 'react';
import {
  LinkProvider,
  type LinkComponentProps,
} from '@lidofinance/lido-app-ui';

import { LocalLink } from 'shared/components/local-link';

// LocalLink keeps the kept query keys and the IPFS routing.
// Module level: a new component on each render remounts every link.
const AppUiLocalLink = forwardRef<HTMLAnchorElement, LinkComponentProps>(
  ({ href, ...rest }, ref) => <LocalLink {...rest} ref={ref} href={href} />,
);
AppUiLocalLink.displayName = 'AppUiLocalLink';

// In-app hrefs of lido-app-ui links (Button, IconButton, TextLink…) use LocalLink.
export const AppUiLinkProvider = ({ children }: PropsWithChildren) => (
  <LinkProvider component={AppUiLocalLink}>{children}</LinkProvider>
);
