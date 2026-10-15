import { CHAINS } from 'consts/chains';

import { assignRpcUrl } from './rpc-urls';

const saved = {
  [CHAINS.Mainnet]: 'https://l1.example',
  [CHAINS.Optimism]: 'https://l2.example',
};

// SETTINGS-RPC-PERSIST-01: saving or resetting one chain must keep the others
describe('assignRpcUrl', () => {
  it('replaces only the given chain', () => {
    expect(assignRpcUrl(saved, CHAINS.Optimism, 'https://new.example')).toEqual(
      {
        [CHAINS.Mainnet]: 'https://l1.example',
        [CHAINS.Optimism]: 'https://new.example',
      },
    );
  });

  it('adds a chain without touching existing entries', () => {
    expect(assignRpcUrl(saved, CHAINS.Hoodi, 'https://hoodi.example')).toEqual({
      ...saved,
      [CHAINS.Hoodi]: 'https://hoodi.example',
    });
  });

  it('removes only the given chain on reset', () => {
    expect(assignRpcUrl(saved, CHAINS.Optimism)).toEqual({
      [CHAINS.Mainnet]: 'https://l1.example',
    });
    expect(assignRpcUrl(saved, CHAINS.Optimism, '')).toEqual({
      [CHAINS.Mainnet]: 'https://l1.example',
    });
  });

  it('does not mutate the input', () => {
    assignRpcUrl(saved, CHAINS.Mainnet);
    expect(saved[CHAINS.Mainnet]).toBe('https://l1.example');
  });
});
