import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useRequestFormData } from '../request-form-context';

export const WalletStethBalance = () => {
  const { balanceSteth } = useRequestFormData();

  const stethBalanceValue = (
    <FormatToken showAmountTip amount={balanceSteth} symbol="stETH" />
  );

  return (
    <CardBalance
      small
      title="stETH Balance"
      loading={!balanceSteth}
      value={stethBalanceValue}
    />
  );
};
