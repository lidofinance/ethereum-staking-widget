import { type Address, type Hex } from 'viem';
import { z } from 'zod';

import mainnetNetwork from 'networks/mainnet.json';

import { CowSwapGPv2OrderSchema } from './schemas';

export type ContactsMap = typeof mainnetNetwork.contracts;

// ERC-20 token keys of network contracts usable in CoW Swap profiles
export type DexTokenContractKey = Extract<
  keyof ContactsMap,
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
  | 'cbbtc'
>;

// Token contract key or native ETH placeholder
export type DexTokenKey = DexTokenContractKey | 'eth';

export type NetworkTxConfig = {
  tokens: Set<Address>;
  sellTokens: Set<Address>;
  buyTokens: Set<Address>;
  cowVaultRelayer: Address;
  cowSettlement: Address;
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
