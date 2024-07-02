import { FC } from 'react';
import styled from 'styled-components';
import { Button, ButtonProps } from '@lidofinance/lido-ui';

export const ButtonStyle = styled((props) => <Button {...props} />)`
  background: var(--lido-color-backgroundSecondary);
  color: var(--lido-color-textSecondary);
`;

export const UnsupportedChainButton: FC<ButtonProps> = (props) => {
  return (
    <ButtonStyle disabled={true} fullwidth {...props}>
      Unsupported chain
    </ButtonStyle>
  );
};
