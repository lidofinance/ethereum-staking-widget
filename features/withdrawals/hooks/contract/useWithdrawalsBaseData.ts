import { BigNumber } from 'ethers';
import { useSDK, useLidoSWR, SWRResponse } from '@lido-sdk/react';

import { STRATEGY_CONSTANT } from 'consts/swr-strategies';

import { useWithdrawalsContract } from './useWithdrawalsContract';

type useWithdrawalsBaseDataResult = {
  maxAmount: BigNumber;
  minAmount: BigNumber;
  isPaused: boolean;
  isBunker: boolean;
  isTurbo: boolean;
};

export const useWithdrawalsBaseData =
  (): SWRResponse<useWithdrawalsBaseDataResult> => {
    const { chainId } = useSDK();
    const { contractRpc } = useWithdrawalsContract();

    return useLidoSWR(
      ['swr:wqBaseData', contractRpc?.address, chainId],
      async () => {
        const [minAmount, maxAmount, isPausedMode, isBunkerMode] =
          await Promise.all([
            contractRpc.MIN_STETH_WITHDRAWAL_AMOUNT(),
            contractRpc.MAX_STETH_WITHDRAWAL_AMOUNT(),
            contractRpc.isPaused(),
            contractRpc.isBunkerModeActive(),
          ]);

        const isPaused = !!isPausedMode;
        const isBunker = !!isBunkerMode;
        const isTurbo = !isPaused && !isBunkerMode;

        return { minAmount, maxAmount, isPaused, isBunker, isTurbo };
      },
      STRATEGY_CONSTANT,
    );
  };
