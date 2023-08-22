import styled from 'styled-components';
import { InputGroup } from '@lidofinance/lido-ui';
import { InputNumber } from 'shared/forms/components/input-number';

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

export const InputStyled = styled(InputNumber)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const InputGroupStyled = styled(InputGroup)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;
