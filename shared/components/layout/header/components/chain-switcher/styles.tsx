import styled, { css } from 'styled-components';
import { SelectIcon } from '@lidofinance/lido-ui';

export const SelectIconStyled = styled(SelectIcon)`
  overflow: ${({ disabled }) => (disabled ? 'hidden' : 'visible')};
  width: ${({ disabled }) => (disabled ? '44px' : 'auto')};

  &:not(:disabled):hover {
    & > span {
      ${({ theme, disabled }) =>
        theme.name === 'dark'
          ? css`
              background: ${!disabled && '#34343D'};
            `
          : css`
              background: ${!disabled && '#000A3D08'};
            `}
    }
  }

  & > span {
    border: 0;
    padding-left: 8px;
    padding-right: 8px;
  }

  border-radius: 10px;
  margin-right: 12px;
`;
