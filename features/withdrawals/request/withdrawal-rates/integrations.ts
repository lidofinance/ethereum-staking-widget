import { Zero } from '@ethersproject/constants';
import { getTokenAddress, CHAINS, TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';

import { getOneInchRate } from 'utils/get-one-inch-rate';
import { getOpenOceanRate } from 'utils/get-open-ocean-rate';
import { standardFetcher } from 'utils/standardFetcher';
import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'config/external-links';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config/matomoClickEvents';

import { OneInchIcon, OpenOceanIcon, ParaSwapIcon } from './icons';

import type {
  DexWithdrawalApi,
  DexWithdrawalIntegrationMap,
  GetRateType,
  RateCalculationResult,
} from './types';
import { FetcherError } from 'utils/fetcherError';

const RATE_PRECISION = 100000;
const RATE_PRECISION_BN = BigNumber.from(RATE_PRECISION);

// Helper function to calculate rate for SRC->DEST swap
// accepts amount, so toReceive can be calculated when src!=amount
const calculateRateReceive = (
  amount: BigNumber,
  src: BigNumber,
  dest: BigNumber,
): RateCalculationResult => {
  const _rate = dest.mul(RATE_PRECISION_BN).div(src);
  const toReceive = amount.mul(dest).div(src);
  const rate = _rate.toNumber() / RATE_PRECISION;
  return { rate, toReceive };
};

const checkError = (e: unknown) => e instanceof FetcherError && e.status <= 500;

const getOpenOceanWithdrawalRate: GetRateType = async ({ amount, token }) => {
  let isServiceAvailable = true;
  if (amount && amount.gt(Zero)) {
    try {
      return {
        ...(await getOpenOceanRate(amount, token, 'ETH')),
        isServiceAvailable,
      };
    } catch (e) {
      console.warn(
        '[getOpenOceanWithdrawalRate] Failed to receive withdraw rate',
        e,
      );
      isServiceAvailable = checkError(e);
    }
  }

  return {
    rate: null,
    toReceive: null,
    isServiceAvailable,
  };
};

type ParaSwapPriceResponsePartial = {
  priceRoute: {
    srcAmount: string;
    destAmount: string;
  };
};

const getParaSwapWithdrawalRate: GetRateType = async ({ amount, token }) => {
  let isServiceAvailable = true;
  try {
    if (amount.gt(Zero)) {
      const api = `https://apiv5.paraswap.io/prices`;
      const query = new URLSearchParams({
        srcToken: getTokenAddress(CHAINS.Mainnet, token),
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
      const toReceive = BigNumber.from(data.priceRoute.destAmount);

      const rate = calculateRateReceive(
        amount,
        BigNumber.from(data.priceRoute.srcAmount),
        toReceive,
      ).rate;

      return {
        rate,
        toReceive: BigNumber.from(data.priceRoute.destAmount),
        isServiceAvailable,
      };
    }
  } catch (e) {
    console.warn(
      '[getParaSwapWithdrawalRate] Failed to receive withdraw rate',
      e,
    );
    isServiceAvailable = checkError(e);
  }

  return {
    rate: null,
    toReceive: null,
    isServiceAvailable,
  };
};

const getOneInchWithdrawalRate: GetRateType = async (params) => {
  let isServiceAvailable = true;
  try {
    if (params.amount.gt(Zero)) {
      return { ...(await getOneInchRate(params)), isServiceAvailable };
    }
  } catch (e) {
    console.warn(
      '[getOneInchWithdrawalRate] Failed to receive withdraw rate',
      e,
    );
    isServiceAvailable = checkError(e);
  }
  return {
    rate: null,
    toReceive: null,
    isServiceAvailable,
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
      `https://app.paraswap.io/?referrer=Lido&takeSurplus=true#/${getTokenAddress(
        CHAINS.Mainnet,
        token,
      )}-0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/${formatEther(
        amount,
      )}/SELL?network=ethereum`,
  },
  'one-inch': {
    title: '1inch',
    fetcher: getOneInchWithdrawalRate,
    icon: OneInchIcon,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoTo1inch,
    link: (amount, token) =>
      `https://app.1inch.io/#/1/simple/swap/${
        token == TOKENS.STETH ? 'stETH' : 'wstETH'
      }/ETH?sourceTokenAmount=${formatEther(amount)}`,
  },
} as const;

export const getDexConfig = (dexKey: DexWithdrawalApi) =>
  dexWithdrawalMap[dexKey];
