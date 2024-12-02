import { formatEther, getAddress } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'consts/external-links';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { getRateTokenAddress } from 'consts/token-addresses';

import { getOneInchRate } from 'utils/get-one-inch-rate';
import { getBebopRate } from 'utils/get-bebop-rate';
import { getOpenOceanRate } from 'utils/get-open-ocean-rate';
import { standardFetcher } from 'utils/standardFetcher';

import { BebopIcon, OneInchIcon, OpenOceanIcon, ParaSwapIcon } from './icons';

import type {
  DexWithdrawalApi,
  DexWithdrawalIntegrationMap,
  GetRateType,
  RateCalculationResult,
} from './types';
import { TOKENS_TO_WITHDRAWLS } from '../../types/tokens-withdrawable';

const RATE_PRECISION = 100000;
const RATE_PRECISION_BIG_INT = BigInt(RATE_PRECISION);

// Helper function to calculate rate for SRC->DEST swap
// accepts amount, so toReceive can be calculated when src!=amount
const calculateRateReceive = (
  amount: bigint,
  src: bigint,
  dest: bigint,
): RateCalculationResult => {
  const _rate = (dest * RATE_PRECISION_BIG_INT) / src;
  const toReceive = (amount * dest) / src;
  const rate = Number(_rate) / RATE_PRECISION;
  return { rate, toReceive };
};

const getOpenOceanWithdrawalRate: GetRateType = async ({ amount, token }) => {
  if (amount && amount > 0n) {
    try {
      const result = await getOpenOceanRate(amount, token, 'ETH');
      return result;
    } catch (e) {
      console.warn(
        '[getOpenOceanWithdrawalRate] Failed to receive withdraw rate',
        e,
      );
    }
  }

  return {
    rate: null,
    toReceive: null,
  };
};

type ParaSwapPriceResponsePartial = {
  priceRoute: {
    srcAmount: string;
    destAmount: string;
  };
};

const getParaSwapWithdrawalRate: GetRateType = async ({ amount, token }) => {
  try {
    if (amount > 0n) {
      const api = `https://apiv5.paraswap.io/prices`;
      const query = new URLSearchParams({
        srcToken: getRateTokenAddress(CHAINS.Mainnet, token) as string,
        srcDecimals: '18',
        destToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        destDecimals: '18',
        side: 'SELL',
        excludeDirectContractMethods: 'true',
        userAddress: '0x0000000000000000000000000000000000000000',
        amount: amount.toString(),
        network: '1',
        partner: 'lido',
      });

      const url = `${api}?${query.toString()}`;
      const data: ParaSwapPriceResponsePartial =
        await standardFetcher<ParaSwapPriceResponsePartial>(url);
      const toReceive = BigInt(data.priceRoute.destAmount);

      const rate = calculateRateReceive(
        amount,
        BigInt(data.priceRoute.srcAmount),
        toReceive,
      ).rate;

      return {
        rate,
        toReceive: BigInt(data.priceRoute.destAmount),
      };
    }
  } catch (e) {
    console.warn(
      '[getParaSwapWithdrawalRate] Failed to receive withdraw rate',
      e,
    );
  }

  return {
    rate: null,
    toReceive: null,
  };
};

const getOneInchWithdrawalRate: GetRateType = async (params) => {
  try {
    if (params.amount > 0n) {
      const result = await getOneInchRate(params);
      return result;
    }
  } catch (e) {
    console.warn(
      '[getOneInchWithdrawalRate] Failed to receive withdraw rate',
      e,
    );
  }
  return {
    rate: null,
    toReceive: null,
  };
};

const getBebopWithdrawalRate: GetRateType = async ({ amount, token }) => {
  try {
    if (amount > 0n) {
      return await getBebopRate(amount, token, 'ETH');
    }
  } catch (e) {
    console.warn(
      '[getOneInchWithdrawalRate] Failed to receive withdraw rate',
      e,
    );
  }
  return {
    rate: null,
    toReceive: null,
  };
};

const dexWithdrawalMap: DexWithdrawalIntegrationMap = {
  'open-ocean': {
    title: 'OpenOcean',
    fetcher: getOpenOceanWithdrawalRate,
    icon: OpenOceanIcon,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToOpenOcean,
    link: (amount, token) =>
      `https://app.openocean.finance/classic?referrer=${OPEN_OCEAN_REFERRAL_ADDRESS}&amount=${formatEther(
        amount,
      )}#/ETH/${token}/ETH`,
  },
  paraswap: {
    title: 'ParaSwap',
    icon: ParaSwapIcon,
    fetcher: getParaSwapWithdrawalRate,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToParaswap,
    link: (amount, token) =>
      `https://app.paraswap.xyz/?referrer=Lido&takeSurplus=true#/swap/${
        getRateTokenAddress(CHAINS.Mainnet, token) as string
      }-0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/${formatEther(
        amount,
      )}/SELL?version=6.2&network=ethereum`,
  },
  'one-inch': {
    title: '1inch',
    fetcher: getOneInchWithdrawalRate,
    icon: OneInchIcon,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoTo1inch,
    link: (amount, token) =>
      `https://app.1inch.io/#/1/advanced/swap/${
        token === TOKENS_TO_WITHDRAWLS.stETH ? 'stETH' : 'wstETH'
      }/ETH?mode=classic&sourceTokenAmount=${formatEther(amount)}`,
  },
  bebop: {
    title: 'Bebop',
    icon: BebopIcon,
    fetcher: getBebopWithdrawalRate,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToBebop,
    link: (amount, token) =>
      `https://bebop.xyz/trade?network=ethereum&buy=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&sell=${getAddress(
        getRateTokenAddress(CHAINS.Mainnet, token) as string,
      )}&sellAmounts=${formatEther(amount)}&source=lido`,
  },
} as const;

export const getDexConfig = (dexKey: DexWithdrawalApi) =>
  dexWithdrawalMap[dexKey];
