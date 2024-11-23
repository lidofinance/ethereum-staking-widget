import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

type UseWithdrawalsBaseDataResult = {
  maxAmount: bigint;
  minAmount: bigint;
  isPaused: boolean;
  isBunker: boolean;
  isTurbo: boolean;
};

export const useWithdrawalsBaseData =
  (): UseQueryResult<UseWithdrawalsBaseDataResult> => {
    const { withdraw } = useLidoSDK();

    return useQuery<UseWithdrawalsBaseDataResult>({
      queryKey: ['query:withdrawalsBaseData', withdraw.core.chain],
      ...STRATEGY_CONSTANT,
      queryFn: async () => {
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
    });
  };
