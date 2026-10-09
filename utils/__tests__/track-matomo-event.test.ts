import { callMatomo } from '@lidofinance/analytics-matomo';

import { MATOMO_TX_EVENTS_TYPES, getMatomoChainSlug } from 'consts/matomo';
import { trackMatomoEvent } from '../track-matomo-event';
import { DISCONNECTED_CHAIN_ID, getTrackedChain } from '../tracked-chain';

vi.mock('@lidofinance/analytics-matomo', () => ({ callMatomo: vi.fn() }));
vi.mock('../tracked-chain', () => ({
  DISCONNECTED_CHAIN_ID: 0,
  getTrackedChain: vi.fn(),
}));

const EVENT = [
  'Ethereum_Staking_Widget',
  'Initiating staking transaction',
  'eth_widget_staking_start',
];

describe('getMatomoChainSlug', () => {
  it('uses the known chain name, lowercased, with the id', () => {
    expect(getMatomoChainSlug(1)).toBe('mainnet-1');
    expect(getMatomoChainSlug(8453)).toBe('base-8453');
    expect(getMatomoChainSlug(11155420)).toBe('optimismsepolia-11155420');
  });

  it('marks unknown chains', () => {
    expect(getMatomoChainSlug(1337)).toBe('unknown-1337');
  });

  it('marks the disconnected state', () => {
    expect(getMatomoChainSlug(DISCONNECTED_CHAIN_ID)).toBe('disconnected-0');
  });
});

describe('trackMatomoEvent', () => {
  beforeEach(() => {
    vi.mocked(callMatomo).mockClear();
    vi.mocked(getTrackedChain).mockReturnValue(10);
  });

  it('always attaches the wallet chain, even without params', () => {
    trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingStart);
    expect(callMatomo).toHaveBeenCalledWith('trackEvent', ...EVENT, undefined, {
      dimension2: 'optimism-10',
    });
  });

  it('adds the lowercased token when given', () => {
    trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingStart, { token: 'WETH' });
    expect(callMatomo).toHaveBeenCalledWith('trackEvent', ...EVENT, undefined, {
      dimension2: 'optimism-10',
      dimension3: 'weth',
    });
  });

  it('prefers an explicit chain over the wallet chain', () => {
    trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingStart, {
      chainId: 1,
      token: 'ETH',
    });
    expect(callMatomo).toHaveBeenCalledWith('trackEvent', ...EVENT, undefined, {
      dimension2: 'mainnet-1',
      dimension3: 'eth',
    });
  });

  it('passes a numeric value through to Matomo', () => {
    trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingStart, { value: 1.5 });
    expect(callMatomo).toHaveBeenCalledWith('trackEvent', ...EVENT, 1.5, {
      dimension2: 'optimism-10',
    });
  });

  it('reports disconnected when no wallet is connected', () => {
    vi.mocked(getTrackedChain).mockReturnValue(DISCONNECTED_CHAIN_ID);
    trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingStart);
    expect(callMatomo).toHaveBeenCalledWith('trackEvent', ...EVENT, undefined, {
      dimension2: 'disconnected-0',
    });
  });
});
