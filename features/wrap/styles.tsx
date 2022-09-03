import styled, { css } from 'styled-components';
import { Button, InputGroup, Input, SelectIcon } from '@lidofinance/lido-ui';

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

export const InputStyled = styled((props) => <Input {...props} />)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const InputGroupStyled = styled((props) => <InputGroup {...props} />)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const MaxButton = styled((props) => <Button {...props} />)`
  letter-spacing: 0.4px;
`;

export const SelectIconWrapper = styled((props) => <SelectIcon {...props} />)`
  position: static;
`;

export const InputWrapper = styled((props) => <Input {...props} />)<{
  error: boolean;
}>`
  ${({ error }) => (error ? errorCSS : '')}
`;
