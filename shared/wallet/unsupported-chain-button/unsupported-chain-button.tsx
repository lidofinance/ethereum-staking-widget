import { FC } from 'react';
import { ButtonProps } from '@lidofinance/lido-ui';

import { ButtonStyle } from './styles';

export const UnsupportedChainButton: FC<ButtonProps> = (props) => {
  return (
    <ButtonStyle disabled={true} fullwidth {...props}>
      Unsupported chain
    </ButtonStyle>
  );
};
