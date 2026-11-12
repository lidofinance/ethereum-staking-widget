import { decodeFunctionData, getAddress, type Hash } from 'viem';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import {
  aaSendCalls,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';

import { GGV_TELLER_ABI } from '../../../contracts/abi/teller-abi';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, TELLER, WETH } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  TELLER: '0x4C74ccA483A278Bcb90Aea3f8F565e56202D82B2' as const,
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const,
}));
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

// Values from a mainnet fork run: 1 GG paid RATE wei of WETH
const AMOUNT = 10n ** 18n;
const RATE = 1012681482084742508n;
const WILL_RECEIVE = RATE;
const MIN_ASSETS = 1011668800602657765n;

const state = vi.hoisted(() => ({
  isAA: false,
  sdk: undefined as { core: unknown } | undefined,
  sendAACalls: vi.fn(),
  getRate: vi.fn(),
  teller: {
    estimateGas: { bulkWithdraw: vi.fn() },
    write: { bulkWithdraw: vi.fn() },
  },
  txModalStages: {
    sign: vi.fn(),
    pending: vi.fn(),
    success: vi.fn(),
    successMultisig: vi.fn(),
    failed: vi.fn(),
  },
}));

vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/hooks/tx-flow/run-tx-flow');
  const errors = await import('modules/web3/utils');
  const context = await import('modules/web3/hooks/tx-flow/context');
  return {
    ...errors,
    ...context,
    useDappStatus: () => ({ address: ACCOUNT }),
    useLidoSDK: () => state.sdk,
    useTxFlow: () => (args: TxFlowArgs) =>
      runTxFlow(args, {
        isAA: state.isAA,
        address: ACCOUNT,
        validateAddress: async () => true,
        sendAACalls: state.sendAACalls,
        isCurrent: () => true,
      }),
  };
});
vi.mock('config/networks/token-address', () => ({
  getTokenAddress: () => WETH,
}));
// GGV consts import SVG icons, which do not load in the test environment
vi.mock('assets/earn', () => ({ PartnerVedaIcon: () => null }));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));
vi.mock('../../../contracts', async () => {
  const abi = await import('../../../contracts/abi/teller-abi');
  return {
    getGGVTellerWritableContract: () => ({
      address: TELLER,
      abi: abi.GGV_TELLER_ABI,
      ...state.teller,
    }),
    getGGVAccountantContract: () => ({
      read: { getRateInQuoteSafe: state.getRate },
    }),
    getGGVVaultContract: () => ({ read: { decimals: async () => 18 } }),
  };
});
vi.mock('../use-ggv-bulk-withdraw-modal', () => ({
  useTxModalStagesGGVBulkWithdraw: () => ({
    txModalStages: state.txModalStages,
  }),
}));

import { useGGVBulkWithdraw } from '../use-ggv-bulk-withdraw';

const EXPECTED_ARGS = [WETH, AMOUNT, MIN_ASSETS, ACCOUNT];

const createSdk = (
  performTransaction: ReturnType<typeof legacyPerformTransaction>,
) => {
  state.sdk = {
    core: {
      chainId: 1,
      publicClient: {},
      walletClient: {},
      performTransaction,
    },
  };
};

const decodeBulkWithdraw = (data: Hash) => {
  const decoded = decodeFunctionData({ abi: GGV_TELLER_ABI, data });
  expect(decoded.functionName).toBe('bulkWithdraw');
  return decoded.args;
};

const onRetry = vi.fn();

const withdraw = () =>
  renderHook(() => useGGVBulkWithdraw(onRetry)).withdrawGGV({
    amount: AMOUNT,
  });

