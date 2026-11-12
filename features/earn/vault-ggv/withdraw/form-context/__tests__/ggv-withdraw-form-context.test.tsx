import { useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { FormControllerContext } from 'shared/hook-form/form-controller';

const AMOUNT = 10n ** 18n;

type MockState = {
  featureFlags: Record<string, unknown>;
  queueWithdraw: ReturnType<typeof vi.fn>;
  bulkWithdraw: ReturnType<typeof vi.fn>;
  isQueueStateEnabled?: boolean;
  isBulkStateEnabled?: boolean;
};

const state = vi.hoisted((): MockState => ({
  featureFlags: {},
  queueWithdraw: vi.fn(async () => false),
  bulkWithdraw: vi.fn(async () => false),
}));

vi.mock('config', () => ({
  useConfig: () => ({ externalConfig: { featureFlags: state.featureFlags } }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ refetchQueries: vi.fn() }),
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ isDappActive: true, isWalletConnected: true }),
}));
vi.mock('features/earn/vault-eth/consts', () => ({
  ETH_VAULT_QUERY_SCOPE: 'earn-vault-eth',
}));
vi.mock('../../../hooks/use-ggv-available', () => ({
  useGGVAvailable: () => ({ isGGVAvailable: true, isWithdrawEnabled: true }),
}));
vi.mock('../../../hooks/use-ggv-position', () => ({
  useGGVPosition: () => ({ data: { sharesBalance: AMOUNT } }),
}));
vi.mock('../../hooks/use-ggv-withdrawal-requests', () => ({
  useGGVWithdrawalRequests: () => ({ isLoading: false, data: undefined }),
}));
vi.mock('../../hooks/use-ggv-shares-state', () => ({
  useGGVUserShareState: () => ({ isLoading: false, data: undefined }),
}));
vi.mock('../../hooks/use-is-unlocked', () => ({ useIsUnlocked: () => false }));
// Record which state query each mode turns on
vi.mock('../../hooks/use-ggv-withdrawal-state', () => ({
  useGGVWithdrawalState: (enabled: boolean) => {
    state.isQueueStateEnabled = enabled;
    return { isLoading: false, data: undefined };
  },
}));
vi.mock('../../hooks/use-ggv-bulk-withdrawal-state', () => ({
  useGGVBulkWithdrawalState: (enabled: boolean) => {
    state.isBulkStateEnabled = enabled;
    return { isLoading: false, data: undefined };
  },
}));
vi.mock('../../hooks/use-ggv-withdraw', () => ({
  useGGVWithdraw: () => ({ withdrawGGV: state.queueWithdraw }),
}));
vi.mock('../../hooks/use-ggv-bulk-withdraw', () => ({
  useGGVBulkWithdraw: () => ({ withdrawGGV: state.bulkWithdraw }),
}));

import { GGVWithdrawFormProvider, useGGVWithdrawForm } from '..';

// Renders the real provider and submits the form like the submit button does
const renderAndSubmit = async () => {
  let isBulkWithdraw: boolean | undefined;
  let onSubmit: ((values: { amount: bigint }) => Promise<boolean>) | undefined;
  const Probe = () => {
    isBulkWithdraw = useGGVWithdrawForm().isBulkWithdraw;
    onSubmit = useContext(FormControllerContext)?.onSubmit;
    return null;
  };
  renderToStaticMarkup(
    <GGVWithdrawFormProvider>
      <Probe />
    </GGVWithdrawFormProvider>,
  );
  await onSubmit?.({ amount: AMOUNT });
  return { isBulkWithdraw };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GGVWithdrawFormProvider mode selection', () => {
  it.each([
    ['omitted', {}],
    ['false', { ggvBulkWithdrawEnabled: false }],
  ])('uses the wstETH queue when the flag is %s', async (_, featureFlags) => {
    state.featureFlags = featureFlags;

    const { isBulkWithdraw } = await renderAndSubmit();

    // The preview and texts read this value
    expect(isBulkWithdraw).toBe(false);
    expect(state.isQueueStateEnabled).toBe(true);
    expect(state.isBulkStateEnabled).toBe(false);
    expect(state.queueWithdraw).toHaveBeenCalledWith({ amount: AMOUNT });
    expect(state.bulkWithdraw).not.toHaveBeenCalled();
  });

  it('uses the instant WETH withdraw when the flag is true', async () => {
    state.featureFlags = { ggvBulkWithdrawEnabled: true };

    const { isBulkWithdraw } = await renderAndSubmit();

    expect(isBulkWithdraw).toBe(true);
    expect(state.isQueueStateEnabled).toBe(false);
    expect(state.isBulkStateEnabled).toBe(true);
    expect(state.bulkWithdraw).toHaveBeenCalledWith({ amount: AMOUNT });
    expect(state.queueWithdraw).not.toHaveBeenCalled();
  });
});
