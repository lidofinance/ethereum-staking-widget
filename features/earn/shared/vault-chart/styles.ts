import styled from 'styled-components';
import { SegmentedControl } from '@lidofinance/lido-app-ui';

export const PLOT_HEIGHT = 224;

export const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  min-height: 24px;
`;

export const LegendItemRoot = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const LegendDot = styled.span<{ $color: string }>`
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  box-shadow: 0 0 0 2px var(--lido-app-ui-color-border-card);
`;

export const LegendValues = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const LegendDivider = styled.span`
  width: 1px;
  height: 12px;
  background-color: var(--lido-app-ui-color-border-default);
`;

export const PlotWrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${PLOT_HEIGHT}px;
`;

// The node is absolute, so the fixed-size SVG of ECharts does not block a flex shrink
export const ChartNode = styled.div<{ $hidden: boolean }>`
  position: absolute;
  inset: 0;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
`;

export const PlotOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyPlot = styled(PlotOverlay)`
  border-radius: var(--lido-app-ui-border-radius-lg);
  background-color: var(--lido-app-ui-color-background-secondary);
`;

export const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;

  /* The metric control stays on the right when the period control is hidden */
  & > :last-child {
    margin-left: auto;
  }
`;

/**
 * "Ghost" style of SegmentedControl from Figma. lido-app-ui does not have it.
 * The selectors use the ARIA roles of the library DOM, not its hashed class names.
 * TODO: update when lido-app-ui is ready
 */
export const GhostSegmentedControl = styled(SegmentedControl)`
  && {
    padding: 4px;
    border: none;
    background-color: transparent;
  }

  /* The animated pill of the active tab */
  && > [aria-hidden='true'] {
    background-color: var(--lido-app-ui-color-background-default-pressed);
  }

  &&& > [role='tab'] {
    color: var(--lido-app-ui-color-text-secondary);
  }

  &&& > [role='tab']:hover:not(:disabled),
  &&& > [role='tab'][aria-selected='true'] {
    color: var(--lido-app-ui-color-text-default);
  }

  &&& > [role='tab']:disabled {
    color: var(--lido-app-ui-color-text-disabled);
  }
`;
