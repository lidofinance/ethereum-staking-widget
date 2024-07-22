import styled, { css } from 'styled-components';
import { Input } from '@lidofinance/lido-ui';

export const InputStyle = styled((props) => <Input {...props} />)`
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
