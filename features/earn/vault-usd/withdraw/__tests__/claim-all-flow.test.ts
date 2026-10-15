import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { TransactionCallbackStage as Stage } from '@lidofinance/lido-ethereum-sdk/core';
import { TransactionRevertedError } from 'modules/web3/utils/transaction-reverted-error';
import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import type { Hash, TransactionReceipt } from 'viem';
import type { TokenClaim } from '../claim-all-utils';

const mocks = vi.hoisted(() => ({
  result: vi.fn(),
  sign: vi.fn(),
  successMultisig: vi.fn(),
  pending: vi.fn(),
  refresh: vi.fn(),
  perform: vi.fn(),
  aa: false,
  // Set to abort the batch at the given stage, mirroring a wallet that rejects
  // the signature (before a call id exists) or a batch that fails afterwards.
  batchError: undefined as
    { error: Error; stage: 'sign' | 'receipt' } | undefined,
  // Mirrors useTxFlow returning early when address validation fails.
  skipFlow: false,
}));
vi.mock('react', () => ({
  useMemo: (fn: () => unknown) => fn(),
  useCallback: (fn: unknown) => fn,
  useRef: (value: unknown) => ({ current: value }),
  useState: (value: unknown) => [value, vi.fn()],
}));
vi.mock('utils', () => ({
  getErrorMessage: (error: Error) => error.message,
  ErrorMessage: { DENIED_SIG: 'rejected' },
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));
vi.mock('../../contracts', async () => ({
  getRedeemQueueWritableContract: (
    (abi) =>
    ({ token }: { token: string }) => ({
      abi,
      address:
        token === 'usdc'
          ? '0x0000000000000000000000000000000000000002'
          : '0x0000000000000000000000000000000000000003',
    })
  )((await import('modules/mellow-meta-vaults/abi')).ASYNC_REDEEM_QUEUE_ABI),
}));
vi.mock('../hooks/use-withdraw-requests', () => ({
  useUsdVaultWithdrawRequests: () => ({
    data: {
      claimableRequests: [
        { token: 'usdc', assets: 10n, timestamp: 1n },
        { token: 'usdt', assets: 20n, timestamp: 2n },
      ],
    },
  }),
}));
vi.mock('../hooks/use-withdraw-form-data', () => ({
  useUsdVaultWithdrawFormData: () => ({ refetchData: mocks.refresh }),
}));
vi.mock('../hooks/use-withdraw-claim-all-tx-modal', () => ({
  useUsdVaultWithdrawClaimAllTxModal: () => ({ txModalStages: mocks }),
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({
    address: '0x0000000000000000000000000000000000000001',
  }),
  useMainnetOnlyWagmi: () => ({ publicClientMainnet: {} }),
  // The same flag steers the fake txFlow below, so the hook and the flow
  // cannot disagree about which path is running.
  useAA: () => ({ isAA: mocks.aa }),
  useLidoSDK: () => ({
    core: { performTransaction: mocks.perform, walletClient: {} },
  }),
  applyRoundUpTxParameter: (value: bigint) => value,
  useTxFlow: () => async (args: TxFlowArgs) => {
    if (mocks.skipFlow) return;

    if (mocks.aa) {
      await args.callsFn?.();
      await args.onSign?.({ stage: Stage.SIGN, isAA: true });
      if (mocks.batchError?.stage === 'sign') throw mocks.batchError.error;
      await args.onReceipt?.({
        stage: Stage.RECEIPT,
        isAA: true,
        txHashOrCallId: callId,
      });
      if (mocks.batchError?.stage === 'receipt') throw mocks.batchError.error;
      await args.onSuccess?.({
        stage: Stage.DONE,
        isAA: true,
        txHash: batchHash,
      });
      return;
    }

    // Mirrors useTxFlow: the hash seen at RECEIPT is memoized and handed to
    // DONE, which is what makes a later mined hash worth preferring.
    let submitted: Hash | undefined;
    await args.sendTransaction(async (stage) => {
      const common = { isAA: false } as const;
      if (stage.stage === Stage.SIGN)
        await args.onSign?.({ ...common, stage: Stage.SIGN });
      if (stage.stage === Stage.RECEIPT) {
        submitted = stage.payload;
        await args.onReceipt?.({
          ...common,
          stage: Stage.RECEIPT,
          txHashOrCallId: stage.payload,
        });
      }
      // Mirrors useTxFlow: a reverted receipt aborts the flow right here, so
      // this call never returns and the DONE stage never runs.
      if (
        stage.stage === Stage.CONFIRMATION &&
        stage.payload?.status === 'reverted'
      )
        throw new TransactionRevertedError(stage.payload);
      if (stage.stage === Stage.MULTISIG_DONE)
        await args.onMultisigDone?.({
          ...common,
          stage: Stage.MULTISIG_DONE,
        });
      if (stage.stage === Stage.DONE)
        await args.onSuccess?.({
          ...common,
          stage: Stage.DONE,
          txHash: submitted,
        });
    });
  },
}));

import { useUsdVaultWithdrawClaimAll } from '../hooks/use-withdraw-claim-all';

const callId = '0xbatchcallid';
const batchHash = '0xbatchtx';

type Callback = {
  callback: (args: {
    stage: Stage;
    payload?: Hash | TransactionReceipt;
  }) => Promise<void>;
};

const receipt = (
  transactionHash: Hash,
  status: 'success' | 'reverted' = 'success',
) => ({ status, transactionHash }) as unknown as TransactionReceipt;

// Distinct hashes per transaction, so a result linked to the wrong token or
// taken from the wrong stage is visible in the assertion.
let sent = 0;
const submittedHash = (n: number) => `0xsubmitted${n}` as Hash;
const minedHash = (n: number) => `0xmined${n}` as Hash;

const claims = async ({ callback }: Callback) => {
  const n = sent++;
  await callback({ stage: Stage.SIGN });
  await callback({ stage: Stage.RECEIPT, payload: submittedHash(n) });
  await callback({ stage: Stage.CONFIRMATION, payload: receipt(minedHash(n)) });
  await callback({ stage: Stage.DONE });
};

const reverts = async ({ callback }: Callback) => {
  const n = sent++;
  await callback({ stage: Stage.SIGN });
  await callback({ stage: Stage.RECEIPT, payload: submittedHash(n) });
  await callback({
    stage: Stage.CONFIRMATION,
    payload: receipt(minedHash(n), 'reverted'),
  });
};

const submitsToMultisig = async ({ callback }: Callback) => {
  sent++;
  await callback({ stage: Stage.SIGN });
  await callback({ stage: Stage.MULTISIG_DONE });
};

const rejects = async ({ callback }: Callback) => {
  sent++;
  await callback({ stage: Stage.SIGN });
  throw new Error('rejected');
};

// What the final screen was handed. `claims` above is the fake wallet.
const reported = () => mocks.result.mock.calls[0][0] as TokenClaim[];
const resultOptions = () => mocks.result.mock.calls[0][1];
const statuses = () => reported().map(({ status }) => status);
const hashes = () => reported().map(({ txHash }) => txHash);

// Which tokens each call of a stage put on screen, in order.
const tokensShown = (stage: Mock) =>
  stage.mock.calls.map((call) =>
    (call[0] as TokenClaim[]).map(({ token }) => token),
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.aa = false;
  mocks.batchError = undefined;
  mocks.skipFlow = false;
  sent = 0;
  mocks.perform.mockReset().mockImplementation(claims);
  mocks.refresh.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('sequential claims', () => {
  it('claims both tokens and links each to its own mined transaction', async () => {
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(statuses()).toEqual(['claimed', 'claimed']);
    // Mined, not submitted: speeding up in the wallet replaces the hash.
    expect(hashes()).toEqual([minedHash(0), minedHash(1)]);
    expect(resultOptions()).toMatchObject({ error: undefined });
    // Once per settled claim, and nowhere else.
    expect(mocks.refresh).toHaveBeenCalledTimes(2);
  });

  it('labels each transaction with its position in the run', async () => {
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(mocks.sign.mock.calls.map(([, step]) => step)).toEqual([
      'Transaction 1 of 2',
      'Transaction 2 of 2',
    ]);
  });

  it('shows only the token being claimed while a transaction is in flight', async () => {
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    // The wallet is asked for one queue at a time, so the screens standing next
    // to it must not claim to cover the token still waiting its turn.
    expect(tokensShown(mocks.sign)).toEqual([['USDC'], ['USDT']]);
    expect(tokensShown(mocks.pending)).toEqual([['USDC'], ['USDT']]);
  });

  it('leaves the second token untouched when the first signature is rejected', async () => {
    mocks.perform.mockImplementation(rejects);

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(statuses()).toEqual(['rejected', 'not-started']);
    expect(hashes()).toEqual([undefined, undefined]);
    expect(mocks.perform).toHaveBeenCalledTimes(1);
  });

  it('keeps the first claim when the second signature is rejected', async () => {
    mocks.perform.mockImplementationOnce(claims).mockImplementation(rejects);

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(statuses()).toEqual(['claimed', 'rejected']);
    expect(hashes()).toEqual([minedHash(0), undefined]);
  });

  it('marks a reverted claim failed, links it, and stops the run', async () => {
    mocks.perform.mockImplementation(reverts);

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(statuses()).toEqual(['failed', 'not-started']);
    expect(hashes()).toEqual([minedHash(0), undefined]);
    expect(mocks.perform).toHaveBeenCalledTimes(1);
    expect(resultOptions()).toMatchObject({
      error:
        'Transaction was included into block but reverted during execution',
    });
  });
});

describe('multisig claims', () => {
  it('proposes every token to the multisig and reports it once', async () => {
    mocks.perform.mockImplementation(submitsToMultisig);

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    // Matching the wrap and withdrawal-request flows, a proposal does not stop
    // the run: "claim all" queues a proposal for every token.
    expect(mocks.perform).toHaveBeenCalledTimes(2);
    expect(mocks.successMultisig).toHaveBeenCalledTimes(2);
    // Nothing executed, so the per-token result must not replace that screen.
    expect(mocks.result).not.toHaveBeenCalled();
  });

  it('reports an error that follows a proposal, keeping the proposal visible', async () => {
    mocks.perform
      .mockImplementationOnce(submitsToMultisig)
      .mockImplementation(rejects);

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    // The error has to surface, and the proposed token must not be shown as
    // untouched just because it has not executed yet.
    expect(mocks.result).toHaveBeenCalledTimes(1);
    expect(statuses()).toEqual(['submitted', 'rejected']);
    expect(resultOptions()).toMatchObject({ error: 'rejected' });
  });

  it('still reports a normal result when no multisig is involved', async () => {
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(mocks.successMultisig).not.toHaveBeenCalled();
    expect(mocks.result).toHaveBeenCalledTimes(1);
  });
});

describe('batch claims', () => {
  beforeEach(() => {
    mocks.aa = true;
  });

  it('claims every token in one transaction and reports the call id', async () => {
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(statuses()).toEqual(['claimed', 'claimed']);
    expect(hashes()).toEqual([batchHash, batchHash]);
    expect(resultOptions()).toMatchObject({ callId, error: undefined });
    // A batch is one signature covering both tokens, so it shows both and has
    // no "transaction N of M" to add.
    expect(tokensShown(mocks.sign)).toEqual([['USDC', 'USDT']]);
    expect(tokensShown(mocks.pending)).toEqual([['USDC', 'USDT']]);
    expect(mocks.sign).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(mocks.perform).not.toHaveBeenCalled();
  });

  it('fails every token when the batch fails, keeping the call id', async () => {
    mocks.batchError = { error: new Error('batch failed'), stage: 'receipt' };

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(statuses()).toEqual(['failed', 'failed']);
    expect(resultOptions()).toMatchObject({
      callId,
      error: 'batch failed',
    });
  });

  it('rejects every token when the batch signature is rejected', async () => {
    mocks.batchError = { error: new Error('rejected'), stage: 'sign' };

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(statuses()).toEqual(['rejected', 'rejected']);
    // The wallet never accepted the calls, so there is no batch to link to.
    expect(resultOptions()).toMatchObject({ callId: undefined });
  });
});

describe('flow guards', () => {
  it('shows no result when the flow returns without starting', async () => {
    mocks.skipFlow = true;

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();

    expect(mocks.result).not.toHaveBeenCalled();
    expect(mocks.sign).not.toHaveBeenCalled();
  });
});
