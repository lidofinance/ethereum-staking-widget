import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { useLidoSWR } from '@lido-sdk/react';
import { enableQaHelpers } from 'utils';
import type {
  FetchRateResult,
  StakeSwapDiscountIntegrationKey,
  StakeSwapDiscountIntegrationValue,
} from './types';
import { STAKE_SWAP_INTEGRATION } from 'config';
import { getSwapIntegration } from './integrations';

const DISCOUNT_THRESHOLD = 1.004;
const MOCK_LS_KEY = 'mock-qa-helpers-discount-rate';

if (enableQaHelpers && typeof window !== 'undefined') {
  (window as any).setMockDiscountRate = (rate?: number) =>
    rate === undefined
      ? localStorage.removeItem(MOCK_LS_KEY)
      : localStorage.setItem(MOCK_LS_KEY, rate.toString());
}

// we show banner if STETH is considerably cheaper to get on dex than staking
// ETH -> stETH rate > THRESHOLD
const fetchRate = async (
  _: string,
  integrationKey: StakeSwapDiscountIntegrationKey,
): Promise<FetchRateResult & StakeSwapDiscountIntegrationValue> => {
  const integration = getSwapIntegration(integrationKey);
  let rate: number;
  const mock = localStorage.getItem(MOCK_LS_KEY);
  if (enableQaHelpers && mock) {
    rate = parseFloat(mock);
  } else {
    rate = await integration.getRate();
  }
  return {
    ...integration,
    rate,
    shouldShowDiscount: rate > DISCOUNT_THRESHOLD,
    discountPercent: (1 - 1 / rate) * 100,
  };
};

export const useSwapDiscount = () => {
  return useLidoSWR(
    ['swr:swap-discount-rate', STAKE_SWAP_INTEGRATION],
    // @ts-expect-error useLidoSWR has broken fetcher-key type signature
    fetchRate,
    {
      ...STRATEGY_LAZY,
      onError(error, key) {
        console.warn(
          `[useSwapDiscount] Error fetching ETH->Steth:`,
          key,
          error,
        );
      },
    },
  );
};
