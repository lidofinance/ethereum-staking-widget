const useQueryMock = vi.hoisted(() => vi.fn());
const configMock = vi.hoisted(() => ({
  enableQaHelpers: false,
  ipfsMode: false,
  STAKE_SWAP_INTEGRATION: 'one-inch',
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: useQueryMock }));
vi.mock('config', () => ({ config: configMock }));
vi.mock('../integrations', () => ({ getSwapIntegration: vi.fn() }));

import { useSwapDiscount } from '../use-swap-discount';

describe('useSwapDiscount', () => {
  beforeEach(() => {
    configMock.ipfsMode = false;
    configMock.STAKE_SWAP_INTEGRATION = 'one-inch';
    useQueryMock.mockReset();
  });

  it('enables the 1inch rate request in a server deployment', () => {
    useSwapDiscount();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it('disables the 1inch rate request in an IPFS build', () => {
    configMock.ipfsMode = true;

    useSwapDiscount();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('does not disable other swap integrations in an IPFS build', () => {
    configMock.ipfsMode = true;
    configMock.STAKE_SWAP_INTEGRATION = 'open-ocean';

    useSwapDiscount();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });
});
