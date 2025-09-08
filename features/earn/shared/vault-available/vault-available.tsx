import { FormatToken } from 'shared/formatters';
import { VaultAvailableContainer, VaultAvailableLabel } from './styles';
import { InlineLoader } from '../inline-loader';

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
      <InlineLoader width={78} isLoading={isLoading}>
        <FormatToken
          fallback="-"
          amount={amount}
          symbol={symbol}
          data-testid="amount-available"
        />
      </InlineLoader>
    </VaultAvailableContainer>
  );
};
