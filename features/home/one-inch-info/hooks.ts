import { BigNumber } from 'ethers';

import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { useLidoSWR, SWRResponse } from '@lido-sdk/react';

import { getOneInchRateApiUrl } from 'config/one-inch';
import { standardFetcher } from 'utils/standardFetcher';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

export type UseOneInchRateType = {
  rate: number | null;
  swr: SWRResponse<number | null>;
};

const DEFAULT_AMOUNT = BigNumber.from(10).pow(18);

export const useOneInchRate = (): UseOneInchRateType => {
  const swr = useLidoSWR(
    ['swr:1inch-rate'],
    async () => {
      const { url } = getOneInchRateApiUrl(
        getTokenAddress(CHAINS.Mainnet, TOKENS.STETH),
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        DEFAULT_AMOUNT.toString(),
      );

      const data = await standardFetcher<{ toAmount: string }>(url);

      if (!data || !data.toAmount) {
        return null;
      } else {
        return (
          BigNumber.from(data.toAmount)
            .mul(BigNumber.from(100000))
            .div(DEFAULT_AMOUNT)
            .toNumber() / 100000
        );
      }
    },
    {
      ...STRATEGY_LAZY,
    },
  );

  return {
    rate: swr.data ?? null,
    swr,
  };
};
