import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import Cookies from 'js-cookie';
import { GlobalStyle } from 'styles';
import {
  themeLight,
  themeDark,
  Theme,
  ThemeProvider as SourceProvider,
  useSystemTheme,
} from '@lidofinance/lido-ui';
import { STORAGE_THEME_AUTO_KEY, STORAGE_THEME_MANUAL_KEY } from 'config';
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

export type ThemeProviderProps = {
  cookiesAutoThemeScheme?: ThemeName;
  cookiesManualThemeScheme?: ThemeName;
};

const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  cookiesAutoThemeScheme,
  cookiesManualThemeScheme,
}) => {
  const systemTheme = useSystemTheme();

  const [themeName, setThemeName] = useState<ThemeName>(
    cookiesManualThemeScheme || cookiesAutoThemeScheme || DEFAULT_THEME,
  );

  // Noticing browser preferences on hydration
  // Reacting to changing preferences
  useEffect(() => {
    if (process.browser && !cookiesManualThemeScheme && systemTheme) {
      setThemeName(systemTheme);
      Cookies.set(STORAGE_THEME_AUTO_KEY, systemTheme, {
        expires: COOKIES_THEME_EXPIRES_DAYS,
        sameSite: 'None',
        secure: true,
      });
    }
    // We only need to override logic when systemTheme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemTheme]);

  // remember the theme on manual toggle, ignore system theme changes
  const toggleTheme = useCallback(() => {
    const toggledThemeName = themeName === 'light' ? 'dark' : 'light';
    setThemeName(toggledThemeName);
    Cookies.set(STORAGE_THEME_MANUAL_KEY, toggledThemeName, {
      expires: COOKIES_THEME_EXPIRES_DAYS,
      sameSite: 'None',
      secure: true,
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
