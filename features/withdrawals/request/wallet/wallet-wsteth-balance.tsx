import { Text } from '@lidofinance/lido-ui';

import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useStETHByWstETH } from 'modules/web3';

import { useRequestFormData } from '../request-form-context';

export const WalletWstethBalance = () => {
  const { balanceWSteth, loading } = useRequestFormData();
  const { data: stethByWstethBalance, isLoading: isStethByWstethLoading } =
    useStETHByWstETH(balanceWSteth);

  const stethBalanceValue = (
    <>
      <FormatToken
        data-testid="wstEthBalance"
        amount={balanceWSteth}
        symbol="wstETH"
      />
      <Text size={'xxs'} color={'secondary'}>
        ≈{' '}
        <FormatToken
          data-testid="wstEthBalanceOption"
          amount={stethByWstethBalance}
          symbol="ETH"
        />
      </Text>
    </>
  );

  return (
    <CardBalance
      small
      title="wstETH balance"
      loading={loading.isStethBalanceLoading || isStethByWstethLoading}
      value={stethBalanceValue}
    />
  );
};
