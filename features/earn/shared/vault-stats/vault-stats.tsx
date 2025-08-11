import { InlineLoader } from '@lidofinance/lido-ui';
import {
  VaultStatsItem,
  VaultStatsLabel,
  VaultStatsValue,
  VaultStatsWrapper,
} from './styles';

type VaultStatsProps = {
  tvl?: number;
  apy?: number;
  isLoading?: boolean;
};

const formatTVL = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `$${value.toFixed(1).replace(/\.0$/, '')}`;
};

export const VaultStats: React.FC<VaultStatsProps> = ({
  tvl,
  apy,
  isLoading,
}) => {
  return (
    <VaultStatsWrapper>
      <VaultStatsItem>
        <VaultStatsLabel>TVL</VaultStatsLabel>{' '}
        <VaultStatsValue>
          {isLoading ? (
            <InlineLoader />
          ) : tvl != undefined ? (
            formatTVL(tvl)
          ) : (
            '-'
          )}
        </VaultStatsValue>
      </VaultStatsItem>
      <VaultStatsItem>
        <VaultStatsLabel>APY</VaultStatsLabel>{' '}
        <VaultStatsValue>
          {isLoading ? <InlineLoader /> : apy !== undefined ? `${apy}%` : '-'}
        </VaultStatsValue>
      </VaultStatsItem>
    </VaultStatsWrapper>
  );
};
