/* eslint-disable import/no-extraneous-dependencies */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('utils/standardFetcher', () => ({
  standardFetcher: vi.fn(),
}));

import {
  extractApprovals,
  sanitizeTransactionParams,
  validateSendTransaction,
  validateSendCalls,
} from '../validate-tx-signing';
import { hashCowswapOrder, calculateOrderUID } from '../order';
import {
  encodeFunctionData,
  erc20Abi,
  ethAddress,
  keccak256,
  maxUint32,
  parseEther,
  toHex,
} from 'viem';
// json-stringify-deterministic is a transitive dependency (see utils.ts)
import stringify from 'json-stringify-deterministic';
import { CowEthFlowAbi, CowSettlementAbi } from '../../../../abi';
import { TRANSACTION_ERROR } from '../../consts';
import { standardFetcher } from 'utils/standardFetcher';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import {
  MAINNET_TX_CONFIG,
  SEPOLIA_TX_CONFIG,
  TEST_APP_CODE,
} from '../../__tests__/fixtures';

const CHAIN_MAINNET = 1;
const CHAIN_SEPOLIA = 11155111;

// All addresses from network configs (source of truth)
const COW_VAULT_RELAYER =
  mainnetNetwork.contracts.cowVaultRelayer.toLowerCase();
const COW_SETTLEMENT = mainnetNetwork.contracts.cowSettlement.toLowerCase();

const STETH = mainnetNetwork.contracts.lido.toLowerCase();
const WSTETH = mainnetNetwork.contracts.wsteth.toLowerCase();
const WETH = mainnetNetwork.contracts.weth.toLowerCase();
const USDC = mainnetNetwork.contracts.usdc.toLowerCase();
const USDT = mainnetNetwork.contracts.usdt.toLowerCase();

const SEPOLIA_STETH = sepoliaNetwork.contracts.lido.toLowerCase();
const SEPOLIA_WETH = sepoliaNetwork.contracts.weth.toLowerCase();
const SEPOLIA_COW_VAULT_RELAYER =
  sepoliaNetwork.contracts.cowVaultRelayer.toLowerCase();
const SEPOLIA_FEE_RECIPIENT = sepoliaNetwork.contracts.daoAgent.toLowerCase();
const FEE_RECIPIENT = mainnetNetwork.contracts.daoAgent.toLowerCase();

const ATTACKER = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const UNKNOWN = '0x1111111111111111111111111111111111111111';
const SIGNER = '0x2222222222222222222222222222222222222222' as `0x${string}`;

const mainnetCtx = {
  chainId: CHAIN_MAINNET,
  signer: SIGNER,
  networkTxConfig: MAINNET_TX_CONFIG,
  appCode: TEST_APP_CODE,
};
const sepoliaCtx = {
  chainId: CHAIN_SEPOLIA,
  signer: SIGNER,
  networkTxConfig: SEPOLIA_TX_CONFIG,
  appCode: TEST_APP_CODE,
};

// ---- Order data for Settlement tests ----

// The appData document the order API returns, keyed by partner fee recipient.
const buildFullAppData = (feeRecipient: string): string =>
  JSON.stringify({
    appCode: 'Lido dApp Staking',
    metadata: {
      orderClass: { orderClass: 'market' },
      partnerFee: { recipient: feeRecipient, volumeBps: 30 },
      quote: { slippageBips: 100, smartSlippage: false },
      widget: { appCode: 'Lido dApp Staking', environment: 'mainnet' },
    },
    version: '1.0.0',
  });

// keccak256 of the deterministically-stringified appData — mirrors
// getAppDataHex() in utils.ts. The validator derives the order's appData from
// this, so order UIDs must be computed with the matching hash.
const hashFullAppData = (fullAppData: string): `0x${string}` =>
  keccak256(toHex(stringify(JSON.parse(fullAppData))));

const APP_DATA = hashFullAppData(buildFullAppData(FEE_RECIPIENT));
const SEPOLIA_APP_DATA = hashFullAppData(
  buildFullAppData(SEPOLIA_FEE_RECIPIENT),
);

// Within MAX_ORDER_AGE_SECONDS (30 min) so the validTo check passes
const TEST_VALID_TO = Math.floor(Date.now() / 1000) + 600;

