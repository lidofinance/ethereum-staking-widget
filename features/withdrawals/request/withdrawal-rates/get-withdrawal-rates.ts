import { Zero } from '@ethersproject/constants';
import { getTokenAddress, CHAINS, TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';

import { getOpenOceanRate } from 'utils/get-open-ocean-rate';
import { standardFetcher } from 'utils/standardFetcher';

import type {
  DexWithdrawalApi,
  DexWithdrawalIntegrationMap,
  GetRateType,
  GetWithdrawalRateParams,
  GetWithdrawalRateResult,
  RateCalculationResult,
} from './types';
import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'config/external-links';
import { formatEther } from '@ethersproject/units';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config/matomoClickEvents';
import { OneInchIcon, OpenOceanIcon, ParaSwapIcon } from './icons';
import dynamics from 'config/dynamics';
import { prependBasePath } from 'utils/prependBasePath';

const RATE_PRECISION = 100000;
const RATE_PRECISION_BN = BigNumber.from(RATE_PRECISION);

// Helper function to calculate rate for SRC->DEST swap
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
      return await getOpenOceanRate(amount, token, 'ETH');
    } catch (e) {
      console.warn('[getOpenOceanRate] Failed to receive withdraw rate', e);
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

const getParaSwapRate: GetRateType = async ({ amount, token }) => {
  let rateInfo: RateCalculationResult | null = null;

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

      rateInfo = {
        rate: calculateRateReceive(
          amount,
          BigNumber.from(data.priceRoute.srcAmount),
          BigNumber.from(data.priceRoute.destAmount),
        ).rate,
        toReceive: BigNumber.from(data.priceRoute.destAmount),
      };
    }
  } catch {
    rateInfo = null;
  }

  return {
    rate: rateInfo?.rate ?? null,
    toReceive: rateInfo?.toReceive ?? null,
  };
};

const getOneInchRate: GetRateType = async ({ amount, token }) => {
  let rateInfo: RateCalculationResult | null = null;

  try {
    if (amount.gt(Zero)) {
      const apiOneInchRatePath = `api/oneinch-rate?token=${token}&amount=${amount.toString()}`;
      const data = await standardFetcher<{
        rate: number;
        toReceive: string;
      }>(
        dynamics.ipfsMode
          ? `${dynamics.widgetApiBasePathForIpfs}/${apiOneInchRatePath}`
          : prependBasePath(apiOneInchRatePath),
      );
      rateInfo = {
        rate: data.rate,
        toReceive: BigNumber.from(data.toReceive),
      };
    }
  } catch {
    rateInfo = null;
  }

  return {
    rate: rateInfo?.rate ?? null,
    toReceive: rateInfo?.toReceive ?? null,
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
    fetcher: getParaSwapRate,
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
    fetcher: getOneInchRate,
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

export const getWithdrawalRates = async (
  params: GetWithdrawalRateParams,
): Promise<GetWithdrawalRateResult> => {
  const rates = await Promise.all(
    params.dexes.map((dexKey) => {
      const dex = getDexConfig(dexKey);
      return dex.fetcher(params).then((result) => ({
        ...dex,
        ...result,
      }));
    }),
  );

  if (rates.length > 1) {
    // sort by rate, then alphabetic
    rates.sort((r1, r2) => {
      const rate1 = r1.rate ?? 0;
      const rate2 = r2.rate ?? 0;
      if (rate1 == rate2) {
        return r1.title.toLowerCase() > r2.title.toLowerCase() ? 1 : -1;
      }
      return rate2 - rate1;
    });
  }

  return rates;
};
