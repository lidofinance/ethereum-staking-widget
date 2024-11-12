import { useWatch } from 'react-hook-form';

import { DataTable, DataTableRow } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { FormatPrice, FormatToken } from 'shared/formatters';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useProtocolFee } from 'shared/hooks/use-protocol-fee';
import { ZERO } from 'modules/web3';

import { StakeFormInput, useStakeFormData } from './stake-form-context';

export const StakeFormInfo = () => {
  const { gasCost, loading } = useStakeFormData();
  const amount = useWatch<StakeFormInput, 'amount'>({ name: 'amount' });

  const { usdAmount, initialLoading: isEthUsdLoading } = useEthUsd(gasCost);
  const protocolFee = useProtocolFee();

  return (
    <DataTable data-testid="stakeFormInfo">
      <DataTableRow title="You will receive" data-testid="youWillReceive">
        <FormatToken amount={amount ?? ZERO} symbol="stETH" trimEllipsis />
      </DataTableRow>
      <DataTableRow title="Exchange rate" data-testid="exchangeRate">
        1 ETH = 1 stETH
      </DataTableRow>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxTxCost"
        loading={loading.isMaxGasPriceLoading || isEthUsdLoading}
      >
        <FormatPrice amount={usdAmount} />
      </DataTableRow>
      <DataTableRow
        title="Reward fee"
        data-testid="lidoFee"
        loading={protocolFee.initialLoading}
        help="Please note: this fee applies to staking rewards only,
      and is NOT taken from your staked amount."
      >
        {!protocolFee.data ? DATA_UNAVAILABLE : `${protocolFee.data}%`}
      </DataTableRow>
    </DataTable>
  );
};
