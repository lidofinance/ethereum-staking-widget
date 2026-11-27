import { encodeFunctionData, getContract } from 'viem';
import type { TransactionCallback } from '@lidofinance/lido-ethereum-sdk/core';

import { wethABI } from 'abi/weth-abi';
import { TOKENS } from 'consts/tokens';
import type { AACall } from 'modules/web3';

import { getTokenAddressOrThrow } from '../../../../../utils';
import type { StakeRouteSubmitTools } from '../../types';

type LidoCore = StakeRouteSubmitTools['lidoSDK']['core'];

// Lido's submit() takes ETH only. WETH9 withdraw() burns the caller's WETH
// and sends the ETH back, so staking WETH is "unwrap, then submit". The SDK
// has no WETH module, so the contract is addressed directly

/** the unwrap as a batch call (AA wallets) */
export const unwrapWethCall = (chainId: number, amount: bigint): AACall => ({
  to: getTokenAddressOrThrow(chainId, TOKENS.weth),
  data: encodeFunctionData({
    abi: wethABI,
    functionName: 'withdraw',
    args: [amount],
  }),
});

/** the unwrap as a separate transaction (legacy wallets) */
export const unwrapWeth = (
  core: LidoCore,
  amount: bigint,
  callback: TransactionCallback,
) => {
  const contract = getContract({
    address: getTokenAddressOrThrow(core.chainId, TOKENS.weth),
    abi: wethABI,
    client: { public: core.publicClient, wallet: core.useWalletClient() },
  });
  return core.performTransaction({
    callback,
    getGasLimit: (options) => contract.estimateGas.withdraw([amount], options),
    sendTransaction: (options) => contract.write.withdraw([amount], options),
  });
};
