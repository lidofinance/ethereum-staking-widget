import styled, { css } from 'styled-components';

export const InputWrapperStyle = styled.div<{ $disabled?: boolean }>`
  & > label {
    & > span {
      ${({ theme, $disabled }) =>
        theme.name === 'dark'
          ? css`
              background: ${$disabled && '#27272E8F'};
            `
          : css`
              background: ${$disabled && '#EFF2F68F'};
            `}
    }
  }
`;
