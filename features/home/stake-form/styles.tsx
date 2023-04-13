import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';
import { InputNumber } from 'shared/components/input-number';

export const InputStyled = styled(InputNumber)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

export const MaxButton = styled(Button)`
  letter-spacing: 0.4px;
`;
