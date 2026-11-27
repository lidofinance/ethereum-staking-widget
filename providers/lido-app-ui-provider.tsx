import type { FC, PropsWithChildren } from 'react';
import { Toaster } from '@lidofinance/lido-app-ui';

/**
 * App-wide lido-app-ui setup (its styles are imported in _app): what its
 * components need mounted once, e.g. the Toaster that renders toast().
 */
export const LidoAppUiProvider: FC<PropsWithChildren> = ({ children }) => (
  <>
    {children}
    <Toaster />
  </>
);
