import { BigDecimal } from 'features/rewards/helpers';
import {
  ETHER,
  HUMAN_DECIMALS,
  PRECISE_DECIMALS,
  HUMAN_DECIMALS_PERCENT,
  PRECISE_DECIMALS_PERCENT,
  HUMAN_DECIMALS_CURRENCY,
  PRECISE_DECIMALS_CURRENCY,
} from 'features/rewards/constants';

import type { BigNumber } from 'features/rewards/helpers';

// TODO: change to general solution

export const weiToEther = (wei: BigNumber | string) =>
  new BigDecimal(wei).div(ETHER);

export const formatWEI = (input: BigNumber, manyDigits: boolean) => {
  const decimals = manyDigits ? PRECISE_DECIMALS : HUMAN_DECIMALS;
  const inWei = weiToEther(input).decimalPlaces(decimals);

  return inWei.toFormat();
};

export const formatETH = (input: BigNumber, manyDigits: boolean) => {
  const decimals = manyDigits ? PRECISE_DECIMALS : HUMAN_DECIMALS;
  const inWei = input.decimalPlaces(decimals);

  return inWei.toFormat();
};

// ETH-stETH ratio formatting
export const formatStEthEth = (stEthEth: BigNumber, manyDigits: boolean) => {
  const ratio = new BigDecimal(1)
    .div(new BigDecimal(stEthEth).div(ETHER))
    .times(ETHER);

  return formatWEI(ratio, manyDigits);
};

export const simpleFormatCurrency = (
  input: BigNumber,
  manyDigits: boolean,
  decimalOverride?: number,
) => {
  const decimals = decimalOverride
    ? HUMAN_DECIMALS_CURRENCY + decimalOverride
    : manyDigits
      ? PRECISE_DECIMALS_CURRENCY
      : HUMAN_DECIMALS_CURRENCY;

  const options = {
    currency: 'USD', // TODO: make dynamic if beneficial
    maximumFractionDigits: decimals,
  };

  return new Intl.NumberFormat('en-GB', options).format(input.toNumber());
};

export const formatCurrency = <T>(
  input: BigNumber,
  manyDigits: boolean,
  decimalOverride?: number,
): string | T => {
  // Early sanity exit
  if (decimalOverride && decimalOverride >= 10) {
    return '0';
  }

  const formatted = simpleFormatCurrency(input, manyDigits, decimalOverride);
  if (formatted !== '0') {
    return formatted;
  } else {
    return formatCurrency(
      input,
      manyDigits,
      decimalOverride ? decimalOverride + 1 : 1,
    );
  }
};

export const formatPercentage = (input: BigNumber, manyDigits: boolean) => {
  const decimals = manyDigits
    ? PRECISE_DECIMALS_PERCENT
    : HUMAN_DECIMALS_PERCENT;

  return input.decimalPlaces(decimals).toString();
};
