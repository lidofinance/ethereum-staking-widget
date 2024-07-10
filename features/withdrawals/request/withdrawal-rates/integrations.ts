import { BigNumber } from 'ethers';
import { getAddress } from 'ethers/lib/utils.js';
import { Zero } from '@ethersproject/constants';
import { formatEther } from '@ethersproject/units';
import { getTokenAddress, CHAINS, TOKENS } from '@lido-sdk/constants';

import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'consts/external-links';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';

import { getOneInchRate } from 'utils/get-one-inch-rate';
import { getBebopRate } from 'utils/get-bebop-rate';
import { getOpenOceanRate } from 'utils/get-open-ocean-rate';
import { standardFetcher } from 'utils/standardFetcher';

import {
  BebopIcon,
  OneInchIcon,
  OpenOceanIcon,
  ParaSwapIcon,
  JumperIcon,
} from './icons';

import type {
  DexWithdrawalApi,
  DexWithdrawalIntegrationMap,
  GetRateType,
  RateCalculationResult,
} from './types';
import { getJumperRate } from 'utils/get-jumper-rate';

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

const getOpenOceanWithdrawalRate: GetRateType = async ({ amount, token }) => {
  if (amount && amount.gt(Zero)) {
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
    if (params.amount.gt(Zero)) {
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
    if (amount.gt(Zero)) {
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

const getJumperWithdrawalRate: GetRateType = async ({ amount, token }) => {
  try {
    if (amount.gt(Zero)) {
      return await getJumperRate(amount, token, 'ETH');
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
      `https://app.1inch.io/#/1/advanced/swap/${
        token == TOKENS.STETH ? 'stETH' : 'wstETH'
      }/ETH?mode=classic&sourceTokenAmount=${formatEther(amount)}`,
  },
  bebop: {
    title: 'Bebop',
    icon: BebopIcon,
    fetcher: getBebopWithdrawalRate,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToBebop,
    link: (amount, token) =>
      `https://bebop.xyz/trade?network=ethereum&buy=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&sell=${getAddress(
        getTokenAddress(CHAINS.Mainnet, token),
      )}&sellAmounts=${formatEther(amount)}&source=lido`,
  },
  jumper: {
    title: 'Jumper',
    icon: JumperIcon,
    fetcher: getJumperWithdrawalRate,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToJumper,
    link: (amount, token) =>
      `https://jumper.exchange/?fromAmount=${formatEther(amount)}&fromChain=1&fromToken=${getAddress(
        getTokenAddress(CHAINS.Mainnet, token),
      )}&source=lido&toChain=1&toToken=0x0000000000000000000000000000000000000000`,
  },
} as const;

export const getDexConfig = (dexKey: DexWithdrawalApi) =>
  dexWithdrawalMap[dexKey];
