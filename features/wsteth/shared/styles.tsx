import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

export const InputWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

// data-snow-surface: the holiday theme lays a snow drift on it
export const WrapBlock = styled(Block).attrs({ 'data-snow-surface': 'card' })`
  gap: ${({ theme }) => theme.spaceMap.md}px;
  display: flex;
  flex-direction: column;
`;
