import { useLidoSWR, SWRResponse } from '@lido-sdk/react';

import { STRATEGY_CONSTANT } from 'consts/swr-strategies';
import { useDappStatus } from 'modules/web3';

import { useWithdrawalsContract } from './useWithdrawalsContract';

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

        return {
          minAmount: minAmount?.toBigInt(),
          maxAmount: maxAmount?.toBigInt(),
          isPaused,
          isBunker,
          isTurbo,
        };
      },
      STRATEGY_CONSTANT,
    );
  };
