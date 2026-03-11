import { useQuery } from '@tanstack/react-query';

import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';

import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

import { getGGVQueueContract } from '../contracts';
import { useGGVWithdrawalState } from '../withdraw/hooks/use-ggv-withdrawal-state';

export const useGgvUsd = (ggvShares?: bigint) => {
  const { wrap } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const { data: withdrawalState } = useGGVWithdrawalState();

  const query = useQuery({
    queryKey: [
      'ggv',
      'ggv-wsteth',
      {
        ggvShares: ggvShares?.toString(),
        minDiscount: withdrawalState?.minDiscount.toString() ?? '1',
      },
    ] as const,
    enabled: typeof ggvShares === 'bigint',
    queryFn: async () => {
      if (!ggvShares)
        return {
          wsteth: 0n,
        };

      const queue = getGGVQueueContract(publicClientMainnet);

      const wstethAddress = await wrap.contractAddressWstETH();

      const wstethAmount = await queue.read.previewAssetsOut([
        wstethAddress,
        ggvShares,
        // for preview we can assume minDiscount will be 1 during short loading time
        withdrawalState?.minDiscount ?? 1,
      ]);

      return {
        wsteth: wstethAmount,
      };
    },
  });

  const usdQuery = useWstethUsd(query.data?.wsteth);

  return {
    isLoading: query.isLoading || usdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      usd: usdQuery.usdAmount,
      eth: usdQuery.ethAmount,
    },
  };
};
