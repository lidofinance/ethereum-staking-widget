import { FC, PropsWithChildren, useMemo } from 'react';
import { CookieThemeProvider, ThemeName } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';
export { MODAL, ModalContext } from './modals';

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const queryTheme = (router?.query?.theme as string)?.toLowerCase();

  const overrideThemeName: ThemeName | undefined = useMemo(() => {
    if (queryTheme === 'light') return ThemeName.light;
    if (queryTheme === 'dark') return ThemeName.dark;
    return undefined;
  }, [queryTheme]);

  return (
    <CookieThemeProvider overrideThemeName={overrideThemeName}>
      {children}
    </CookieThemeProvider>
  );
};
