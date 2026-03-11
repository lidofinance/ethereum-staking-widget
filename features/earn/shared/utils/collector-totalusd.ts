import { bnAmountToNumber } from 'utils/bn';

export const COLLECTOR_TOTALUSD_DECIMALS = 8; // the collector returns TVL with 8 decimals

export const convertTotalUsdToNumber = (totalUsd: bigint | undefined) =>
  bnAmountToNumber(totalUsd, COLLECTOR_TOTALUSD_DECIMALS);
