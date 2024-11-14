import { useLidoSWR, SWRResponse } from '@lido-sdk/react';

import { STRATEGY_CONSTANT } from 'consts/swr-strategies';
import { useDappStatus, useLidoSDK } from 'modules/web3';

type useWithdrawalsBaseDataResult = {
  maxAmount: bigint;
  minAmount: bigint;
  isPaused: boolean;
  isBunker: boolean;
  isTurbo: boolean;
};

export const useWithdrawalsBaseData =
  (): SWRResponse<useWithdrawalsBaseDataResult> => {
    const { chainId } = useDappStatus();
    const { withdraw } = useLidoSDK();

    return useLidoSWR(
      ['swr:wqBaseData', withdraw, chainId],
      async () => {
        const [minAmount, maxAmount, isPausedMode, isBunkerMode, isTurboMode] =
          await Promise.all([
            withdraw.views.minStethWithdrawalAmount(),
            withdraw.views.maxStethWithdrawalAmount(),
            withdraw.views.isPaused(),
            withdraw.views.isBunkerModeActive(),
            withdraw.views.isTurboModeActive(),
          ]);

        const isPaused = !!isPausedMode;
        const isBunker = !!isBunkerMode;
        const isTurbo = !!isTurboMode;

        return {
          minAmount,
          maxAmount,
          isPaused,
          isBunker,
          isTurbo,
        };
      },
      STRATEGY_CONSTANT,
    );
  };
