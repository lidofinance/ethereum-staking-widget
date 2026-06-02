/* eslint-disable func-style */
/* eslint-disable import/no-extraneous-dependencies */
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';

vi.mock('utils/standardFetcher', () => ({
  standardFetcher: vi.fn(),
}));

vi.mock('@cowprotocol/sdk-app-data', () => ({
  MetadataApi: vi.fn(),
}));

import {
  validateSendTransaction,
  validateSendCalls,
} from '../validate-tx-signing';
import { hashCowswapOrder, calculateOrderUID } from '../utils';
import { encodeFunctionData } from 'viem';
import { CowSettlementAbi } from '../../abi';
import { standardFetcher } from 'utils/standardFetcher';
import { MetadataApi } from '@cowprotocol/sdk-app-data';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

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

const mainnetCtx = { chainId: CHAIN_MAINNET, signer: SIGNER };
const sepoliaCtx = { chainId: CHAIN_SEPOLIA, signer: SIGNER };

// ---- Order data for Settlement tests ----

const APP_DATA =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

const TEST_VALID_TO = Math.floor(Date.now() / 1000) + 3600;

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

// Sepolia order UID (uses Sepolia WETH as buy token)
const SEPOLIA_ORDER_HASH = hashCowswapOrder(
  {
    ...TEST_ORDER,
    sellToken: SEPOLIA_STETH as `0x${string}`,
    buyToken: SEPOLIA_WETH as `0x${string}`,
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
  fullAppData: JSON.stringify({
    appCode: 'Lido Staking Widget',
    metadata: {
      orderClass: { orderClass: 'market' },
      partnerFee: { recipient: feeRecipient, volumeBps: 30 },
      quote: { slippageBips: 100, smartSlippage: false },
      widget: { appCode: 'Lido Staking Widget', environment: 'mainnet' },
    },
    version: '1.0.0',
  }),
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

function buildMetadataApiMock(appDataHex = APP_DATA) {
  return function MockMetadataApi(this: any) {
    this.getAppDataInfo = vi.fn().mockResolvedValue({ appDataHex });
  };
}

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

// Selectors
const DEPOSIT_SELECTOR = '0xd0e30db0';
const WITHDRAW_SELECTOR = '0x2e1a7d4d' + '0'.repeat(64);

// ---- Setup / teardown ----

beforeEach(() => {
  vi.mocked(standardFetcher).mockResolvedValue(buildOrderApiResponse());
  (MetadataApi as unknown as Mock).mockImplementation(buildMetadataApiMock());
});

afterEach(() => vi.resetAllMocks());

// ================================================================

describe('validateSendTransaction', () => {
  describe('basic validation', () => {
    it('rejects undefined params', async () => {
      const result = await validateSendTransaction(undefined, mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects empty params array', async () => {
      const result = await validateSendTransaction([], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects non-object params', async () => {
      const result = await validateSendTransaction(['string'], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects tx with no to field', async () => {
      const result = await validateSendTransaction(
        [{ data: '0x' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects unknown target address', async () => {
      const result = await validateSendTransaction(
        [{ to: UNKNOWN, data: '0x' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed');
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
        expect(result.reason).toContain('VaultRelayer');
      },
    );

    it.each(sellTokens)('blocks transfer() on %s', async (_name, tokenAddr) => {
      const result = await validateSendTransaction(
        [{ to: tokenAddr, data: buildTransfer(ATTACKER) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Expected approve(), got transfer()');
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
        expect(result.reason).toContain('not allowed');
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
      expect(result.reason).toContain('ETH value');
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
      expect(result.reason).toContain('Cannot decode approve() calldata');
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
      expect(result.reason).toContain('infinite');
    });
  });

  describe('WETH operations', () => {
    it('blocks deposit() on WETH (ETH value not allowed)', async () => {
      const result = await validateSendTransaction(
        [{ to: WETH, data: DEPOSIT_SELECTOR, value: '0xDE0B6B3A7640000' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('ETH value');
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
      expect(result.reason).toContain('not allowed');
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

    it('rejects direct call to CoW VaultRelayer (removed from allowedTargets)', async () => {
      const result = await validateSendTransaction(
        [{ to: COW_VAULT_RELAYER, data: '0x12345678' }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed');
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
      expect(result.reason).toContain(
        'Cannot decode setPreSignature() calldata',
      );
    });

    it('rejects when order UID mismatches (API returns different order)', async () => {
      const zeroUID = ('0x' + '00'.repeat(56)) as `0x${string}`;
      const result = await validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: buildSetPreSignature(zeroUID) }],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(
        'Order UID does not match verified order data',
      );
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
      expect(result.reason).toContain('Failed to fetch order data');
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
      expect(result.reason).toContain(
        'Batch calls must include at least one valid order message transaction',
      );
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
      expect(result.reason).toContain('Call #1');
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
      expect(result.reason).toContain('Call #2');
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
      expect(result.reason).toContain('Multiple order messages');
    });

    it('rejects empty calls array', async () => {
      const result = await validateSendCalls([{ calls: [] }], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('cannot be empty');
    });

    it('rejects missing calls field', async () => {
      const result = await validateSendCalls([{}], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('sendCalls');
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
