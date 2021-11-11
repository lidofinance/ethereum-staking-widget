import { FC, createContext, useCallback, useState, useMemo } from 'react';
import Cookies from 'js-cookie';
import { GlobalStyle } from 'styles';
import {
  themeLight,
  themeDark,
  Theme,
  ThemeProvider as SourceProvider,
  useSystemTheme,
} from '@lidofinance/lido-ui';
import { STORAGE_THEME_KEY } from 'config';
import { BackgroundGradient } from 'shared/components';

export type ThemeName = 'light' | 'dark';

export type ThemeContext = {
  toggleTheme: () => void;
  themeName: ThemeName;
};

const themeMap: Record<ThemeName, Theme> = {
  light: themeLight,
  dark: themeDark,
};

export const ThemeToggleContext = createContext({} as ThemeContext);

const COOKIES_THEME_EXPIRES_DAYS = 365;

const DEFAULT_THEME = 'light';

export type ThemeProviderProps = { cookiesThemeScheme: ThemeName };

const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  cookiesThemeScheme,
}) => {
  const themeFromCookies = cookiesThemeScheme as ThemeName;

  const systemTheme = useSystemTheme();

  const [themeName, setThemeName] = useState<ThemeName>(
    themeFromCookies || systemTheme || DEFAULT_THEME,
  );

  // remember the theme on manual toggle, ignore system theme changes
  const toggleTheme = useCallback(() => {
    const toggledThemeName = themeName === 'light' ? 'dark' : 'light';
    setThemeName(toggledThemeName);
    Cookies.set(STORAGE_THEME_KEY, toggledThemeName, {
      expires: COOKIES_THEME_EXPIRES_DAYS,
    });
  }, [themeName, setThemeName]);

  const value = useMemo(
    () => ({
      toggleTheme,
      themeName,
    }),
    [themeName, toggleTheme],
  );

  return (
    <ThemeToggleContext.Provider value={value}>
      <SourceProvider theme={themeMap[themeName]}>
        <GlobalStyle />
        {themeName === 'dark' && (
          <BackgroundGradient width={1560} height={784} />
        )}
        {children}
      </SourceProvider>
    </ThemeToggleContext.Provider>
  );
};

export default ThemeProvider;
