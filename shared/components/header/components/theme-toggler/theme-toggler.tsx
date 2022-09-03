import { FC } from 'react';
import { ThemeTogglerStyle } from './styles';
import { Dark, Light, useThemeToggle } from '@lidofinance/lido-ui';

export const ThemeToggler: FC = () => {
  const { toggleTheme, themeName } = useThemeToggle();

  return (
    <ThemeTogglerStyle color="secondary" onClick={toggleTheme}>
      {themeName === 'dark' ? <Light /> : <Dark />}
    </ThemeTogglerStyle>
  );
};
