import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { encodeFunctionData, zeroAddress } from 'viem';
import { useEstimateGas } from 'wagmi';

import { ESTIMATE_AMOUNT, useMainnetOnlyWagmi } from 'modules/web3';
import { getTokenAddress } from 'config/networks/token-address';
import { ESTIMATE_ACCOUNT } from 'config/groups/web3';

import {
  getDVVDepositWrapperContract,
  getDVVVaultContract,
} from '../../contracts';

export const useDVVDepositEthGasLimit = () => {
  const { mainnetConfig, publicClientMainnet } = useMainnetOnlyWagmi();

  const estimateArgs = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ethAddress = getTokenAddress(publicClientMainnet.chain!.id, 'ETH');
    const wrapper = getDVVDepositWrapperContract(publicClientMainnet);
    const vault = getDVVVaultContract(publicClientMainnet);
    invariant(ethAddress);
    return {
      data: encodeFunctionData({
        abi: wrapper.abi,
        functionName: 'deposit',
        args: [
          ethAddress,
          ESTIMATE_AMOUNT,
          vault.address,
          ESTIMATE_ACCOUNT,
          zeroAddress,
        ],
      }),
      value: ESTIMATE_AMOUNT,
      to: wrapper.address,
      account: ESTIMATE_ACCOUNT,
    };
  }, [publicClientMainnet]);

  return useEstimateGas({
    config: mainnetConfig,
    ...estimateArgs,
  });
};
