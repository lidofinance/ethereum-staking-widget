import styled, { css } from 'styled-components';
import { InputGroup, SelectIcon } from '@lidofinance/lido-ui';
import { InputNumber } from 'shared/forms/components/input-number';

const errorCSS = css`
  &,
  &:hover,
  &:focus-within {
    border-color: var(--lido-color-error);
  }
`;

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

export const InputStyled = styled(InputNumber)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const InputGroupStyled = styled((props) => <InputGroup {...props} />)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const SelectIconWrapper = styled((props) => <SelectIcon {...props} />)`
  position: static;
`;

export const InputWrapper = styled(InputNumber)<{
  error: boolean;
}>`
  ${({ error }) => (error ? errorCSS : '')}
`;
