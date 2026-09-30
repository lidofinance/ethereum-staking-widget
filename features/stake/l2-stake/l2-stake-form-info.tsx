// import { useWatch } from 'react-hook-form';

import { DataTable, DataTableRow } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
// import { FormatPrice, FormatToken } from 'shared/formatters';
// import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useProtocolFee } from 'shared/hooks/use-protocol-fee';
import { useFastStakeConversion } from './hooks/use-conversion';
import { useWatch } from 'react-hook-form';
import { L2StakeFormInputType } from './types';
import { FormatToken } from 'shared/formatters';
import { ONE_stETH } from 'modules/web3';
import { useFastStakeLiquidity } from './hooks/use-fast-liquidity';

export const L2StakeFormInfo = () => {
  // const { gasCost, loading } = useStakeFormData();
  const amount = useWatch<L2StakeFormInputType, 'amount'>({ name: 'amount' });
  // const { usdAmount, isLoading: isEthUsdLoading } = useEthUsd(gasCost);
  const protocolFee = useProtocolFee();
  const { data: conversion, isLoading: isConversionLoading } =
    useFastStakeConversion();
  const { data: liquidity, isLoading: isLiquidityLoading } =
    useFastStakeLiquidity();

  return (
    <DataTable data-testid="stakeFormInfo">
      <DataTableRow
        title="You will receive"
        data-testid="youWillReceive"
        loading={isConversionLoading}
      >
        <FormatToken
          amount={conversion ? conversion.ethToWsteth(amount ?? 0n) : null}
          symbol="wstETH"
          trimEllipsis
        />
      </DataTableRow>
      <DataTableRow
        data-testid="exchangeRate"
        title="Exchange rate"
        loading={isConversionLoading}
      >
        {conversion ? (
          <>
            1 ETH =
            <FormatToken
              data-testid="destinationRate"
              amount={conversion.ethToWsteth(ONE_stETH)}
              symbol={'wstETH'}
            />
          </>
        ) : (
          DATA_UNAVAILABLE
        )}
      </DataTableRow>
      <DataTableRow
        data-testid="availableLiquidity"
        title="Available liquidity"
        loading={isLiquidityLoading}
      >
        <FormatToken
          data-testid="availableLiquidityValue"
          amount={liquidity?.wsteth ?? null}
          symbol={'wstETH'}
        />
      </DataTableRow>
      {/* <DataTableRow
        title="Max transaction cost"
        data-testid="maxTxCost"
        loading={loading.isMaxGasPriceLoading || isEthUsdLoading}
      >
        <FormatPrice amount={usdAmount} />
      </DataTableRow> */}
      <DataTableRow
        title="Reward fee"
        data-testid="lidoFee"
        loading={protocolFee.isLoading}
        help="Please note: this fee applies to staking rewards only,
      and is NOT taken from your staked amount."
      >
        {!protocolFee.totalFeeString
          ? DATA_UNAVAILABLE
          : `${protocolFee.totalFeeString}%`}
      </DataTableRow>
    </DataTable>
  );
};
