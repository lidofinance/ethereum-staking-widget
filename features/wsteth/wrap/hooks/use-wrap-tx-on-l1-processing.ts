import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useSDK, useWSTETHContractWeb3 } from '@lido-sdk/react';
import { TOKENS } from '@lido-sdk/constants';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { config } from 'config';
import { MockLimitReachedError } from 'features/stake/stake-form/utils';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { getFeeData } from 'utils/getFeeData';

import type { WrapFormInputType } from '../wrap-form-context';
import { sendTx } from 'utils/send-tx';
import { PopulatedTransaction } from 'ethers';

export const getGasParameters = async (
  provider: StaticJsonRpcBatchProvider,
) => {
  const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData(provider);
  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
  };
};

type WrapTxProcessorArgs = WrapFormInputType & {
  isMultisig: boolean;
};

export const useWrapTxOnL1Processing = () => {
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
        const tx = await wstethContractWeb3.populateTransaction.wrap(amount);
        return sendTx({
          tx,
          isMultisig,
          staticProvider: staticRpcProvider,
          walletProvider: providerWeb3,
        });
      } else {
        if (
          config.enableQaHelpers &&
          window.localStorage.getItem('mockLimitReached') === 'true'
        ) {
          throw new MockLimitReachedError('Stake limit reached');
        }
        const from = await providerWeb3.getSigner().getAddress();
        const tx: PopulatedTransaction = {
          to: wstethContractWeb3.address,
          value: amount,
          from,
        };

        return sendTx({
          tx,
          isMultisig,
          staticProvider: staticRpcProvider,
          walletProvider: providerWeb3,
          shouldApplyGasLimitRatio: true,
        });
      }
    },
    [chainId, providerWeb3, staticRpcProvider, wstethContractWeb3],
  );
};