const consoleErrorSpy = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
  state.getRate.mockResolvedValue(RATE);
  state.teller.estimateGas.bulkWithdraw.mockResolvedValue(100_000n);
  state.teller.write.bulkWithdraw.mockResolvedValue(TX_HASH);
});
afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('useGGVBulkWithdraw', () => {
  describe('legacy signing', () => {
    it('sends one bulkWithdraw of WETH to the connected account', async () => {
      const performTransaction = legacyPerformTransaction('success');
      createSdk(performTransaction);

      await expect(withdraw()).resolves.toBe(true);

      // one transaction, no approve: the Teller burns shares from msg.sender
      expect(performTransaction).toHaveBeenCalledTimes(1);
      expect(state.getRate).toHaveBeenCalledWith([WETH]);
      expect(state.teller.estimateGas.bulkWithdraw).toHaveBeenCalledWith(
        EXPECTED_ARGS,
        expect.anything(),
      );
      expect(state.teller.write.bulkWithdraw).toHaveBeenCalledTimes(1);
      expect(state.teller.write.bulkWithdraw).toHaveBeenCalledWith(
        EXPECTED_ARGS,
        expect.anything(),
      );
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        WILL_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WILL_RECEIVE,
        TX_HASH,
        false,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(AMOUNT, TX_HASH);
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('uses the fresh rate for minimumAssets', async () => {
      createSdk(legacyPerformTransaction('success'));
      state.getRate.mockResolvedValue(2n * 10n ** 18n);

      await withdraw();

      // 2e18 minus 10 bps
      expect(state.teller.write.bulkWithdraw).toHaveBeenCalledWith(
        [WETH, AMOUNT, 1_998_000_000_000_000_000n, ACCOUNT],
        expect.anything(),
      );
    });

    it('reports a rejected signature and offers a retry', async () => {
      createSdk(legacyPerformTransaction('rejected'));

      await expect(withdraw()).resolves.toBe(false);

      expect(state.teller.write.bulkWithdraw).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports a reverted transaction as failed', async () => {
      createSdk(legacyPerformTransaction('reverted'));

      await expect(withdraw()).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.anything(),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports a gas estimate failure, e.g. UNAUTHORIZED, before signing', async () => {
      createSdk(legacyPerformTransaction('success'));
      state.teller.estimateGas.bulkWithdraw.mockRejectedValue(
        new Error('UNAUTHORIZED'),
      );

      await expect(withdraw()).resolves.toBe(false);

      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      expect(state.teller.write.bulkWithdraw).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'UNAUTHORIZED' }),
        onRetry,
      );
    });

    it('sends nothing when the rate cannot be read (accountant paused)', async () => {
      const performTransaction = legacyPerformTransaction('success');
      createSdk(performTransaction);
      state.getRate.mockRejectedValue(new Error('Paused'));

      await expect(withdraw()).resolves.toBe(false);

      expect(performTransaction).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Paused' }),
        onRetry,
      );
    });

    it('reports a multisig proposal without waiting for a receipt', async () => {
      createSdk(legacyPerformTransaction('multisig'));

      await expect(withdraw()).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });

  describe('AA signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('sends a single bulkWithdraw call without approve', async () => {
      const performTransaction = legacyPerformTransaction('success');
      createSdk(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(withdraw()).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      expect(state.teller.write.bulkWithdraw).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(TELLER);
      expect(calls[0]?.value).toBeUndefined();
      // decoding returns checksummed addresses
      expect(decodeBulkWithdraw(calls[0]?.data as Hash)).toEqual([
        getAddress(WETH),
        AMOUNT,
        MIN_ASSETS,
        getAddress(ACCOUNT),
      ]);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WILL_RECEIVE,
        CALL_ID,
        true,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(AMOUNT, TX_HASH);
    });

    it('reports a rejected batch and offers a retry', async () => {
      createSdk(legacyPerformTransaction('success'));
      state.sendAACalls.mockImplementation(
        aaSendCalls({
          callId: CALL_ID,
          txHash: TX_HASH,
          failWith: new Error('User rejected the request'),
        }),
      );

      await expect(withdraw()).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.anything(),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });
});
