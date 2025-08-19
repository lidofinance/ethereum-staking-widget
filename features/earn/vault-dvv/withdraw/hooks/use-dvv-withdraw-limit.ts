import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getDVVVaultContract } from '../../contracts';

export const useDVVWithdrawLimit = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['dvvWithdrawLimit'],
    queryFn: async () => {
      invariant(publicClientMainnet?.chain?.id, 'Public client is required');

      const vault = getDVVVaultContract(publicClientMainnet);
      const isWithdrawalPaused = await vault.read.withdrawalPause();

      return { isWithdrawalPaused };
    },
  });
};
