import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

export const InputWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

export const WrapBlock = styled(Block)`
  gap: ${({ theme }) => theme.spaceMap.xxl}px;
  display: flex;
  flex-direction: column;
`;
