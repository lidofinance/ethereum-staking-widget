import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { getSwapIntegration } from './integrations';
import type {
  FetchRateResult,
  StakeSwapDiscountIntegrationKey,
  StakeSwapDiscountIntegrationValue,
} from './types';

const DISCOUNT_THRESHOLD = 1.004;
const MOCK_LS_KEY = 'mock-qa-helpers-discount-rate';

if (config.enableQaHelpers && typeof window !== 'undefined') {
  (window as any).setMockDiscountRate = (rate?: number) =>
    rate === undefined
      ? localStorage.removeItem(MOCK_LS_KEY)
      : localStorage.setItem(MOCK_LS_KEY, rate.toString());
}

// we show banner if STETH is considerably cheaper to get on dex than staking
// ETH -> stETH rate > THRESHOLD
const fetchRate = async (
  integrationKey: StakeSwapDiscountIntegrationKey,
): Promise<FetchRateResult & StakeSwapDiscountIntegrationValue> => {
  const integration = getSwapIntegration(integrationKey);
  let rate: number;
  const mock = localStorage.getItem(MOCK_LS_KEY);
  if (config.enableQaHelpers && mock) {
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
  return useQuery({
    queryKey: ['swap-discount-rate', config.STAKE_SWAP_INTEGRATION],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      try {
        return await fetchRate(config.STAKE_SWAP_INTEGRATION);
      } catch (err) {
        console.warn(`[useSwapDiscount] Error fetching ETH -> stETH: ${err}`);
        // This line is necessary so that useQuery can handle the error and return undefined
        throw err;
      }
    },
  });
};
