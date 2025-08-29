import { useQuery } from '@tanstack/react-query';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getGGVTellerContract, getGGVVaultContract } from '../../contracts';
import { INFINITE_DEPOSIT_CAP } from '../../consts';

type DepositStatusResponse = {
  canDeposit: boolean;
  reason: 'pause' | 'cap' | null;
};

export const useGGVDepositStatus = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  return useQuery<DepositStatusResponse>({
    queryKey: ['ggv', 'deposit-status'],
    queryFn: async () => {
      const teller = getGGVTellerContract(publicClientMainnet);
      const vault = getGGVVaultContract(publicClientMainnet);

      const [isPaused, depositCap, totalSupply] = await Promise.all([
        teller.read.isPaused(),
        teller.read.depositCap(),
        vault.read.totalSupply(),
      ]);

      if (isPaused) {
        return {
          canDeposit: false,
          reason: 'pause',
        };
      }

      if (depositCap !== INFINITE_DEPOSIT_CAP && totalSupply === depositCap) {
        return {
          canDeposit: false,
          reason: 'cap',
        };
      }

      return {
        canDeposit: true,
        reason: null,
      };
    },
  });
};
