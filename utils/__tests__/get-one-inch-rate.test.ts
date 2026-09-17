import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

import { standardFetcher } from '../standardFetcher';
import { getOneInchRate } from '../get-one-inch-rate';

const configMock = vi.hoisted(() => ({
  basePath: undefined as string | undefined,
}));

vi.mock('config', () => ({ config: configMock }));
vi.mock('../standardFetcher', () => ({ standardFetcher: vi.fn() }));

const standardFetcherMock = vi.mocked(standardFetcher);

describe('getOneInchRate', () => {
  beforeEach(() => {
    configMock.basePath = undefined;
    standardFetcherMock.mockResolvedValue({
      rate: 1.005,
      toReceive: '1005000000000000000',
      fromAmount: '1000000000000000000',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses the local Next.js API route for server deployments', async () => {
    await getOneInchRate({ token: LIDO_TOKENS.eth });

    expect(standardFetcherMock).toHaveBeenCalledWith(
      '/api/swap/one-inch?token=ETH',
    );
  });

  it('preserves the configured base path', async () => {
    configMock.basePath = '/widget';

    await getOneInchRate({
      token: LIDO_TOKENS.steth,
      amount: 500000000000000000n,
    });

    expect(standardFetcherMock).toHaveBeenCalledWith(
      '/widget/api/swap/one-inch?token=stETH&amount=500000000000000000',
    );
  });
});
