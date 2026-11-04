import { getWalletClientQueryOptions } from 'wagmi/query';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'viem/chains';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { queryClient } from './query-client';

const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

describe('queryClient', () => {
  const walletClientInterval = (status: 'success' | 'error') => {
    const options = queryClient.defaultQueryOptions(
      getWalletClientQueryOptions(config, { chainId: mainnet.id }),
    );
    const { refetchInterval } = options;
    expect(typeof refetchInterval).toBe('function');
    return (refetchInterval as (query: unknown) => unknown)({
      state: { status },
    });
  };

  it('does not poll a working wagmi wallet client', () => {
    expect(walletClientInterval('success')).toBe(false);
  });

  it('retries a failed wagmi wallet client with the default poll', () => {
    expect(walletClientInterval('error')).toBe(STRATEGY_LAZY.refetchInterval);
  });

  it('keeps the default poll for other queries', () => {
    const options = queryClient.defaultQueryOptions({ queryKey: ['balance'] });
    expect(options.refetchInterval).toBe(STRATEGY_LAZY.refetchInterval);
  });
});
