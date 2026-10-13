import { type Address } from 'viem';

import {
  collectTokenAddresses,
  collectSellTokenAddresses,
  collectBuyTokenAddresses,
} from './token-addresses';
import type { ContactsMap, NetworkTxConfig } from './types';

export const buildNetworkTxConfig = (
  contracts: ContactsMap,
  dexTokenKeys: readonly (keyof ContactsMap)[],
  sellTokenKeys: readonly (keyof ContactsMap)[],
  buyTokenKeys: readonly (keyof ContactsMap)[],
): NetworkTxConfig => ({
  tokens: collectTokenAddresses(contracts, dexTokenKeys),
  sellTokens: collectSellTokenAddresses(contracts, sellTokenKeys),
  buyTokens: collectBuyTokenAddresses(contracts, buyTokenKeys),
  cowVaultRelayer: contracts.cowVaultRelayer.toLowerCase() as Address,
  cowSettlement: contracts.cowSettlement.toLowerCase() as Address,
  feeRecipient: contracts.daoAgent.toLowerCase() as Address,
});
