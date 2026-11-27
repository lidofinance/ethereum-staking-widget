import styled from 'styled-components';
import { Tooltip } from '@lidofinance/lido-app-ui';

import { FormatPercent } from 'shared/formatters/format-percent';

import { shouldShowApxUpdateTooltip } from '../../apy-update-tooltip-text';
import type { VaultApx } from '../types';

const TooltipTrigger = styled.span`
  display: inline-flex;
`;

// The APY value; a stale or delayed value shows its update time in a tooltip
export const VaultApxValue = ({ apx }: { apx: VaultApx }) => {
  const text = <FormatPercent value={apx.value} decimals="percent" />;

  if (
    !shouldShowApxUpdateTooltip({
      apx: apx.value,
      isLoading: apx.isLoading,
      apxUpdateTooltipText: apx.updateTooltipText,
    })
  ) {
    return text;
  }

  return (
    <Tooltip content={apx.updateTooltipText} position="top-start">
      <TooltipTrigger tabIndex={0}>{text}</TooltipTrigger>
    </Tooltip>
  );
};
