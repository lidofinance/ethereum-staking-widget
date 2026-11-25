import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData, getContract } from 'viem';
import type { TransactionCallback } from '@lidofinance/lido-ethereum-sdk/core';

import { wethABI } from 'abi/weth-abi';
import { getTokenAddress } from 'config/networks/token-address';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { type AACall, useLidoSDK } from 'modules/web3';

type UnwrapWethArgs = {
  amount: bigint;
  callback: TransactionCallback;
};

// Lido's submit() takes ETH only. WETH9 withdraw() burns the caller's WETH and
// sends the ETH back to them, so staking WETH is "unwrap, then submit".
// The SDK has no WETH module, so the contract is addressed directly here.
export const useWethUnwrap = () => {
  const { core } = useLidoSDK();
  const wethAddress = getTokenAddress(core.chainId, TOKEN_SYMBOLS.weth);

  return useMemo(() => {
    const getWethAddress = () => {
      invariant(wethAddress, 'WETH is not supported on the current chain');
      return wethAddress;
    };

    const unwrapPopulateTx = (amount: bigint): AACall => ({
      to: getWethAddress(),
      data: encodeFunctionData({
        abi: wethABI,
        functionName: 'withdraw',
        args: [amount],
      }),
    });

    const unwrap = ({ amount, callback }: UnwrapWethArgs) => {
      const contract = getContract({
        address: getWethAddress(),
        abi: wethABI,
        client: { public: core.publicClient, wallet: core.useWalletClient() },
      });
      return core.performTransaction({
        callback,
        getGasLimit: (options) =>
          contract.estimateGas.withdraw([amount], options),
        sendTransaction: (options) =>
          contract.write.withdraw([amount], options),
      });
    };

    return {
      wethAddress,
      isWethSupported: !!wethAddress,
      unwrapPopulateTx,
      unwrap,
    };
  }, [core, wethAddress]);
};
