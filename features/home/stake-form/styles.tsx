import styled from 'styled-components';
import { InputNumber } from 'shared/components/input-number';

export const InputStyled = styled(InputNumber)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;
