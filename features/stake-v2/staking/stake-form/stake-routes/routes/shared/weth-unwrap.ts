import { encodeFunctionData, getContract } from 'viem';
import type { TransactionCallback } from '@lidofinance/lido-ethereum-sdk/core';

import { wethABI } from 'abi/weth-abi';
import { TOKENS } from 'consts/tokens';
import type { TxStep } from 'modules/web3';

import { getTokenAddressOrThrow } from '../../../../../utils';
import type { StakeRouteSubmitTools } from '../../types';

import { STAKE_STEP } from './steps';

type LidoCore = StakeRouteSubmitTools['lidoSDK']['core'];

// Lido stakes ETH only. WETH9 withdraw() burns the caller's WETH and sends
// the ETH back, so staking WETH is "unwrap, then stake". The SDK has no WETH
// module, so the contract is addressed directly

/** the unwrap step: a batch call for AA wallets */
export const unwrapWethStep = (chainId: number, amount: bigint): TxStep => ({
  stepId: STAKE_STEP.unwrap,
  to: getTokenAddressOrThrow(chainId, TOKENS.weth),
  data: encodeFunctionData({
    abi: wethABI,
    functionName: 'withdraw',
    args: [amount],
  }),
});

/** the unwrap as its own transaction, for EOAs */
export const sendUnwrapWeth = (
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
