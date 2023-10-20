import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useSDK, useWSTETHContractWeb3 } from '@lido-sdk/react';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { getFeeData } from 'utils/getFeeData';

import type { WrapFormInputType } from '../wrap-form-context';

export const getGasParameters = async (
  provider: StaticJsonRpcBatchProvider,
) => {
  const feeData = await getFeeData(provider);
  return {
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
    maxFeePerGas: feeData.maxFeePerGas ?? undefined,
  };
};

type WrapTxProcessorArgs = WrapFormInputType & {
  isMultisig: boolean;
};

export const useWrapTxProcessing = () => {
  const { chainId, providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  return useCallback(
    async ({ isMultisig, amount, token }: WrapTxProcessorArgs) => {
      invariant(amount, 'amount id must be presented');
      invariant(chainId, 'chain id must be presented');
      invariant(providerWeb3, 'providerWeb3 must be presented');
      invariant(wstethContractWeb3, 'wstethContractWeb3 must be presented');

      if (token === TOKENS.STETH) {
        if (isMultisig) {
          const tx = await wstethContractWeb3.populateTransaction.wrap(amount);
          return providerWeb3.getSigner().sendUncheckedTransaction(tx);
        } else {
          return wstethContractWeb3.wrap(
            amount,
            await getGasParameters(staticRpcProvider),
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
            ...(await getGasParameters(staticRpcProvider)),
          });
        }
      }
    },
    [chainId, providerWeb3, staticRpcProvider, wstethContractWeb3],
  );
};
