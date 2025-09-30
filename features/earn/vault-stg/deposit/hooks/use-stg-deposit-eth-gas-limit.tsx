import { useMemo } from 'react';
import { useEstimateGas } from 'wagmi';
import { encodeFunctionData } from 'viem';

import { config } from 'config';
import { ESTIMATE_ACCOUNT } from 'config/groups/web3';
import { ESTIMATE_AMOUNT, useMainnetOnlyWagmi } from 'modules/web3';
import { getSTGDepositQueueContract } from '../../contracts';
import { STG_DEPOSIT_TOKENS } from '../form-context/types';

export const useSTGDepositEthGasLimit = (token: STG_DEPOSIT_TOKENS) => {
  const { mainnetConfig, publicClientMainnet } = useMainnetOnlyWagmi();

  const depositContract = getSTGDepositQueueContract({
    publicClient: publicClientMainnet,
    token,
  });

  const estimateArgs = useMemo(() => {
    const depositArgs = [
      ESTIMATE_AMOUNT,
      config.STAKE_FALLBACK_REFERRAL_ADDRESS,
      [],
    ] as const;

    return {
      to: depositContract.address,
      data: encodeFunctionData({
        abi: depositContract.abi,
        functionName: 'deposit',
        args: depositArgs,
      }),
      value: ESTIMATE_AMOUNT,
      account: ESTIMATE_ACCOUNT,
    };
  }, [depositContract.abi, depositContract.address]);

  return useEstimateGas({
    config: mainnetConfig,
    ...estimateArgs,
  });
};