const TEST_ORDER = {
  sellToken: STETH as `0x${string}`,
  buyToken: WETH as `0x${string}`,
  sellAmount: 1000000000000000000n,
  buyAmount: 950000000000000000n,
  validTo: TEST_VALID_TO,
  kind: 'sell' as const,
  partiallyFillable: false as const,
  appData: APP_DATA,
  receiver: SIGNER,
  feeAmount: 0n,
  sellTokenBalance: 'erc20' as const,
  buyTokenBalance: 'erc20' as const,
};

const TEST_ORDER_HASH = hashCowswapOrder(
  TEST_ORDER,
  CHAIN_MAINNET,
  COW_SETTLEMENT as `0x${string}`,
);
const TEST_ORDER_UID = calculateOrderUID(
  TEST_ORDER_HASH,
  SIGNER,
  TEST_VALID_TO,
);

// Sepolia order UID (uses Sepolia WETH as buy token and the Sepolia-recipient
// appData hash, since the validator derives appData from the fetched document)
const SEPOLIA_ORDER_HASH = hashCowswapOrder(
  {
    ...TEST_ORDER,
    sellToken: SEPOLIA_STETH as `0x${string}`,
    buyToken: SEPOLIA_WETH as `0x${string}`,
    appData: SEPOLIA_APP_DATA,
  },
  CHAIN_SEPOLIA,
  COW_SETTLEMENT as `0x${string}`,
);
const SEPOLIA_ORDER_UID = calculateOrderUID(
  SEPOLIA_ORDER_HASH,
  SIGNER,
  TEST_VALID_TO,
);

// ---- API response builders ----

const buildOrderApiResponse = (
  feeRecipient = FEE_RECIPIENT,
  sellToken = STETH,
  uid = TEST_ORDER_UID,
  buyToken = WETH,
) => ({
  creationDate: '2024-01-01T00:00:00.000Z',
  owner: SIGNER,
  uid,
  availableBalance: null,
  executedBuyAmount: '0',
  executedSellAmount: '0',
  executedSellAmountBeforeFees: '0',
  executedFeeAmount: '0',
  executedFee: '0',
  executedFeeToken: WETH,
  invalidated: false,
  status: 'open',
  class: 'market',
  settlementContract: COW_SETTLEMENT,
  isLiquidityOrder: false,
  fullAppData: buildFullAppData(feeRecipient),
  quote: {
    gasAmount: '0',
    gasPrice: '0',
    sellTokenPrice: '1.0',
    sellAmount: '1000000000000000000',
    buyAmount: '950000000000000000',
    feeAmount: '0',
    solver: '0x0000000000000000000000000000000000000001',
    verified: null,
    metadata: null,
  },
  sellToken,
  buyToken,
  receiver: SIGNER,
  sellAmount: '1000000000000000000',
  buyAmount: '950000000000000000',
  validTo: TEST_VALID_TO,
  appData: APP_DATA,
  feeAmount: '0',
  kind: 'sell',
  partiallyFillable: false,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
  signingScheme: 'presign',
  signature: '0x',
  interactions: { pre: [], post: [] },
});

// ---- Calldata builders ----

// Helper: build approve(address spender, uint256 amount) calldata with finite amount
const buildApprove = (spender: string): string =>
  '0x095ea7b3' +
  spender.slice(2).toLowerCase().padStart(64, '0') +
  '0'.repeat(63) +
  '1'; // finite amount (1 unit)

// Helper: build transfer(address to, uint256 amount) calldata
const buildTransfer = (to: string): string =>
  '0xa9059cbb' + to.slice(2).toLowerCase().padStart(64, '0') + '0'.repeat(64);

// Helper: build setPreSignature(bytes orderUID, bool signed) calldata
const buildSetPreSignature = (orderUID = TEST_ORDER_UID, signed = true) =>
  encodeFunctionData({
    abi: CowSettlementAbi,
    functionName: 'setPreSignature',
    args: [orderUID, signed],
  });

// Helper: build approve(spender, amount) calldata with an explicit amount
const buildApproveAmount = (spender: string, amount: bigint) =>
  encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender as `0x${string}`, amount],
  });

