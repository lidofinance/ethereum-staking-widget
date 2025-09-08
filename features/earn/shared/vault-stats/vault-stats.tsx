import { FormatLargeAmount, FormatPercent } from 'shared/formatters';
import { InlineLoader } from '../inline-loader';
import { VaultTip } from '../vault-tip';

import {
  VaultStatsItem,
  VaultStatsLabel,
  VaultStatsValue,
  VaultStatsWrapper,
} from './styles';

type VaultStatsProps = {
  tvl?: number;
  apy?: number;
  apx?: number;
  apxLabel: 'APY' | 'APR';
  isLoading?: boolean;
  apxHint?: React.ReactNode;
  compact?: boolean;
};

export const VaultStats: React.FC<VaultStatsProps> = ({
  tvl,
  apx,
  apxLabel,
  isLoading,
  apxHint,
  compact,
}) => {
  return (
    <VaultStatsWrapper compact={compact} data-testid="vault-stats">
      <VaultStatsItem data-testid="tvl-value">
        <VaultStatsLabel>TVL</VaultStatsLabel>{' '}
        <VaultStatsValue>
          <InlineLoader isLoading={isLoading} width={70}>
            <FormatLargeAmount amount={tvl} fallback="-" />
          </InlineLoader>
        </VaultStatsValue>
      </VaultStatsItem>
      <VaultStatsItem data-testid="apx-value">
        <VaultStatsLabel>{apxLabel}</VaultStatsLabel>{' '}
        <VaultStatsValue>
          <InlineLoader isLoading={isLoading} width={70}>
            <FormatPercent value={apx} decimals="percent" fallback="-" />*
          </InlineLoader>
        </VaultStatsValue>
        {!isLoading && <VaultTip placement="bottom">{apxHint}</VaultTip>}
      </VaultStatsItem>
    </VaultStatsWrapper>
  );
};
