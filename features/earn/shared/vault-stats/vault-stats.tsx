import {
  VaultStatsItem,
  VaultStatsLabel,
  VaultStatsValue,
  VaultStatsWrapper,
} from './styles';

type VaultStatsProps = {
  tvl: string;
  apy: string;
};

export const VaultStats: React.FC<VaultStatsProps> = ({ tvl, apy }) => {
  return (
    <VaultStatsWrapper>
      <VaultStatsItem>
        <VaultStatsLabel>TVL</VaultStatsLabel>{' '}
        <VaultStatsValue>${tvl}K</VaultStatsValue>
      </VaultStatsItem>
      <VaultStatsItem>
        <VaultStatsLabel>APY</VaultStatsLabel>{' '}
        <VaultStatsValue>{apy}%</VaultStatsValue>
      </VaultStatsItem>
    </VaultStatsWrapper>
  );
};
