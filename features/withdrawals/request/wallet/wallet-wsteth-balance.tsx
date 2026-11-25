import { useStETHByWstETH } from 'modules/web3';
import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';

import { useRequestFormData } from '../request-form-context';

export const WalletWstethBalance = () => {
  const { balanceWSteth, loading } = useRequestFormData();
  const { data: stethByWstethBalance, isLoading: isStethByWstethLoading } =
    useStETHByWstETH(balanceWSteth);

  return (
    <CardBalance
      small
      title="wstETH balance"
      loading={loading.isWstethBalanceLoading || isStethByWstethLoading}
      value={
        <FormatToken
          data-testid="wstEthBalance"
          amount={balanceWSteth}
          symbol="wstETH"
        />
      }
      extra={
        <FormatToken
          approx
          data-testid="wstEthBalanceOption"
          amount={stethByWstethBalance}
          symbol="ETH"
        />
      }
    />
  );
};
