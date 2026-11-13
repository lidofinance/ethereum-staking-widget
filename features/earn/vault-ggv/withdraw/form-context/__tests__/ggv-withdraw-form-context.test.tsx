import { useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useFormState } from 'react-hook-form';

import { FormControllerContext } from 'shared/hook-form/form-controller';

const AMOUNT = 10n ** 18n;

type StateQuery = { isLoading: boolean; isError: boolean; data?: object };

const BULK_STATE = {
  canWithdraw: true,
  reason: null,
  rate: 2n * AMOUNT,
  shareDecimals: 18,
  minimumShares: 1n,
  withdrawCapacity: 100n * AMOUNT,
};

type MockState = {
  featureFlags: Record<string, unknown>;
  queueWithdraw: ReturnType<typeof vi.fn>;
  bulkWithdraw: ReturnType<typeof vi.fn>;
  refetchBalance: ReturnType<typeof vi.fn>;
  isQueueStateEnabled?: boolean;
  isBulkStateEnabled?: boolean;
  // The state query of the selected mode
  stateQuery: StateQuery;
};

const state = vi.hoisted((): MockState => ({
  featureFlags: {},
  queueWithdraw: vi.fn(async () => false),
  bulkWithdraw: vi.fn(async () => false),
  refetchBalance: vi.fn(),
  stateQuery: { isLoading: false, isError: false },
}));

vi.mock('config', () => ({
  useConfig: () => ({ externalConfig: { featureFlags: state.featureFlags } }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ refetchQueries: vi.fn() }),
  // The queue preview query; the bulk preview does not use it
  useQuery: () => ({ isLoading: false, data: undefined }),
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ isDappActive: true, isWalletConnected: true }),
  useLidoSDK: () => ({ wrap: {} }),
}));
// Mocks for the preview hook
vi.mock('wagmi', () => ({ usePublicClient: () => ({}) }));
vi.mock('shared/hooks', () => ({ useDebouncedValue: <T,>(value: T) => value }));
vi.mock('shared/hooks/use-wsteth-usd', () => ({
  useWstethUsd: () => ({ isLoading: false }),
}));
vi.mock('shared/hooks/use-eth-usd', () => ({
  useEthUsd: () => ({ isLoading: false }),
}));
// GGV consts import SVG icons, which do not load in the test environment
vi.mock('assets/earn', () => ({ PartnerVedaIcon: () => null }));
vi.mock('../../../contracts', () => ({ getGGVQueueContract: vi.fn() }));
vi.mock('features/earn/vault-eth/consts', () => ({
  ETH_VAULT_QUERY_SCOPE: 'earn-vault-eth',
}));
vi.mock('../../../hooks/use-ggv-available', () => ({
  useGGVAvailable: () => ({ isGGVAvailable: true, isWithdrawEnabled: true }),
}));
vi.mock('../../../hooks/use-ggv-position', () => ({
  useGGVPosition: () => ({
    data: { sharesBalance: AMOUNT },
    refetch: state.refetchBalance,
  }),
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
    return state.stateQuery;
  },
}));
vi.mock('../../hooks/use-ggv-bulk-withdrawal-state', () => ({
  useGGVBulkWithdrawalState: (enabled: boolean) => {
    state.isBulkStateEnabled = enabled;
    return state.stateQuery;
  },
}));
vi.mock('../../hooks/use-ggv-withdraw', () => ({
  useGGVWithdraw: () => ({ withdrawGGV: state.queueWithdraw }),
}));
vi.mock('../../hooks/use-ggv-bulk-withdraw', () => ({
  useGGVBulkWithdraw: () => ({ withdrawGGV: state.bulkWithdraw }),
}));

import { GGVWithdrawFormProvider, useGGVWithdrawForm } from '..';
import { useGGVPreviewWithdrawal } from '../../hooks/use-ggv-preview-withdrawal';

// Renders the real provider with the form, the preview and the submit callback
const render = () => {
  const result = {} as {
    form: ReturnType<typeof useGGVWithdrawForm>;
    // The submit button reads this
    isFormDisabled?: boolean;
    preview: ReturnType<typeof useGGVPreviewWithdrawal>;
    onSubmit?: (values: { amount: bigint }) => Promise<boolean>;
  };
  const Probe = () => {
    result.form = useGGVWithdrawForm();
    result.isFormDisabled = useFormState().disabled;
    result.preview = useGGVPreviewWithdrawal(AMOUNT);
    result.onSubmit = useContext(FormControllerContext)?.onSubmit;
    return null;
  };
  renderToStaticMarkup(
    <GGVWithdrawFormProvider>
      <Probe />
    </GGVWithdrawFormProvider>,
  );
  return result;
};

// Submits the form like the submit button does
const renderAndSubmit = async () => {
  const result = render();
  await result.onSubmit?.({ amount: AMOUNT });
  return { isBulkWithdraw: result.form.isBulkWithdraw };
};

beforeEach(() => {
  vi.clearAllMocks();
  state.stateQuery = { isLoading: false, isError: false };
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

  it('refetches the form data after a failed withdraw', async () => {
    state.featureFlags = { ggvBulkWithdrawEnabled: true };
    state.bulkWithdraw.mockResolvedValue(false);

    await renderAndSubmit();

    // The form then shows why, e.g. no liquidity left
    expect(state.refetchBalance).toHaveBeenCalledTimes(1);
  });
});

describe('GGVWithdrawFormProvider state read failure', () => {
  beforeEach(() => {
    state.featureFlags = { ggvBulkWithdrawEnabled: true };
  });

  it('disables the form and stops the preview after an initial read failure', () => {
    state.stateQuery = { isLoading: false, isError: true };

    const { form, isFormDisabled, preview } = render();

    expect(form).toMatchObject({
      isLoading: false,
      canWithdraw: false,
      reason: 'state-unavailable',
    });
    expect(isFormDisabled).toBe(true);
    // No endless spinner: there is no rate to wait for
    expect(preview.isLoading).toBe(false);
    expect(preview.data.assets).toBeUndefined();
  });

  it.each([
    ['a retry succeeds', { isLoading: false, isError: false }],
    ['a refetch fails with cached data', { isLoading: false, isError: true }],
  ])('keeps the form working when %s', (_, query) => {
    state.stateQuery = { ...query, data: BULK_STATE };

    const { form, isFormDisabled, preview } = render();

    expect(form).toMatchObject({ canWithdraw: true, reason: null });
    expect(isFormDisabled).toBe(false);
    // 1 GG at 2 WETH per share
    expect(preview).toMatchObject({
      isLoading: false,
      data: { assets: 2n * AMOUNT },
    });
  });
});
