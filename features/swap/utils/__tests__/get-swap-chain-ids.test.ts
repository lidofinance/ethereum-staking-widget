import { arbitrum, base, mainnet, sepolia } from 'viem/chains';

import { getSwapChainIds } from '../get-swap-chain-ids';

const PROFILE = [mainnet.id, arbitrum.id, base.id];

describe('getSwapChainIds', () => {
  it('keeps every profile chain without switches', () => {
    expect(getSwapChainIds(PROFILE, {})).toEqual(PROFILE);
  });

  it('drops an L2 turned off in the manifest', () => {
    expect(getSwapChainIds(PROFILE, { [base.id]: { enabled: false } })).toEqual(
      [mainnet.id, arbitrum.id],
    );
  });

  it('cannot turn off L1', () => {
    expect(
      getSwapChainIds([mainnet.id, sepolia.id], {
        [mainnet.id]: { enabled: false },
        [sepolia.id]: { enabled: false },
      }),
    ).toEqual([mainnet.id, sepolia.id]);
  });

  it('cannot add a chain missing in the profile', () => {
    expect(
      getSwapChainIds([mainnet.id], { [base.id]: { enabled: true } }),
    ).toEqual([mainnet.id]);
  });
});