// Helper: build invalidateOrder(bytes orderUid) calldata (order cancellation)
const buildInvalidateOrder = (orderUID = TEST_ORDER_UID) =>
  encodeFunctionData({
    abi: CowSettlementAbi,
    functionName: 'invalidateOrder',
    args: [orderUID],
  });

// Helper: a valid CoW Settlement call that is neither setPreSignature nor
// invalidateOrder (decodes cleanly but is not an allowed settler action)
const buildUnknownSettlerCall = () =>
  encodeFunctionData({
    abi: CowSettlementAbi,
    functionName: 'freeFilledAmountStorage',
    args: [[]],
  });

// ---- Attacker appData order (UID matches, but message validation fails) ----
// An order whose fetched appData names the attacker as the partner-fee
// recipient. The order UID is derived from that appData, so UID recalculation
// succeeds — the rejection happens later, inside order-message validation.
const ATTACKER_APP_DATA = hashFullAppData(buildFullAppData(ATTACKER));
const ATTACKER_ORDER_HASH = hashCowswapOrder(
  { ...TEST_ORDER, appData: ATTACKER_APP_DATA },
  CHAIN_MAINNET,
  COW_SETTLEMENT as `0x${string}`,
);
const ATTACKER_ORDER_UID = calculateOrderUID(
  ATTACKER_ORDER_HASH,
  SIGNER,
  TEST_VALID_TO,
);

// Selectors
const DEPOSIT_SELECTOR = '0xd0e30db0';
const WITHDRAW_SELECTOR = '0x2e1a7d4d' + '0'.repeat(64);

// ---- Setup / teardown ----

beforeEach(() => {
  vi.mocked(standardFetcher).mockResolvedValue(buildOrderApiResponse());
});

afterEach(() => vi.resetAllMocks());

// ================================================================

describe('TRANSACTION_ERROR', () => {
  it('appends the code when one is provided', () => {
    expect(TRANSACTION_ERROR(2030)).toContain('(code 2030)');
  });

  it('omits the code suffix when none is provided', () => {
    expect(TRANSACTION_ERROR()).toBe('Structural verification failed');
  });
});

