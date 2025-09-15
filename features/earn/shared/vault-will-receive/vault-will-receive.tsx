import { FormatPrice, FormatToken } from 'shared/formatters';

import {
  VaultReceiveValue,
  VaultReceiveMainValue,
  VaultReceiveSecondaryValue,
} from './styles';
import { InlineLoader } from '../inline-loader';
import { VaultTxInfoRow } from '../vault-tx-info';

type VaultWillReceiveProps = {
  amount?: bigint | null;
  ethAmount?: bigint;
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
  ethAmount,
  isLoading,
}: VaultWillReceiveProps) => {
  return (
    <VaultTxInfoRow title={'You will receive'}>
      <VaultReceiveValue>
        <InlineLoader isLoading={isLoading} width={60}>
          <VaultReceiveMainValue data-testid="amount-receive">
            <FormatToken
              symbol={symbol}
              amount={amount}
              trimEllipsis
              fallback="-"
            />
            {icon}
          </VaultReceiveMainValue>
        </InlineLoader>
        <InlineLoader isLoading={isLoading} width={80}>
          <VaultReceiveSecondaryValue>
            <FormatPrice amount={usdAmount} fallback="-" />
            &nbsp;
            {ethAmount !== undefined && (
              <>
                (
                <FormatToken
                  amount={ethAmount}
                  symbol="ETH"
                  showAmountTip={false}
                />
                )
              </>
            )}
          </VaultReceiveSecondaryValue>
        </InlineLoader>
      </VaultReceiveValue>
    </VaultTxInfoRow>
  );
};
