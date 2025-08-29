import { formatEther, getAddress } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'consts/external-links';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { getTokenAddress } from 'config/networks/token-address';

import { getOneInchRate } from 'utils/get-one-inch-rate';
import { getBebopRate } from 'utils/get-bebop-rate';
import { getOpenOceanRate } from 'utils/get-open-ocean-rate';
import { getJumperRate } from 'utils/get-jumper-rate';
import { standardFetcher } from 'utils/standardFetcher';
import { calculateRateReceive } from 'utils/calculate-rate-to-receive';

import {
  BebopIcon,
  OneInchIcon,
  OpenOceanIcon,
  VeloraIcon,
  JumperIcon,
} from './icons';

import type {
  DexWithdrawalApi,
  DexWithdrawalIntegrationMap,
  GetRateType,
} from './types';
import { TOKENS_TO_WITHDRAWLS } from '../../types/tokens-withdrawable';

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
        srcToken: getTokenAddress(CHAINS.Mainnet, token) as string,
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
  const fallback = { rate: null, toReceive: null };

  try {
    if (params.amount > 0n) {
      return (await getOneInchRate(params)) ?? fallback;
    }
  } catch (e) {
    console.warn(
      '[getOneInchWithdrawalRate] Failed to receive withdraw rate',
      e,
    );
  }

  return fallback;
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

const getJumperWithdrawalRate: GetRateType = async (params) => {
  try {
    if (params.amount > 0n) {
      return await getJumperRate(params);
    }
  } catch (e) {
    console.warn(
      '[getJumperWithdrawalRate] Failed to receive withdraw rate',
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
    title: 'Velora',
    icon: VeloraIcon,
    fetcher: getParaSwapWithdrawalRate,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToParaswap,
    link: (amount, token) =>
      `https://app.velora.xyz/?referrer=Lido&takeSurplus=true#/swap/${
        getTokenAddress(CHAINS.Mainnet, token) as string
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
      `https://app.1inch.io/swap?src=1:${token === TOKENS_TO_WITHDRAWLS.stETH ? 'stETH' : 'wstETH'}&dst=1:ETH&sourceTokenAmount=${formatEther(
        amount,
      )}`,
  },
  bebop: {
    title: 'Bebop',
    icon: BebopIcon,
    fetcher: getBebopWithdrawalRate,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToBebop,
    link: (amount, token) =>
      `https://bebop.xyz/trade?network=ethereum&buy=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&sell=${getAddress(
        getTokenAddress(CHAINS.Mainnet, token) as string,
      )}&sellAmounts=${formatEther(amount)}&source=lido`,
  },
  jumper: {
    title: 'Jumper',
    icon: JumperIcon,
    fetcher: getJumperWithdrawalRate,
    matomoEvent: MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToJumper,
    link: (amount, token) =>
      `https://jumper.exchange/?fromAmount=${formatEther(
        amount,
      )}&fromChain=1&fromToken=${
        getTokenAddress(CHAINS.Mainnet, token) as string
      }&toChain=1&toToken=0x0000000000000000000000000000000000000000`,
  },
} as const;

export const getDexConfig = (dexKey: DexWithdrawalApi) =>
  dexWithdrawalMap[dexKey];
