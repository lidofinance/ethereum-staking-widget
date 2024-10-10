import { FC, PropsWithChildren } from 'react';
import { ButtonProps } from '@lidofinance/lido-ui';

import { ButtonStyle } from './styles';

export const DisabledButton: FC<PropsWithChildren<ButtonProps>> = (props) => {
  return (
    <ButtonStyle disabled={true} fullwidth {...props}>
      {props.children}
    </ButtonStyle>
  );
};
