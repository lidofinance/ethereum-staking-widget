import { useQuery } from '@tanstack/react-query';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getDVVVaultContract } from '../contracts';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

export const useDvvUsd = (dvvShares?: bigint) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const query = useQuery({
    queryKey: [
      'dvv',
      'dvv-wsteth',
      { dvvShares: dvvShares?.toString() },
    ] as const,
    enabled: dvvShares != undefined,
    queryFn: async () => {
      const vault = getDVVVaultContract(publicClientMainnet);

      const wsteth = dvvShares
        ? await vault.read.convertToAssets([dvvShares])
        : 0n;

      return {
        wsteth,
      };
    },
  });

  const usdQuery = useWstethUsd(
    query.data?.wsteth,
    publicClientMainnet.chain?.id,
  );

  return {
    isLoading: query.isLoading || usdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      usd: usdQuery.usdAmount,
      eth: usdQuery.ethAmount,
    },
  };
};
