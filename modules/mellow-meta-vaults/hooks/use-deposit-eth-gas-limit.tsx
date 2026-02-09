import { useMemo } from 'react';
import { useEstimateGas } from 'wagmi';
import { encodeFunctionData } from 'viem';

import { config } from 'config';
import { ESTIMATE_ACCOUNT } from 'config/groups/web3';
import { ESTIMATE_AMOUNT, useMainnetOnlyWagmi } from 'modules/web3';
import { Contract } from '../types/contract';

export const useDepositEthGasLimit = ({
  depositContract,
}: {
  depositContract: Contract;
}) => {
  const { mainnetConfig } = useMainnetOnlyWagmi();

  const estimateArgs = useMemo(() => {
    const depositArgs = [
      ESTIMATE_AMOUNT,
      config.FALLBACK_REFERRAL_ADDRESS,
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
