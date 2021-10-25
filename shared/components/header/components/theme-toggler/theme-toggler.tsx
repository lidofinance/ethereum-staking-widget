import { FC } from 'react';
import { ThemeTogglerStyle } from './styles';
import { Dark, Light } from '@lidofinance/lido-ui';
import { useThemeToggle } from 'shared/hooks';

export const ThemeToggler: FC = () => {
  const { toggleTheme, themeName } = useThemeToggle();

  return (
    <ThemeTogglerStyle onClick={toggleTheme}>
      {themeName === 'dark' ? <Light /> : <Dark />}
    </ThemeTogglerStyle>
  );
};
