import { TOKENS } from 'consts/tokens';
import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

import { useUsdVaultDeposit } from '../use-deposit';
import type { UsdDepositToken } from '../../../types';

type SyncQueueGetter = (args: {
  publicClient: unknown;
  walletClient: unknown;
  token: UsdDepositToken;
}) => unknown;

const { SYNC_QUEUE, useDeposit, getSyncDepositQueueWritableContract } =
  vi.hoisted(() => ({
    SYNC_QUEUE: { address: '0x00000000000000000000000000000000000000c1' },
    useDeposit: vi.fn(
      (_args: { syncDepositQueueGetter: SyncQueueGetter }) => ({}),
    ),
    getSyncDepositQueueWritableContract: vi.fn(),
  }));

vi.mock('modules/mellow-meta-vaults', () => ({
  useDeposit,
  useTxModalStagesDeposit: () => ({ txModalStages: {} }),
  getVaultRefetchScope: () => [],
}));
vi.mock('modules/web3', () => ({
  useMainnetOnlyWagmi: () => ({ publicClientMainnet: {} }),
}));
vi.mock('features/earn/vault-usd/contracts', () => ({
  getAsyncDepositQueueWritableContract: vi.fn(),
  getCollectorContract: vi.fn(),
  getSyncDepositQueueWritableContract,
}));

const getSyncQueueGetter = () => {
  renderHook(() =>
    useUsdVaultDeposit({ shownQuote: undefined, refetchQuote: undefined }),
  );
  const getter = useDeposit.mock.lastCall?.[0].syncDepositQueueGetter;
  expect(getter).toBeTypeOf('function');
  return getter as SyncQueueGetter;
};

const clients = { publicClient: {}, walletClient: {} };

describe('useUsdVaultDeposit sync deposit queue', () => {
  beforeEach(() => {
    getSyncDepositQueueWritableContract.mockReset();
    getSyncDepositQueueWritableContract.mockReturnValue(SYNC_QUEUE);
  });

  it('has no sync queue for USDe', () => {
    const getter = getSyncQueueGetter();

    expect(getter({ ...clients, token: TOKENS.usde })).toBeUndefined();
    expect(getSyncDepositQueueWritableContract).not.toHaveBeenCalled();
  });

  it.each([TOKENS.usdc, TOKENS.usdt] as const)(
    'gives %s its sync queue',
    (token) => {
      const getter = getSyncQueueGetter();

      expect(getter({ ...clients, token })).toBe(SYNC_QUEUE);
      expect(getSyncDepositQueueWritableContract).toHaveBeenCalledWith({
        ...clients,
        token,
      });
    },
  );
});
