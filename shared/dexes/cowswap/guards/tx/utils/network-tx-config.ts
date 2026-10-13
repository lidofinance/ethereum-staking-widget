import type { Address } from 'viem';

import { collectTokenAddresses } from './token-addresses';
import type { ContactsMap, DexTokenKey, NetworkTxConfig } from './types';

export const buildNetworkTxConfig = (
  contracts: ContactsMap,
  sellTokenKeys: readonly DexTokenKey[],
  buyTokenKeys: readonly DexTokenKey[],
): NetworkTxConfig => ({
  // contract tokens only, native ETH placeholder excluded
  tokens: collectTokenAddresses(
    contracts,
    [...sellTokenKeys, ...buyTokenKeys].filter((key) => key !== 'eth'),
  ),
  sellTokens: collectTokenAddresses(contracts, sellTokenKeys),
  buyTokens: collectTokenAddresses(contracts, buyTokenKeys),
  cowVaultRelayer: contracts.cowVaultRelayer.toLowerCase() as Address,
  cowSettlement: contracts.cowSettlement.toLowerCase() as Address,
  feeRecipient: contracts.daoAgent.toLowerCase() as Address,
});
