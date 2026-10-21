import { ethAddress, type Address } from 'viem';

import { collectTokenAddresses } from './token-addresses';
import type { CowswapNetwork, DexTokenKey, NetworkTxConfig } from './types';

export const buildNetworkTxConfig = (
  contracts: CowswapNetwork & { partnerFeeRecipient: string },
  sellTokenKeys: readonly DexTokenKey[],
  buyTokenKeys: readonly DexTokenKey[],
): NetworkTxConfig => {
  const ethFlow = contracts.cowEthFlow?.toLowerCase() as Address | undefined;
  const sellTokens = collectTokenAddresses(contracts, sellTokenKeys);
  if (!ethFlow) sellTokens.delete(ethAddress);

  return {
    // contract tokens only, native ETH placeholder excluded
    tokens: collectTokenAddresses(
      contracts,
      [...sellTokenKeys, ...buyTokenKeys].filter((key) => key !== 'eth'),
    ),
    sellTokens,
    buyTokens: collectTokenAddresses(contracts, buyTokenKeys),
    cowVaultRelayer: contracts.cowVaultRelayer.toLowerCase() as Address,
    cowSettlement: contracts.cowSettlement.toLowerCase() as Address,
    cowEthFlow: ethFlow,
    weth: contracts.weth.toLowerCase() as Address,
    feeRecipient: contracts.partnerFeeRecipient.toLowerCase() as Address,
  };
};
