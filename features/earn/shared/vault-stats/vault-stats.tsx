import { FormatLargeAmount, FormatPercent } from 'shared/formatters';
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
  apr?: number;
  isLoading?: boolean;
};

export const VaultStats: React.FC<VaultStatsProps> = ({
  tvl,
  apy,
  apr,
  isLoading,
}) => {
  const reward = apy !== undefined ? apy : apr;
  const rewardLabel = apy !== undefined ? 'APY' : 'APR';

  return (
    <VaultStatsWrapper>
      <VaultStatsItem>
        <VaultStatsLabel>TVL</VaultStatsLabel>{' '}
        <VaultStatsValue>
          <InlineLoader isLoading={isLoading} width={70}>
            <FormatLargeAmount amount={tvl} fallback="-" />
          </InlineLoader>
        </VaultStatsValue>
      </VaultStatsItem>
      <VaultStatsItem>
        <VaultStatsLabel>{rewardLabel}</VaultStatsLabel>{' '}
        <VaultStatsValue>
          <InlineLoader isLoading={isLoading} width={70}>
            <FormatPercent value={reward} decimals="percent" fallback="-" />
          </InlineLoader>
        </VaultStatsValue>
      </VaultStatsItem>
    </VaultStatsWrapper>
  );
};
