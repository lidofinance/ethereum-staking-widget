import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';
import type { TxFlowArgs } from 'modules/web3/tx-flow/types';
import { TxSettledError } from 'modules/web3/utils/errors';

const state = vi.hoisted(() => ({
  allowed: true,
  current: true,
  perform: vi.fn(),
  optimisticClaim: vi.fn(),
  stages: {
    sign: vi.fn(),
    pending: vi.fn(),
    success: vi.fn(),
    failed: vi.fn(),
    successMultisig: vi.fn(),
  },
}));
const ACCOUNT = '0x0000000000000000000000000000000000000001';
vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/tx-flow/run-tx-flow');
  return {
    useDappStatus: () => ({ address: ACCOUNT }),
    useAA: () => ({ isAA: false }),
    useLidoSDK: () => ({
      core: { performTransaction: state.perform },
      withdraw: { claim: { claimRequests: state.perform } },
    }),
    applyRoundUpTxParameter: (value: bigint) => value,
    useTxFlow: () => (args: TxFlowArgs) =>
      runTxFlow(args, {
        address: ACCOUNT,
        isAA: false,
        validateAddress: async () => state.allowed,
        isCurrent: () => state.current,
        sendAACalls: vi.fn(),
      }),
  };
});
vi.mock('features/withdrawals/contexts/claim-data-context', () => ({
  useClaimData: () => ({ optimisticClaimRequests: state.optimisticClaim }),
}));
vi.mock(
  'features/withdrawals/claim/transaction-modal-claim/use-tx-modal-stages-claim',
  () => ({
    useTxModalStagesClaim: () => ({ txModalStages: state.stages }),
  }),
);
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

import { useClaim } from 'features/withdrawals/hooks/contract/useClaim';
import { useDepositCancel } from '../use-deposit-cancel';
import { useDepositClaim } from '../use-deposit-claim';
import { useWithdrawClaim } from '../use-withdraw-claim';
import { useWithdrawClaimAll } from '../use-withdraw-claim-all';

const queue = { address: ACCOUNT, abi: [], estimateGas: {}, write: {} };
const options = {
  txModalStages: state.stages as never,
  refetchTokenBalance: async () => undefined,
};
const operations = [
  [
    'Lido claim',
    () => {
      const claim = useClaim({});
      return () => claim([{ id: 1n, hint: 0n, claimableEth: 1n }] as never);
    },
  ],
  [
    'vault deposit claim',
    () => {
      const { claim } = useDepositClaim({ ...options, vault: queue as never });
      return () => claim(1n);
    },
  ],
  [
    'vault deposit cancel',
    () => {
      const { cancel } = useDepositCancel({
        ...options,
        depositQueueGetter: () => queue as never,
      });
      return () => cancel(1n, 'usdc');
    },
  ],
  [
    'vault withdrawal claim',
    () => {
      const { withdrawClaim } = useWithdrawClaim({
        ...options,
        redeemQueue: queue as never,
        token: 'usdc',
      });
      return () => withdrawClaim({ amount: 1n, timestamp: 1 });
    },
  ],
  [
    'vault withdrawal claim all',
    () => {
      const { withdrawClaimAll } = useWithdrawClaimAll({
        ...options,
        redeemQueue: queue as never,
        token: 'usdc',
        claimableRequests: [{ assets: 1n, timestamp: 1n }] as never,
      });
      return withdrawClaimAll;
    },
  ],
] as const;

const renderOperation = (useOperation: () => () => Promise<boolean>) => {
  let operation!: () => Promise<boolean>;
  const Probe = () => {
    operation = useOperation();
    return null;
  };
  renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <Probe />
    </QueryClientProvider>,
  );
  return operation;
};

beforeEach(() => {
  vi.clearAllMocks();
  state.allowed = true;
  state.current = true;
  state.perform.mockImplementation(async ({ callback }) => {
    await callback({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: { status: 'success' },
    });
    await callback({ stage: TransactionCallbackStage.DONE });
  });
});

describe.each(operations)('%s outcome', (_name, useOperation) => {
  it('keeps a settled transaction successful when its confirmation read fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      state.perform.mockImplementationOnce(async ({ callback }) => {
        await callback({
          stage: TransactionCallbackStage.CONFIRMATION,
          payload: { status: 'success' },
        });
        throw new Error('confirmation read failed');
      });
      await expect(renderOperation(useOperation)()).resolves.toBe(true);
      expect(state.stages.failed).toHaveBeenCalledWith(
        expect.any(TxSettledError),
        undefined,
      );
    } finally {
      log.mockRestore();
    }
  });

  it.each(['address rejected', 'superseded'])(
    'does not report success when %s',
    async (reason) => {
      state.allowed = reason !== 'address rejected';
      state.current = reason !== 'superseded';
      await expect(renderOperation(useOperation)()).resolves.toBe(false);
      expect(state.perform).not.toHaveBeenCalled();
      expect(state.stages.success).not.toHaveBeenCalled();
      expect(state.optimisticClaim).not.toHaveBeenCalled();
    },
  );

  it('reports a settled transaction as success', async () => {
    await expect(renderOperation(useOperation)()).resolves.toBe(true);
    expect(state.stages.success).toHaveBeenCalledTimes(1);
  });
});
