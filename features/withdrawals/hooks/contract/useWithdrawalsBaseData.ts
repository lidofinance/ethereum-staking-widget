import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { UseLidoQueryResult, useLidoQuery } from 'shared/hooks/use-lido-query';
import { useLidoSDK } from 'modules/web3';

type UseWithdrawalsBaseDataResult = {
  maxAmount: bigint;
  minAmount: bigint;
  isPaused: boolean;
  isBunker: boolean;
  isTurbo: boolean;
};

export const useWithdrawalsBaseData =
  (): UseLidoQueryResult<UseWithdrawalsBaseDataResult> => {
    const { withdraw } = useLidoSDK();

    return useLidoQuery<UseWithdrawalsBaseDataResult>({
      queryKey: ['query:withdrawalsBaseData', withdraw.core.chain],
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
      strategy: STRATEGY_CONSTANT,
    });
  };
