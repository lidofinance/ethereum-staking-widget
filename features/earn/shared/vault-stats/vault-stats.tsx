import { InlineLoader } from '../inline-loader';
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
          <InlineLoader isLoading={isLoading} width={70}>
            {tvl != undefined ? formatTVL(tvl) : '-'}
          </InlineLoader>
        </VaultStatsValue>
      </VaultStatsItem>
      <VaultStatsItem>
        <VaultStatsLabel>APY</VaultStatsLabel>{' '}
        <VaultStatsValue>
          <InlineLoader isLoading={isLoading} width={70}>
            {apy !== undefined ? `${apy}%` : '-'}
          </InlineLoader>
        </VaultStatsValue>
      </VaultStatsItem>
    </VaultStatsWrapper>
  );
};
