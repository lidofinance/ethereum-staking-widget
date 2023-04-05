import { FC } from 'react';
import { themeLight, ThemeProvider } from '@lidofinance/lido-ui';

import { InfoBoxStyled } from './styled';

export const InfoBox: FC = (props) => {
  return (
    <ThemeProvider theme={themeLight}>
      <InfoBoxStyled {...props} />
    </ThemeProvider>
  );
};
