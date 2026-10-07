import { getAddress } from 'viem';

import {
  LIDO_L2_STAKING_CHAIN_IDS,
  LIDO_L2_STAKING_CONTRACT_MAP,
} from '../const';

describe('LIDO_L2_STAKING_CONTRACT_MAP', () => {
  it.each(LIDO_L2_STAKING_CHAIN_IDS)(
    'has a checksummed WETH address for chain %s',
    (chainId) => {
      const { L2WETH } =
        LIDO_L2_STAKING_CONTRACT_MAP[
          chainId as keyof typeof LIDO_L2_STAKING_CONTRACT_MAP
        ];
      expect(L2WETH).toBeDefined();
      // the RPC allowlist compares checksummed addresses
      expect(getAddress(L2WETH)).toBe(L2WETH);
    },
  );
});
