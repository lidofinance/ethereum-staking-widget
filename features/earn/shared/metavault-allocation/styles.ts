import styled from 'styled-components';
import { InfoTooltip, downQuery } from '@lidofinance/lido-app-ui';

// Header

export const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--lido-app-ui-space-4) var(--lido-app-ui-space-16);
`;

export const Updated = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--lido-app-ui-space-4);
  min-width: 0;
`;

// InfoTooltip has only 16px and 20px sizes. The design uses a 12px icon.
export const UpdatedTooltip = styled(InfoTooltip)`
  && > svg {
    width: 12px;
    height: 12px;
  }
`;

// Total, bar and legend

export const Overview = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;

export const Total = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--lido-app-ui-space-8);
`;

export const BarBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
`;

// lido-app-ui ProgressBar is a pill of 8px or 4px with role=progressbar.
// The design needs a 16px bar with a 4px radius, so the markup is local.
export const Bar = styled.div`
  display: flex;
  gap: 1px;
  height: 16px;
  overflow: hidden;
  border-radius: var(--lido-app-ui-border-radius-xs);
`;

// Keep very small shares visible next to their legend item.
export const BarSegment = styled.span`
  flex: 1 1 0;
  min-width: 2px;
`;

export const Legend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: var(--lido-app-ui-space-8) var(--lido-app-ui-space-16);
  margin: 0;
  padding: 2px 0 0;
  list-style: none;
`;

export const LegendItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const LegendDot = styled.span`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
`;

export const LegendText = styled.span`
  display: inline-flex;
  gap: var(--lido-app-ui-space-4);
`;

// Expanded details

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-24);
`;

export const GroupBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
`;

export const SummaryLine = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--lido-app-ui-space-16);
`;

export const SummaryName = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--lido-app-ui-space-8);
  min-width: 0;
`;

export const SummaryValue = styled.span`
  flex-shrink: 0;
`;

// Strategy table

export const StrategyTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  th,
  td {
    padding: 0 0 0 var(--lido-app-ui-space-16);
    text-align: right;
    white-space: nowrap;
  }

  th:first-child,
  td:first-child {
    padding-left: var(--lido-app-ui-space-12);
    text-align: left;
    white-space: normal;
  }

  th:last-child,
  td:last-child {
    padding-right: var(--lido-app-ui-space-12);
  }

  th {
    height: 36px;
    font-weight: inherit;
    background-color: var(--lido-app-ui-color-background-default);
  }

  th:first-child {
    border-radius: 10px 0 0 10px;
  }

  th:last-child {
    border-radius: 0 10px 10px 0;
  }

  td {
    height: 48px;
    padding-top: var(--lido-app-ui-space-12);
    padding-bottom: var(--lido-app-ui-space-12);
    box-sizing: border-box;
  }

  @media ${downQuery('xs')} {
    th,
    td {
      padding-left: var(--lido-app-ui-space-8);
    }
  }
`;

// The design column width is 52px. The 16px left padding is the column gap.
export const NumberHeader = styled.th`
  width: 68px;
`;

export const StrategyName = styled.span`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-8);
`;

// ProtocolIcon is 32px with a 20px badge. The design uses 24px with a 12px
// badge at the bottom right corner. The legacy component is shared, so resize it here.
export const StrategyIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;

  & > div {
    width: 24px;
    height: 24px;
  }

  & > div > div:last-child {
    right: 0;
    bottom: 0;
    width: 12px;
    height: 12px;
  }
`;

// Loading

export const LoadingBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;
