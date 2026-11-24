import styled from 'styled-components';

import { COMPACT_QUERY } from '../../styles';

export const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-24);
`;

export const SummaryStats = styled.div`
  display: flex;
  align-items: flex-end;
  gap: var(--lido-app-ui-space-24);

  @media ${COMPACT_QUERY} {
    flex-direction: column;
    align-items: stretch;
    gap: var(--lido-app-ui-space-12);
  }
`;

export const NetWorth = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 300px;

  @media ${COMPACT_QUERY} {
    width: auto;
  }
`;

export const SecondaryStats = styled.div`
  display: flex;
  flex: 1 0 0;
  gap: var(--lido-app-ui-space-24);
  min-width: 0;

  @media ${COMPACT_QUERY} {
    gap: var(--lido-app-ui-space-12);
  }
`;

export const Stat = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const Allocation = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;

export const AllocationBar = styled.div`
  display: flex;
  gap: 1px;
  height: 20px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--lido-app-ui-color-background-default);
`;

export const AllocationPart = styled.div<{ $share: number; $color: string }>`
  flex: ${({ $share }) => $share} 0 0;
  background: ${({ $color }) => $color};
`;

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--lido-app-ui-space-16);
`;

export const LegendItem = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: var(--lido-app-ui-space-6);

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

// the hatched placeholder bar of the loading design
export const AllocationBarSkeleton = styled.div`
  height: 20px;
  border-radius: 4px;
  background: repeating-linear-gradient(
    135deg,
    var(--lido-app-ui-color-background-skeleton) 0 6px,
    var(--lido-app-ui-color-background-default) 6px 12px
  );
`;

export const LegendSkeleton = styled.div`
  width: 120px;
`;
