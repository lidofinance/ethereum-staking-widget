import { formatEther, parseEther } from 'viem';
import {
  ETHER,
  HUMAN_DECIMALS,
  PRECISE_DECIMALS,
  HUMAN_DECIMALS_PERCENT,
  PRECISE_DECIMALS_PERCENT,
  HUMAN_DECIMALS_CURRENCY,
  PRECISE_DECIMALS_CURRENCY,
} from 'features/rewards/constants';

export const formatWEI = (input: string, manyDigits?: boolean) => {
  const ethers = formatEther(parseEther(input) / ETHER);
  if (manyDigits) {
    return Number(ethers).toFixed(PRECISE_DECIMALS);
  }
  return Number(ethers).toFixed(HUMAN_DECIMALS);
};

export const formatETH = (input: string, manyDigits?: boolean) => {
  return parseFloat(input).toFixed(
    manyDigits ? PRECISE_DECIMALS : HUMAN_DECIMALS,
  );
};

export const formatStEthEth = (input: string, manyDigits?: boolean) => {
  const ethers = formatEther(parseEther(input) / ETHER);
  if (manyDigits) {
    return ethers;
  }
  return Number(ethers).toFixed(HUMAN_DECIMALS);
};

export const formatCurrency = (
  input: string,
  manyDigits?: boolean,
  moreHumanAccuracy = false,
) => {
  const options = {
    currency: 'USD',
    maximumFractionDigits: manyDigits
      ? PRECISE_DECIMALS_CURRENCY
      : HUMAN_DECIMALS_CURRENCY + (moreHumanAccuracy ? 2 : 0),
    // with a humanMoreAccuracy - $0.0043
    // without a humanMoreAccuracy - $3,820.91
  };

  return new Intl.NumberFormat('en-GB', options).format(Number(input));
};

export const formatPercentage = (input: string, manyDigits?: boolean) => {
  if (manyDigits) {
    return Number(input).toFixed(PRECISE_DECIMALS_PERCENT);
  }
  return Number(input).toFixed(HUMAN_DECIMALS_PERCENT);
};
