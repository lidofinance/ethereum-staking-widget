import styled from 'styled-components';
import { Select } from '@lidofinance/lido-ui';

export const WillReceiveContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const WillReceiveLabel = styled.span`
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;

  color: var(--lido-color-textSecondary);
`;

export const WillReceiveSelectStyle = styled(Select)`
  width: 100%;
`;

// `getTokenIcon` returns scalable icons (viewBox only, no width/height) and the
// lido-ui decorator slots are flex containers that size them to 0x0. This box
// gives them an explicit size.
export const WillReceiveTokenIcon = styled.span`
  display: flex;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;

  & > svg {
    width: 100%;
    height: 100%;
  }
`;
