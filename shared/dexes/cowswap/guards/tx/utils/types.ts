import { type Address, type Hex } from 'viem';
import { z } from 'zod';

import mainnetNetwork from 'networks/mainnet.json';

import { CowSwapGPv2OrderSchema } from './schemas';

export type ContactsMap = typeof mainnetNetwork.contracts;

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
};

export type OrderData = z.infer<typeof CowSwapGPv2OrderSchema>;

export type CancelOrderData = {
  isCancel: true;
  orderUid: Hex;
};
