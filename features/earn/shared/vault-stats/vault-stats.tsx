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
  isLoading?: boolean;
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
            <FormatLargeAmount amount={tvl} fallback="-" />
          </InlineLoader>
        </VaultStatsValue>
      </VaultStatsItem>
      <VaultStatsItem>
        <VaultStatsLabel>APY</VaultStatsLabel>{' '}
        <VaultStatsValue>
          <InlineLoader isLoading={isLoading} width={70}>
            <FormatPercent value={apy} decimals="percent" fallback="-" />
          </InlineLoader>
        </VaultStatsValue>
      </VaultStatsItem>
    </VaultStatsWrapper>
  );
};
