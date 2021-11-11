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

const DEFAULT_THEME = 'light';

export type ThemeProviderProps = { cookiesThemeScheme: string };

const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  cookiesThemeScheme,
}) => {
  const themeCk = cookiesThemeScheme as ThemeName;

  const systemTheme = useSystemTheme();

  const [themeName, setThemeName] = useState<ThemeName>(
    themeCk || systemTheme || DEFAULT_THEME,
  );
  console.log('themeCk ', themeCk);
  console.log('systemTheme ', systemTheme);
  console.log('DEFAULT_THEME ', DEFAULT_THEME);
  console.log('themeName ', themeName);

  // remember the theme on manual toggle, ignore system theme changes
  const toggleTheme = useCallback(() => {
    const newThemeName = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newThemeName);
    Cookies.set(STORAGE_THEME_KEY, newThemeName, { expires: 365 });
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
