import { renderToStaticMarkup } from 'react-dom/server';

import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

const state = vi.hoisted(() => ({
  // the bunker state the form loaded with
  isBunker: false,
  isBunkerModeActive: vi.fn(async () => false),
  requestWithdrawal: vi.fn(async () => undefined),
  closeModal: vi.fn(),
  txModalStages: {
    dialogBunker: vi.fn(async () => true),
    sign: vi.fn(),
    pending: vi.fn(),
    success: vi.fn(),
    successMultisig: vi.fn(),
    failed: vi.fn(),
  },
}));

// the flow runner sends what the hook hands it
const txFlow = vi.fn(
  async (args: {
    sendTransaction: (callback: () => void) => Promise<void>;
  }) => {
    await args.sendTransaction(() => undefined);
  },
);

vi.mock('features/withdrawals/contexts/withdrawals-context', () => ({
  useWithdrawals: () => ({ isBunker: state.isBunker }),
}));
vi.mock(
  'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request',
  () => ({
    useTxModalStagesRequest: () => ({ txModalStages: state.txModalStages }),
  }),
);
vi.mock('shared/transaction-modal/transaction-modal', () => ({
  useTransactionModal: () => ({ closeModal: state.closeModal }),
}));
vi.mock('modules/web3', async () => ({
  ...(await import('modules/web3/utils/errors')),
  useAA: () => ({ isAA: false }),
  useDappStatus: () => ({
    address: '0x00000000000000000000000000000000000000aa',
  }),
  useIsSmartAccount: () => ({ hasBytecode: false }),
  useLidoSDK: () => ({
    withdraw: {
      views: { isBunkerModeActive: state.isBunkerModeActive },
      request: { requestWithdrawal: state.requestWithdrawal },
      approval: {},
    },
  }),
  useTxFlow: () => txFlow,
  applyRoundUpTxParameter: (value: bigint) => value,
}));
vi.mock('config', () => ({ config: {} }));
vi.mock('../use-withdrawal-request-tx-approve', () => ({
  useWithdrawalRequestTxApprove: () => ({
    hasEnoughAllowance: true,
    needsApprove: false,
    isApprovalFlow: true,
    isForceAllowance: false,
    setIsForceAllowance: vi.fn(),
    refetchAllowance: vi.fn(),
    processApproveTx: vi.fn(),
  }),
}));

import { useWithdrawalRequest } from '../useRequest';

const AMOUNT = 10n ** 18n;

const renderRequest = () => {
  let request: ReturnType<typeof useWithdrawalRequest>['request'] | undefined;
  const Probe = () => {
    request = useWithdrawalRequest({
      amount: AMOUNT,
      token: TOKENS_TO_WITHDRAWLS.stETH,
    }).request;
    return null;
  };
  renderToStaticMarkup(<Probe />);
  const submit = request as ReturnType<typeof useWithdrawalRequest>['request'];
  return () =>
    submit({
      requests: [AMOUNT],
      amount: AMOUNT,
      token: TOKENS_TO_WITHDRAWLS.stETH,
    });
};

describe('useWithdrawalRequest bunker mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    state.isBunker = false;
    state.isBunkerModeActive.mockResolvedValue(false);
    state.txModalStages.dialogBunker.mockResolvedValue(true);
  });

  it('sends the request when bunker mode is off', async () => {
    const result = await renderRequest()();

    expect(result).toBe(true);
    expect(state.isBunkerModeActive).toHaveBeenCalledTimes(1);
    expect(state.txModalStages.dialogBunker).not.toHaveBeenCalled();
    expect(state.requestWithdrawal).toHaveBeenCalledTimes(1);
  });

  it('asks to confirm when bunker mode started after the form loaded', async () => {
    state.isBunkerModeActive.mockResolvedValue(true);
    state.txModalStages.dialogBunker.mockResolvedValue(false);

    const result = await renderRequest()();

    expect(result).toBe(false);
    expect(state.txModalStages.dialogBunker).toHaveBeenCalledTimes(1);
    expect(state.closeModal).toHaveBeenCalled();
    expect(txFlow).not.toHaveBeenCalled();
    expect(state.requestWithdrawal).not.toHaveBeenCalled();
  });

  it('sends the request once the user confirms bunker mode', async () => {
    state.isBunkerModeActive.mockResolvedValue(true);

    const result = await renderRequest()();

    expect(result).toBe(true);
    expect(state.txModalStages.dialogBunker).toHaveBeenCalledTimes(1);
    expect(
      state.txModalStages.dialogBunker.mock.invocationCallOrder[0],
    ).toBeLessThan(state.requestWithdrawal.mock.invocationCallOrder[0]);
  });

  it('asks to confirm without a new read when the form knows bunker mode', async () => {
    state.isBunker = true;
    state.txModalStages.dialogBunker.mockResolvedValue(false);

    const result = await renderRequest()();

    expect(result).toBe(false);
    expect(state.isBunkerModeActive).not.toHaveBeenCalled();
    expect(state.txModalStages.dialogBunker).toHaveBeenCalledTimes(1);
    expect(state.requestWithdrawal).not.toHaveBeenCalled();
  });

  it('sends nothing when the bunker state cannot be read', async () => {
    const error = new Error('rpc down');
    state.isBunkerModeActive.mockRejectedValue(error);

    const result = await renderRequest()();

    expect(result).toBe(false);
    expect(txFlow).not.toHaveBeenCalled();
    expect(state.txModalStages.failed).toHaveBeenCalledWith(
      error,
      undefined,
      false,
      expect.any(Function),
    );
  });
});
