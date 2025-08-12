import { FormatToken } from 'shared/formatters';
import { VaultAvailableContainer, VaultAvailableLabel } from './styles';
import { InlineLoader } from '@lidofinance/lido-ui';

type VaultAvailableProps = {
  label: string;
  amount?: bigint;
  symbol: string;
  isLoading?: boolean;
};

export const VaultAvailable = ({
  label,
  amount,
  symbol,
  isLoading,
}: VaultAvailableProps) => {
  return (
    <VaultAvailableContainer>
      <VaultAvailableLabel>{label}</VaultAvailableLabel>
      {isLoading ? (
        <InlineLoader />
      ) : (
        <FormatToken fallback="-" amount={amount} symbol={symbol} />
      )}
    </VaultAvailableContainer>
  );
};
