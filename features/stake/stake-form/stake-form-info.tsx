import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { useWatch } from 'react-hook-form';
import { useContractSWR, useSTETHContractRPC } from '@lido-sdk/react';
import { Zero } from '@ethersproject/constants';

import { FormatPrice, FormatToken } from 'shared/formatters';
import { STRATEGY_CONSTANT } from 'utils/swrStrategies';
import { DATA_UNAVAILABLE } from 'config';

import { StakeFormInput, useStakeFormData } from './stake-form-context';

import { useEthUsd } from 'shared/hooks/use-eth-usd';

export const StakeFormInfo = () => {
  const { gasCost } = useStakeFormData();
  const amount = useWatch<StakeFormInput, 'amount'>({ name: 'amount' });
  const contractRpc = useSTETHContractRPC();
  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
    config: STRATEGY_CONSTANT,
  });
  const txCostInUsd = useEthUsd(gasCost);

  return (
    <DataTable>
      <DataTableRow title="You will receive" data-testid="youWillReceive">
        <FormatToken amount={amount ?? Zero} symbol="stETH" />
      </DataTableRow>
      <DataTableRow title="Exchange rate" data-testid="exchangeRate">
        1 ETH = 1 stETH
      </DataTableRow>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxTxCost"
        loading={!txCostInUsd}
      >
        <FormatPrice amount={txCostInUsd} />
      </DataTableRow>
      <DataTableRow
        title="Reward fee"
        data-testid="lidoFee"
        loading={lidoFee.initialLoading}
        help="Please note: this fee applies to staking rewards only,
      and is NOT taken from your staked amount."
      >
        {!lidoFee.data ? DATA_UNAVAILABLE : `${lidoFee.data / 100}%`}
      </DataTableRow>
    </DataTable>
  );
};
