import styled from 'styled-components';
import { Input } from '@lidofinance/lido-ui';

export const LidoAprStyled = styled.span`
  color: rgb(97, 183, 95);
`;

export const FlexCenterVertical = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export const InputStyled = styled(Input)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;
