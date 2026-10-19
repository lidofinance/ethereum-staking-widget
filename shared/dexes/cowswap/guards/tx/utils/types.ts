import { type Address, type Hex } from 'viem';
import { z } from 'zod';

import { CowSwapGPv2OrderSchema } from './schemas';

// ERC-20 token keys usable in CoW Swap profiles
export type DexTokenContractKey =
  | 'lido'
  | 'wsteth'
  | 'ldo'
  | 'weth'
  | 'usdc'
  | 'usdt'
  | 'usde'
  | 'dai'
  | 'usds'
  | 'pyusd'
  | 'wbtc'
  | 'cbbtc';

// CoW contracts and tokens of one network; a token without an address is not traded there
export type CowswapNetwork = Partial<Record<DexTokenContractKey, string>> & {
  cowSettlement: string;
  cowVaultRelayer: string;
  cowEthFlow?: string;
  weth: string;
  // swap stays disabled on a network without it
  partnerFeeRecipient?: string;
};

// Token contract key or native ETH placeholder
export type DexTokenKey = DexTokenContractKey | 'eth';

export type NetworkTxConfig = {
  tokens: Set<Address>;
  sellTokens: Set<Address>;
  buyTokens: Set<Address>;
  cowVaultRelayer: Address;
  cowSettlement: Address;
  // native ETH is sold only through EthFlow; absent on networks without it
  cowEthFlow?: Address;
  weth: Address;
  feeRecipient: Address;
};

export type ValidationResult<T = never> = {
  allowed: boolean;
  reason?: string;
} & ([T] extends [never]
  ? object
  : { allowed: true; result: T } | { allowed: false; result?: undefined });

export type ValidationContext = {
  chainId: number;
  signer: Address;
  networkTxConfig: NetworkTxConfig;
  // expected appData.appCode of the integration
  appCode: string;
};

export type OrderData = z.infer<typeof CowSwapGPv2OrderSchema>;

export type ApprovalData = {
  token: Address;
  amount: bigint;
};

export type CancelOrderData = {
  isCancel: true;
  orderUid: Hex;
};
