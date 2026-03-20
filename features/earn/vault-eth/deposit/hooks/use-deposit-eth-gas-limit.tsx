import { useMemo } from 'react';
import invariant from 'tiny-invariant';

import { useDepositEthGasLimit } from 'modules/mellow-meta-vaults';
import { useMainnetOnlyWagmi } from 'modules/web3/web3-provider/web3-provider';
import { getSyncDepositQueueContract } from '../../contracts';
import { EthDepositToken } from '../../types';

export const useETHDepositEthGasLimit = (token: EthDepositToken) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');
  const depositContract = useMemo(
    () =>
      getSyncDepositQueueContract({
        publicClient: publicClientMainnet,
        token,
      }),
    [publicClientMainnet, token],
  );

  return useDepositEthGasLimit({ depositContract });
};
