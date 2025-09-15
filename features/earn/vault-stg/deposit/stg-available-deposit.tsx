import { VaultAvailable } from 'features/earn/shared/vault-available';

export const STGAvailableDeposit = () => {
  const isLoading = false;
  const maxAmount = 0n;
  const token = 'ETH';

  return (
    <VaultAvailable
      isLoading={isLoading}
      label="Available to deposit"
      amount={maxAmount}
      symbol={token}
    />
  );
};
