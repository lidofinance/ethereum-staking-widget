import { VaultAvailable } from 'features/earn/shared/vault-available';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { useDVVPosition } from '../hooks/use-dvv-position';

export const DVVWithdrawAvailable = () => {
  const { sharesBalance, isLoading } = useDVVPosition();

  return (
    <VaultAvailable
      label="Available to withdraw"
      symbol={TOKEN_SYMBOLS.dvsteth}
      amount={sharesBalance}
      isLoading={isLoading}
    />
  );
};
