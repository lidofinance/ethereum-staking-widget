import styled, { css } from 'styled-components';
import { Button } from '@lidofinance/lido-ui';

type HeaderControlButtonProps = {
  isActive?: boolean;
};
export const HeaderControlButton = styled(Button).attrs({
  variant: 'text',
  size: 'xs',
})<HeaderControlButtonProps>`
  border-radius: 10px;
  min-width: 0;
  margin-left: ${({ theme }) => theme.spaceMap.sm}px;
  padding-left: 10px;
  padding-right: 10px;
  line-height: 0;
  font-size: 0;
  fill: var(--lido-color-secondary);

  svg {
    width: 24px;
    height: 24px;
    fill: var(--lido-color-secondary);
  }

  ${({ isActive }) =>
    isActive &&
    css`
      & svg {
        fill: var(--lido-color-primary);
      }
    `}
`;
