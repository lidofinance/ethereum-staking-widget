import styled from 'styled-components';
import { Button, InputGroup, Input } from '@lidofinance/lido-ui';

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
