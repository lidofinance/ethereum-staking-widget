import styled, { css } from 'styled-components';
import { Button, InputGroup, Input, SelectIcon } from '@lidofinance/lido-ui';

const errorCSS = css`
  &,
  &:hover,
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.error};
  }
`;

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

export const InputStyled = styled(Input)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const InputGroupStyled = styled(InputGroup)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const MaxButton = styled(Button)`
  letter-spacing: 0.4px;
`;

export const SelectIconWrapper = styled(SelectIcon)<{ error: boolean }>`
  ${({ error }) => (error ? errorCSS : '')}
`;
