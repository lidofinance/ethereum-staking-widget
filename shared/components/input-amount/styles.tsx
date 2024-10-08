import styled, { css } from 'styled-components';
import { Input } from '@lidofinance/lido-ui';

export const InputStyle = styled(Input)`
  // fix for '/wrap' and '/wrap/unwrap' page when 'InputGroupHookForm' contains only one element
  &:only-child {
    & > span {
      border-radius: 10px !important;
    }
  }

  & > span {
    ${({ theme, disabled }) =>
      theme.name === 'dark'
        ? css`
            background: ${disabled && '#27272E8F'};
          `
        : css`
            background: ${disabled && '#EFF2F68F'};
          `}
  }
`;
