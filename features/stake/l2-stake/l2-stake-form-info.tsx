import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { useWatch } from 'react-hook-form';

import { DATA_UNAVAILABLE } from 'consts/text';
import { useProtocolFee } from 'shared/hooks/use-protocol-fee';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { ONE_stETH } from 'modules/web3';
import { useFastStakeConversion } from './hooks/use-conversion';

import { useL2StakeFormData } from './l2-stake-form-context';
import { FormatPrice, FormatToken } from 'shared/formatters';

import { useFastStakeLiquidity } from './hooks/use-fast-liquidity';

import type { L2StakeFormInputType } from './types';

export const L2StakeFormInfo = () => {
  const { gasCost, loading } = useL2StakeFormData();
  const amount = useWatch<L2StakeFormInputType, 'amount'>({ name: 'amount' });
  const { usdAmount, isLoading: isEthUsdLoading } = useEthUsd(gasCost);
  // This will use Lido SDK default chain for fetching the protocol fee
  // so it can be eth testnet value for mainnet L2 if env is misconfigured
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
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxTxCost"
        loading={loading.isMaxGasPriceLoading || isEthUsdLoading}
      >
        {/* Max transaction cost in USD for L2 can be quite small, so we adjust rounding */}
        <FormatPrice amount={usdAmount} maximumFractionDigits={4} />
      </DataTableRow>
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
