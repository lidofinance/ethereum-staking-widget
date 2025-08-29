import { FC } from 'react';
import { themeLight, ThemeProvider } from '@lidofinance/lido-ui';

import { InfoBoxStyled, type InfoBoxProps } from './styled';

export const InfoBox: FC<React.PropsWithChildren<InfoBoxProps>> = (props) => {
  return (
    <ThemeProvider theme={themeLight}>
      <InfoBoxStyled {...props} />
    </ThemeProvider>
  );
};
