import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { useDepositEthGasLimit } from 'modules/mellow-meta-vaults';
import { getDepositQueueContract } from '../../contracts';
import { EthDepositTokens } from '../../types';

export const useETHDepositEthGasLimit = (token: EthDepositTokens) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');
  const depositContract = getDepositQueueContract({ publicClient, token });

  return useDepositEthGasLimit({ depositContract });
};
