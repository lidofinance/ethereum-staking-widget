import { FormatPrice, FormatToken } from 'shared/formatters';
import {
  VaultReceiveContainer,
  VaultReceiveValue,
  VaultReceiveMainValue,
  Loader,
} from './styles';

type VaultWillReceiveProps = {
  amount?: bigint;
  usdAmount?: number;
  icon: React.ReactNode;
  symbol: string;
  isLoading?: boolean;
};

export const VaultWillReceive = ({
  icon,
  amount,
  symbol,
  usdAmount,
  isLoading,
}: VaultWillReceiveProps) => {
  return (
    <VaultReceiveContainer>
      You will receive{' '}
      <VaultReceiveValue>
        {isLoading ? (
          <Loader />
        ) : (
          <VaultReceiveMainValue>
            <FormatToken symbol={symbol} amount={amount} fallback="-" />
            {icon}
          </VaultReceiveMainValue>
        )}
        {isLoading ? (
          <Loader />
        ) : (
          <FormatPrice amount={usdAmount} fallback="-" />
        )}
      </VaultReceiveValue>
    </VaultReceiveContainer>
  );
};
