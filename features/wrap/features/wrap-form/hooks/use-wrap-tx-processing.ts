import invariant from 'tiny-invariant';

import { useCallback } from 'react';
import { useSDK, useWSTETHContractWeb3 } from '@lido-sdk/react';

import { CHAINS } from '@lido-sdk/constants';
import { getFeeData } from 'utils/getFeeData';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';

export const getGasParameters = async (chainId: CHAINS) => {
  const feeData = await getFeeData(chainId);
  return {
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
    maxFeePerGas: feeData.maxFeePerGas ?? undefined,
  };
};

type WrapTxProcessorArgs = {
  isMultisig: boolean;
  amount: BigNumber;
  token: string;
};

export const useWrapTxProcessing = () => {
  const { chainId, providerWeb3 } = useSDK();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  return useCallback(
    async ({ isMultisig, amount, token }: WrapTxProcessorArgs) => {
      invariant(chainId, 'must have chain id');
      invariant(providerWeb3, 'must have providerWeb3');
      invariant(wstethContractWeb3, 'must have wstethContractWeb3');

      if (token === TOKENS.STETH) {
        if (isMultisig) {
          const tx = await wstethContractWeb3.populateTransaction.wrap(amount);
          return providerWeb3.getSigner().sendUncheckedTransaction(tx);
        } else {
          return wstethContractWeb3.wrap(
            amount,
            await getGasParameters(chainId),
          );
        }
      } else {
        const wstethTokenAddress = getTokenAddress(chainId, TOKENS.WSTETH);
        if (isMultisig) {
          return providerWeb3.getSigner().sendUncheckedTransaction({
            to: wstethTokenAddress,
            value: amount,
          });
        } else {
          return wstethContractWeb3.signer.sendTransaction({
            to: wstethTokenAddress,
            value: amount,
            ...(await getGasParameters(chainId)),
          });
        }
      }
    },
    [chainId, providerWeb3, wstethContractWeb3],
  );
};
