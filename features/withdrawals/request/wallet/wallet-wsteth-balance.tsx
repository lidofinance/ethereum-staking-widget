import { Text } from '@lidofinance/lido-ui';

import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useStethByWsteth } from 'shared/hooks';
import { useRequestFormData } from '../request-form-context';

export const WalletWstethBalance = () => {
  const { balanceWSteth } = useRequestFormData();
  const stethByWstethBalance = useStethByWsteth(balanceWSteth);

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
      title="wstETH Balance"
      loading={!balanceWSteth || !stethByWstethBalance}
      value={stethBalanceValue}
    />
  );
};