describe('validateSendTransaction', () => {
  describe('basic validation', () => {
    it('rejects undefined params', async () => {
      const result = await validateSendTransaction(undefined, mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects empty params array', async () => {
      const result = await validateSendTransaction([], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects non-object params', async () => {
      const result = await validateSendTransaction(['string'], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects tx with no to field', async () => {
      const result = await validateSendTransaction(
        [{ data: '0x' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects unknown target address', async () => {
      const result = await validateSendTransaction(
        [{ to: UNKNOWN, data: '0x' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects ETH transfer to unknown address', async () => {
      const result = await validateSendTransaction(
        [{ to: UNKNOWN, value: '0xDE0B6B3A7640000', data: '0x' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('token approve validation', () => {
    // Only sell tokens (stETH/wstETH) are valid approve targets.
    // Buy tokens (USDC, USDT, WETH) are rejected at the target-allowlist level.
    const sellTokens = [
      ['stETH', STETH],
      ['wstETH', WSTETH],
    ] as const;

    it.each(sellTokens)(
      'allows approve(VaultRelayer) on %s',
      async (_name, tokenAddr) => {
        const result = await validateSendTransaction(
          [{ to: tokenAddr, data: buildApprove(COW_VAULT_RELAYER) }],
          mainnetCtx,
        );
        expect(result.allowed).toBe(true);
      },
    );

    it.each(sellTokens)(
      'blocks approve(attacker) on %s',
      async (_name, tokenAddr) => {
        const result = await validateSendTransaction(
          [{ to: tokenAddr, data: buildApprove(ATTACKER) }],
          mainnetCtx,
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toBeDefined();
      },
    );

    it.each(sellTokens)('blocks transfer() on %s', async (_name, tokenAddr) => {
      const result = await validateSendTransaction(
        [{ to: tokenAddr, data: buildTransfer(ATTACKER) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it.each([
      ['USDC', USDC],
      ['USDT', USDT],
    ] as const)(
      'rejects %s as a transaction target (buy token, not in sell-token allowlist)',
      async (_name, tokenAddr) => {
        const result = await validateSendTransaction(
          [{ to: tokenAddr, data: buildApprove(COW_VAULT_RELAYER) }],
          mainnetCtx,
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toBeDefined();
      },
    );

    it('blocks approve with ETH value on non-WETH token', async () => {
      const result = await validateSendTransaction(
        [
          {
            to: STETH,
            data: buildApprove(COW_VAULT_RELAYER),
            value: '0xDE0B6B3A7640000',
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('allows approve with zero value on token', async () => {
      const result = await validateSendTransaction(
        [
          {
            to: STETH,
            data: buildApprove(COW_VAULT_RELAYER),
            value: '0x0',
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('handles checksummed address (mixed case to)', async () => {
      const checksummedSteth = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
      const result = await validateSendTransaction(
        [{ to: checksummedSteth, data: buildApprove(COW_VAULT_RELAYER) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('blocks approve with truncated calldata', async () => {
      const result = await validateSendTransaction(
        [{ to: STETH, data: '0x095ea7b3' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects infinite (maxUint256) approve on stETH', async () => {
      const infiniteApprove =
        '0x095ea7b3' +
        COW_VAULT_RELAYER.slice(2).padStart(64, '0') +
        'f'.repeat(64);
      const result = await validateSendTransaction(
        [{ to: STETH, data: infiniteApprove }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('leaves finite approve amount to the trade guard', async () => {
      const result = await validateSendTransaction(
        [
          {
            to: STETH,
            data: buildApproveAmount(COW_VAULT_RELAYER, parseEther('6000')),
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('WETH operations', () => {
    it('blocks deposit() on WETH (ETH value not allowed)', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: DEPOSIT_SELECTOR, value: '0xDE0B6B3A7640000' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('blocks withdraw() on WETH (only approve() allowed)', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: WITHDRAW_SELECTOR }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects approve(VaultRelayer) on WETH (buy token, not in sell-token allowlist)', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: buildApprove(COW_VAULT_RELAYER) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('blocks approve(attacker) on WETH', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: buildApprove(ATTACKER) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('blocks transfer() on WETH', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: buildTransfer(ATTACKER) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('blocks unknown selector on WETH', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: '0x12345678' + '0'.repeat(128) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('CoW Protocol contracts', () => {
    it('allows setPreSignature(signed=true) on GPv2Settlement', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: buildSetPreSignature() }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('rejects presign of order with appCode of another integration', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: buildSetPreSignature() }],
        { ...mainnetCtx, appCode: 'Lido Swap' },
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(TRANSACTION_ERROR(2038));
    });

    it('rejects direct call to CoW VaultRelayer (removed from allowedTargets)', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_VAULT_RELAYER, data: '0x12345678' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('allows call with checksummed CoW Settlement address', async () => {
      const checksummed = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41';
      const result = await validateSendTransaction(
        [{ to: checksummed, data: buildSetPreSignature() }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('rejects setPreSignature with signed=false on CoW Settlement', async () => {
      const result = await validateSendTransaction(
        [
          {
            to: COW_SETTLEMENT,
            data: buildSetPreSignature(TEST_ORDER_UID, false),
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects non-setPreSignature calldata on CoW Settlement', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: '0xabcdef12' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when order UID mismatches (API returns different order)', async () => {
      const zeroUID = ('0x' + '00'.repeat(56)) as `0x${string}`;
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: buildSetPreSignature(zeroUID) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when fetch of order data fails', async () => {
      vi.mocked(standardFetcher).mockRejectedValueOnce(
        new Error('Network error'),
      );
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: buildSetPreSignature() }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects presign when UID matches but order message validation fails', async () => {
      // Fetched order names the attacker as partner-fee recipient. The UID is
      // derived from that appData so recalculation matches, but the order
      // message validation then rejects the bad recipient.
      vi.mocked(standardFetcher).mockResolvedValue(
        buildOrderApiResponse(ATTACKER, STETH, ATTACKER_ORDER_UID, WETH),
      );
      const result = await validateSendTransaction(
        [
          {
            to: COW_SETTLEMENT,
            data: buildSetPreSignature(ATTACKER_ORDER_UID),
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('allows invalidateOrder (order cancellation) on CoW Settlement', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: buildInvalidateOrder() }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
      if (!result.allowed) return;
      expect(result.result).toEqual({
        isCancel: true,
        orderUid: TEST_ORDER_UID,
      });
    });

    it('rejects a valid-but-unsupported CoW Settlement function', async () => {
      // freeFilledAmountStorage decodes cleanly but is neither setPreSignature
      // nor invalidateOrder — must be rejected.
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: buildUnknownSettlerCall() }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('Sepolia testnet', () => {
    it('blocks deposit() on Sepolia WETH (only approve() allowed)', async () => {
      const result = await validateSendTransaction(
        [{ to: SEPOLIA_WETH, data: DEPOSIT_SELECTOR }],
        sepoliaCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects approve(VaultRelayer) on Sepolia WETH (buy token, not in sell-token allowlist)', async () => {
      const result = await validateSendTransaction(
        [{ to: SEPOLIA_WETH, data: buildApprove(SEPOLIA_COW_VAULT_RELAYER) }],
        sepoliaCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects mainnet WETH on Sepolia', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: DEPOSIT_SELECTOR }],
        sepoliaCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('allows CoW Settlement on Sepolia (same address)', async () => {
      vi.mocked(standardFetcher).mockResolvedValue(
        buildOrderApiResponse(
          SEPOLIA_FEE_RECIPIENT,
          SEPOLIA_STETH,
          SEPOLIA_ORDER_UID,
          SEPOLIA_WETH,
        ),
      );
      const result = await validateSendTransaction(
        [
          {
            to: COW_SETTLEMENT,
            data: buildSetPreSignature(SEPOLIA_ORDER_UID),
          },
        ],
        sepoliaCtx,
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('rejects tx with no data field (data is required)', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('handles tx with empty data (0x)', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: '0x' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects null param', async () => {
      const result = await validateSendTransaction([null], mainnetCtx);
      expect(result.allowed).toBe(false);
    });
  });
});

describe('validateSendCalls', () => {
  describe('valid batches', () => {
    it('allows approve + setPreSignature batch', async () => {
      const result = await validateSendCalls(
        [
          {
            calls: [
              { to: STETH, data: buildApprove(COW_VAULT_RELAYER) },
              { to: COW_SETTLEMENT, data: buildSetPreSignature() },
            ],
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('rejects batch with only approve (no order — batch must include settlement)', async () => {
      const result = await validateSendCalls(
        [
          {
            calls: [{ to: STETH, data: buildApprove(COW_VAULT_RELAYER) }],
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('blocks WETH deposit + approve batch (ETH value not allowed)', async () => {
      const result = await validateSendCalls(
        [
          {
            calls: [
              { to: WETH, data: DEPOSIT_SELECTOR, value: '0x1' },
              { to: WETH, data: buildApprove(COW_VAULT_RELAYER) },
            ],
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('allows a lone invalidateOrder (cancel) batch', async () => {
      const result = await validateSendCalls(
        [{ calls: [{ to: COW_SETTLEMENT, data: buildInvalidateOrder() }] }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
      if (!result.allowed) return;
      expect(result.result).toEqual({
        isCancel: true,
        orderUid: TEST_ORDER_UID,
      });
    });
  });

  describe('invalid batches', () => {
    it('rejects batch with one invalid call', async () => {
      const result = await validateSendCalls(
        [
          {
            calls: [
              { to: STETH, data: buildApprove(COW_VAULT_RELAYER) },
              { to: ATTACKER, data: '0x' },
            ],
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('reports correct index for invalid call', async () => {
      const result = await validateSendCalls(
        [
          {
            calls: [
              { to: COW_SETTLEMENT, data: buildSetPreSignature() },
              { to: STETH, data: buildApprove(COW_VAULT_RELAYER) },
              { to: UNKNOWN, data: '0x' },
            ],
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects batch with two setPreSignature calls (multiple orders)', async () => {
      const result = await validateSendCalls(
        [
          {
            calls: [
              { to: COW_SETTLEMENT, data: buildSetPreSignature() },
              { to: COW_SETTLEMENT, data: buildSetPreSignature() },
            ],
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects a cancel batched with any other call', async () => {
      // A cancellation must be the only call in the batch.
      const result = await validateSendCalls(
        [
          {
            calls: [
              { to: COW_SETTLEMENT, data: buildInvalidateOrder() },
              { to: STETH, data: buildApprove(COW_VAULT_RELAYER) },
            ],
          },
        ],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects empty calls array', async () => {
      const result = await validateSendCalls([{ calls: [] }], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects missing calls field', async () => {
      const result = await validateSendCalls([{}], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects undefined params', async () => {
      const result = await validateSendCalls(undefined, mainnetCtx);
      expect(result.allowed).toBe(false);
    });

    it('rejects non-object params', async () => {
      const result = await validateSendCalls(['string'], mainnetCtx);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Sepolia batches', () => {
    it('allows Sepolia stETH + Settlement batch', async () => {
      vi.mocked(standardFetcher).mockResolvedValue(
        buildOrderApiResponse(
          SEPOLIA_FEE_RECIPIENT,
          SEPOLIA_STETH,
          SEPOLIA_ORDER_UID,
          SEPOLIA_WETH,
        ),
      );
      const result = await validateSendCalls(
        [
          {
            calls: [
              {
                to: SEPOLIA_STETH,
                data: buildApprove(SEPOLIA_COW_VAULT_RELAYER),
              },
              {
                to: COW_SETTLEMENT,
                data: buildSetPreSignature(SEPOLIA_ORDER_UID),
              },
            ],
          },
        ],
        sepoliaCtx,
      );
      expect(result.allowed).toBe(true);
    });
  });
});

describe('extractApprovals', () => {
  const approveData = buildApproveAmount(COW_VAULT_RELAYER, parseEther('2'));

  it('returns approve of eth_sendTransaction', () => {
    expect(
      extractApprovals('eth_sendTransaction', [
        { to: STETH.toUpperCase().replace('0X', '0x'), data: approveData },
      ]),
    ).toEqual([{ token: STETH, amount: parseEther('2') }]);
  });

  it('returns approves of wallet_sendCalls and skips other calls', () => {
    expect(
      extractApprovals('wallet_sendCalls', [
        {
          calls: [
            { to: STETH, data: approveData },
            { to: COW_SETTLEMENT, data: buildSetPreSignature() },
          ],
        },
      ]),
    ).toEqual([{ token: STETH, amount: parseEther('2') }]);
  });

  it('returns every approve of a batch', () => {
    const usdcApprove = buildApproveAmount(COW_VAULT_RELAYER, 5n);
    expect(
      extractApprovals('wallet_sendCalls', [
        {
          calls: [
            { to: STETH, data: approveData },
            { to: USDC, data: usdcApprove },
          ],
        },
      ]),
    ).toEqual([
      { token: STETH, amount: parseEther('2') },
      { token: USDC, amount: 5n },
    ]);
  });

  it('throws on unparsable transaction params', () => {
    expect(() => extractApprovals('eth_sendTransaction', [{}])).toThrow(
      TRANSACTION_ERROR(2040),
    );
    expect(() => extractApprovals('wallet_sendCalls', [{ calls: [] }])).toThrow(
      TRANSACTION_ERROR(2040),
    );
  });

  it('returns nothing for other methods', () => {
    expect(extractApprovals('eth_signTypedData_v4', [SIGNER, '{}'])).toEqual(
      [],
    );
  });
});

describe('EthFlow', () => {
  const ETH_FLOW = mainnetNetwork.contracts.cowEthFlow.toLowerCase();
  const ethFlowCtx = {
    ...mainnetCtx,
    networkTxConfig: {
      ...MAINNET_TX_CONFIG,
      sellTokens: new Set([...MAINNET_TX_CONFIG.sellTokens, ethAddress]),
    },
  };
  const ETH_FLOW_ORDER = {
    buyToken: USDC as `0x${string}`,
    receiver: SIGNER,
    sellAmount: parseEther('1'),
    buyAmount: 2_000_000_000n,
    appData: APP_DATA,
    feeAmount: 0n,
    validTo: TEST_VALID_TO,
    partiallyFillable: false,
    quoteId: 1n,
  };
  const buildEthFlowCall = (
    functionName: 'createOrder' | 'invalidateOrder',
    overrides: Partial<typeof ETH_FLOW_ORDER> = {},
  ) =>
    encodeFunctionData({
      abi: CowEthFlowAbi,
      functionName,
      args: [{ ...ETH_FLOW_ORDER, ...overrides }],
    });
  const sendEthFlow = (
    data: `0x${string}`,
    value = parseEther('1'),
    ctx: typeof mainnetCtx = ethFlowCtx,
  ) =>
    validateSendTransaction([{ to: ETH_FLOW, data, value: toHex(value) }], ctx);

  beforeEach(() => {
    vi.mocked(standardFetcher).mockResolvedValue({
      fullAppData: buildFullAppData(FEE_RECIPIENT),
    });
  });

  it('allows createOrder and returns the order sold as native ETH', async () => {
    expect(await sendEthFlow(buildEthFlowCall('createOrder'))).toEqual({
      allowed: true,
      result: {
        sellToken: ethAddress,
        buyToken: USDC,
        receiver: SIGNER.toLowerCase(),
        sellAmount: parseEther('1'),
        buyAmount: 2_000_000_000n,
        validTo: TEST_VALID_TO,
        appData: APP_DATA,
        feeAmount: 0n,
        kind: 'sell',
        partiallyFillable: false,
        sellTokenBalance: 'erc20',
        buyTokenBalance: 'erc20',
      },
    });
  });

  it.each([
    ['ETH not sellable in the profile', {}, parseEther('1'), mainnetCtx, 2004],
    ['value below sell amount', {}, parseEther('0.5'), ethFlowCtx, 2045],
    ['zero value', {}, 0n, ethFlowCtx, 2045],
    ['non-zero fee', { feeAmount: 1n }, parseEther('1'), ethFlowCtx, 2044],
    [
      'partially fillable order',
      { partiallyFillable: true },
      parseEther('1'),
      ethFlowCtx,
      2043,
    ],
    [
      'WETH as buy token',
      { buyToken: WETH as `0x${string}` },
      parseEther('1'),
      ethFlowCtx,
      2046,
    ],
    [
      'buy token outside the allowlist',
      { buyToken: ATTACKER },
      parseEther('1'),
      ethFlowCtx,
      2005,
    ],
    [
      'foreign receiver',
      { receiver: ATTACKER },
      parseEther('1'),
      ethFlowCtx,
      2006,
    ],
    [
      'expired order',
      { validTo: Math.floor(Date.now() / 1000) - 1 },
      parseEther('1'),
      ethFlowCtx,
      2008,
    ],
  ] as const)(
    'blocks createOrder with %s',
    async (_, overrides, value, ctx, code) => {
      expect(
        await sendEthFlow(
          buildEthFlowCall('createOrder', overrides),
          value,
          ctx,
        ),
      ).toEqual({ allowed: false, reason: TRANSACTION_ERROR(code) });
    },
  );

  it('blocks createOrder with a foreign appCode', async () => {
    vi.mocked(standardFetcher).mockResolvedValue({
      fullAppData: buildFullAppData(FEE_RECIPIENT).replaceAll(
        'Lido dApp Staking',
        'Other App',
      ),
    });
    expect(await sendEthFlow(buildEthFlowCall('createOrder'))).toEqual({
      allowed: false,
      reason: TRANSACTION_ERROR(2038),
    });
  });

  it('blocks unknown EthFlow calls', async () => {
    const wrapAll = ('0x' + 'deadbeef') as `0x${string}`;
    expect(await sendEthFlow(wrapAll, 0n)).toEqual({
      allowed: false,
      reason: TRANSACTION_ERROR(2041),
    });
  });

  it('allows invalidateOrder and computes the EthFlow order uid', async () => {
    const result = await sendEthFlow(buildEthFlowCall('invalidateOrder'), 0n);
    const settlementOrder = {
      ...TEST_ORDER,
      sellToken: WETH as `0x${string}`,
      buyToken: USDC as `0x${string}`,
      receiver: SIGNER.toLowerCase() as `0x${string}`,
      sellAmount: parseEther('1'),
      buyAmount: 2_000_000_000n,
      validTo: Number(maxUint32),
      appData: APP_DATA,
      feeAmount: 0n,
    };
    const orderUid = calculateOrderUID(
      hashCowswapOrder(
        settlementOrder,
        CHAIN_MAINNET,
        COW_SETTLEMENT as `0x${string}`,
      ),
      ETH_FLOW as `0x${string}`,
      Number(maxUint32),
    );

    expect(result).toEqual({
      allowed: true,
      result: { isCancel: true, orderUid },
    });
  });

  it('blocks invalidateOrder with ETH value', async () => {
    expect(await sendEthFlow(buildEthFlowCall('invalidateOrder'), 1n)).toEqual({
      allowed: false,
      reason: TRANSACTION_ERROR(2042),
    });
  });

  it('still blocks ETH value to any other target', async () => {
    expect(
      await validateSendTransaction(
        [
          {
            to: STETH,
            data: buildApproveAmount(COW_VAULT_RELAYER, 1n),
            value: toHex(1n),
          },
        ],
        ethFlowCtx,
      ),
    ).toEqual({ allowed: false, reason: TRANSACTION_ERROR(2031) });
  });

  it('never targets the native ETH placeholder', async () => {
    expect(
      await validateSendTransaction(
        [{ to: ethAddress, data: buildApproveAmount(COW_VAULT_RELAYER, 1n) }],
        ethFlowCtx,
      ),
    ).toEqual({ allowed: false, reason: TRANSACTION_ERROR(2032) });
  });

  it('treats EthFlow as unknown target on networks without it', async () => {
    const ctx = {
      ...ethFlowCtx,
      networkTxConfig: { ...ethFlowCtx.networkTxConfig, cowEthFlow: undefined },
    };
    expect(await sendEthFlow(buildEthFlowCall('createOrder'), 0n, ctx)).toEqual(
      {
        allowed: false,
        reason: TRANSACTION_ERROR(2032),
      },
    );
    expect(
      await sendEthFlow(buildEthFlowCall('createOrder'), parseEther('1'), ctx),
    ).toEqual({
      allowed: false,
      reason: TRANSACTION_ERROR(2031),
    });
  });

  it('returns the order from a wallet_sendCalls batch', async () => {
    const result = await validateSendCalls(
      [
        {
          calls: [
            {
              to: ETH_FLOW,
              data: buildEthFlowCall('createOrder'),
              value: toHex(parseEther('1')),
            },
          ],
        },
      ],
      ethFlowCtx,
    );
    expect(result.allowed).toBe(true);
    expect(result.result).toMatchObject({ sellToken: ethAddress });
  });
});

describe('sanitizeTransactionParams', () => {
  const approveData = buildApproveAmount(COW_VAULT_RELAYER, 1n);

  it('keeps only validated eth_sendTransaction fields', () => {
    expect(
      sanitizeTransactionParams('eth_sendTransaction', [
        {
          to: STETH,
          from: SIGNER,
          data: approveData,
          value: '0x0',
          input: '0xdeadbeef',
          authorizationList: [{}],
        },
      ]),
    ).toEqual([
      {
        to: STETH,
        from: SIGNER.toLowerCase(),
        data: approveData,
        value: '0x0',
      },
    ]);
  });

  it('keeps batch fields but only validated call fields', () => {
    expect(
      sanitizeTransactionParams('wallet_sendCalls', [
        {
          version: '2.0.0',
          chainId: '0x1',
          calls: [{ to: STETH, data: approveData, input: '0xdeadbeef' }],
        },
      ]),
    ).toEqual([
      {
        version: '2.0.0',
        chainId: '0x1',
        calls: [{ to: STETH, data: approveData }],
      },
    ]);
  });

  it('leaves other methods untouched', () => {
    const params = [SIGNER, '{}'];
    expect(sanitizeTransactionParams('eth_signTypedData_v4', params)).toBe(
      params,
    );
  });
});

describe('validateSendTransaction — from', () => {
  it('blocks a transaction from another address', async () => {
    expect(
      await validateSendTransaction(
        [
          {
            to: STETH,
            from: ATTACKER,
            data: buildApproveAmount(COW_VAULT_RELAYER, 1n),
          },
        ],
        mainnetCtx,
      ),
    ).toEqual({ allowed: false, reason: TRANSACTION_ERROR(2047) });
  });
});
