import styled from 'styled-components';
import { InputNumber } from 'shared/forms/components/input-number';

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

export const InputStyled = styled(InputNumber)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;
