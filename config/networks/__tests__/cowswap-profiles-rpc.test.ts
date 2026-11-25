import { describe, expect, it } from 'vitest';
import { ethAddress } from 'viem';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { WITHDRAWALS_COWSWAP_PROFILE } from 'features/dex-withdrawals/cowswap/consts';
import { SWAP_COWSWAP_PROFILE } from 'features/swap/cowswap/consts';

// /api/rpc allows eth_call only to contracts from the networks map; the CoW
// widget calls its tokens and contracts through it
describe('CoW Swap profiles vs /api/rpc allowlist', () => {
  it.each([
    ['withdrawals', WITHDRAWALS_COWSWAP_PROFILE],
    ['swap', SWAP_COWSWAP_PROFILE],
  ])(
    'allows eth_call to every %s CoW Swap token and contract on its networks',
    (_, profile) => {
      // same mapping the proxy builds per chain, without the supportedChains filter
      for (const chainId of profile.chainIds) {
        const chainAllowed = new Set(
          Object.values(CONTRACT_NAMES).flatMap((name) => {
            const address = getContractAddress(chainId, name);
            return address ? [address.toLowerCase()] : [];
          }),
        );
        const config = profile.getNetworkTxConfig(chainId);
        const addresses = config
          ? [
              ...config.tokens,
              config.cowSettlement,
              config.cowVaultRelayer,
              ...(config.cowEthFlow ? [config.cowEthFlow] : []),
            ]
          : [];
        const missing = addresses.filter(
          (address) => address !== ethAddress && !chainAllowed.has(address),
        );

        expect({ chainId, missing }).toEqual({ chainId, missing: [] });
      }
    },
  );
});
