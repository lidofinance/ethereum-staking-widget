import { FormatPrice, FormatToken } from 'shared/formatters';

import { VaultReceiveValue, VaultReceiveMainValue } from './styles';
import { InlineLoader } from '../inline-loader';
import { VaultTxInfoRow } from '../vault-tx-info';

type VaultWillReceiveProps = {
  amount?: bigint | null;
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
    <VaultTxInfoRow title={'You will receive'}>
      <VaultReceiveValue>
        <InlineLoader isLoading={isLoading} width={60}>
          <VaultReceiveMainValue>
            <FormatToken
              symbol={symbol}
              amount={amount}
              trimEllipsis
              fallback="-"
            />
            {icon}
          </VaultReceiveMainValue>
        </InlineLoader>
        <InlineLoader isLoading={isLoading} width={60}>
          <FormatPrice amount={usdAmount} fallback="-" />
        </InlineLoader>
      </VaultReceiveValue>
    </VaultTxInfoRow>
  );
};
