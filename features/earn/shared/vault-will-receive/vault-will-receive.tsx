import { FormatPrice, FormatToken } from 'shared/formatters';
import {
  VaultReceiveContainer,
  VaultReceiveValue,
  VaultReceiveMainValue,
} from './styles';
import { InlineLoader } from '../inline-loader';

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
        <InlineLoader isLoading={isLoading} width={60}>
          <VaultReceiveMainValue>
            <FormatToken symbol={symbol} amount={amount} fallback="-" />
            {icon}
          </VaultReceiveMainValue>
        </InlineLoader>
        <InlineLoader isLoading={isLoading} width={60}>
          <FormatPrice amount={usdAmount} fallback="-" />
        </InlineLoader>
      </VaultReceiveValue>
    </VaultReceiveContainer>
  );
};
