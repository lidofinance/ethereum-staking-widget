/* eslint-disable import/no-extraneous-dependencies */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('utils/standardFetcher', () => ({
  standardFetcher: vi.fn(),
}));

import { keccak256, toHex } from 'viem';
// json-stringify-deterministic is a transitive dependency (see utils.ts)
import stringify from 'json-stringify-deterministic';

import {
  validateSignTypedData,
  validateCowSwapOrderMessage,
} from '../validate-typed-message';
import { standardFetcher } from 'utils/standardFetcher';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

const CHAIN_MAINNET = 1;
const CHAIN_SEPOLIA = 11155111;

// All addresses from network configs (source of truth)
const COW_SETTLEMENT = mainnetNetwork.contracts.cowSettlement.toLowerCase();
const STETH = mainnetNetwork.contracts.lido.toLowerCase();
const WSTETH = mainnetNetwork.contracts.wsteth.toLowerCase();
const WETH = mainnetNetwork.contracts.weth.toLowerCase();
const USDC = mainnetNetwork.contracts.usdc.toLowerCase();
const USDT = mainnetNetwork.contracts.usdt.toLowerCase();
const USDS = mainnetNetwork.contracts.usds.toLowerCase();
const WBTC = mainnetNetwork.contracts.wbtc.toLowerCase();
const FEE_RECIPIENT = mainnetNetwork.contracts.daoAgent.toLowerCase();

const SEPOLIA_STETH = sepoliaNetwork.contracts.lido.toLowerCase();
const SEPOLIA_COW_SETTLEMENT =
  sepoliaNetwork.contracts.cowSettlement.toLowerCase();
const SEPOLIA_WETH = sepoliaNetwork.contracts.weth.toLowerCase();
const SEPOLIA_FEE_RECIPIENT = sepoliaNetwork.contracts.daoAgent.toLowerCase();

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ATTACKER = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const SIGNER = '0x2222222222222222222222222222222222222222';

const mainnetCtx = { chainId: CHAIN_MAINNET, signer: SIGNER as `0x${string}` };
const sepoliaCtx = { chainId: CHAIN_SEPOLIA, signer: SIGNER as `0x${string}` };

// ---- App data response helper ----

// keccak256 of the deterministically-stringified appData document — mirrors
// getAppDataHex() in utils.ts, which is how the validator derives the hash the
// order's appData field is checked against.
const hashFullAppData = (fullAppData: string): `0x${string}` =>
  keccak256(toHex(stringify(JSON.parse(fullAppData))));

const REAL_APP_DATA_HASH =
  '0x04c6e64bf43a255e35ceb6178cc12b21d3feb190c8cf003927f868dcd1a6c189';

type AppDataOverrides = {
  appCode?: string;
  orderClass?: string;
  volumeBps?: number;
  slippageBips?: number;
  smartSlippage?: boolean;
};

const buildAppDataResponse = (
  feeRecipient: string,
  overrides: AppDataOverrides = {},
) => {
  const fullAppData = JSON.stringify({
    appCode: overrides.appCode ?? 'Lido Staking Widget',
    metadata: {
      orderClass: { orderClass: overrides.orderClass ?? 'market' },
      partnerFee: {
        recipient: feeRecipient,
        volumeBps: overrides.volumeBps ?? 30,
      },
      quote: {
        slippageBips: overrides.slippageBips ?? 100,
        smartSlippage: overrides.smartSlippage ?? false,
      },
      widget: {
        appCode: 'Lido Staking Widget',
        environment: 'mainnet',
      },
    },
    version: '1.0.0',
  });
  return { fullAppData };
};

// Default appData document the fetch mock returns, and its canonical hash.
// Orders must carry this hash in their appData field to pass validation.
const DEFAULT_APP_DATA_RESPONSE = buildAppDataResponse(FEE_RECIPIENT);
const APP_DATA = hashFullAppData(DEFAULT_APP_DATA_RESPONSE.fullAppData);

// ---- EIP-712 type definitions ----

const EIP712_DOMAIN_TYPES = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
] as const;

const ORDER_TYPES = [
  { name: 'sellToken', type: 'address' },
  { name: 'buyToken', type: 'address' },
  { name: 'receiver', type: 'address' },
  { name: 'sellAmount', type: 'uint256' },
  { name: 'buyAmount', type: 'uint256' },
  { name: 'validTo', type: 'uint32' },
  { name: 'appData', type: 'bytes32' },
  { name: 'feeAmount', type: 'uint256' },
  { name: 'kind', type: 'string' },
  { name: 'partiallyFillable', type: 'bool' },
  { name: 'sellTokenBalance', type: 'string' },
  { name: 'buyTokenBalance', type: 'string' },
] as const;

// ---- Param builders ----

type OrderOverrides = {
  signer?: string;
  chainId?: number;
  verifyingContract?: string;
  sellToken?: string;
  buyToken?: string;
  receiver?: string;
  domainName?: string;
  version?: string;
  primaryType?: string;
  kind?: string;
  partiallyFillable?: boolean;
  sellTokenBalance?: string;
  buyTokenBalance?: string;
  validTo?: number;
  appData?: string;
  sellAmount?: string;
  buyAmount?: string;
  feeAmount?: string;
};

const buildTypedDataParams = (overrides: OrderOverrides = {}) => {
  const signer = overrides.signer ?? SIGNER;
  // Within MAX_ORDER_AGE_SECONDS (30 min) so the validTo check passes
  const defaultValidTo = Math.floor(Date.now() / 1000) + 600;
  const order = {
    domain: {
      name: overrides.domainName ?? 'Gnosis Protocol',
      version: overrides.version ?? 'v2',
      chainId: overrides.chainId ?? CHAIN_MAINNET,
      verifyingContract: overrides.verifyingContract ?? COW_SETTLEMENT,
    },
    message: {
      sellToken: overrides.sellToken ?? STETH,
      buyToken: overrides.buyToken ?? WETH,
      sellAmount: overrides.sellAmount ?? '1000000000000000000',
      buyAmount: overrides.buyAmount ?? '950000000000000000',
      validTo: overrides.validTo ?? defaultValidTo,
      kind: overrides.kind ?? 'sell',
      partiallyFillable: overrides.partiallyFillable ?? false,
      appData: overrides.appData ?? APP_DATA,
      receiver: overrides.receiver ?? signer,
      feeAmount: overrides.feeAmount ?? '0',
      sellTokenBalance: overrides.sellTokenBalance ?? 'erc20',
      buyTokenBalance: overrides.buyTokenBalance ?? 'erc20',
    },
    primaryType: overrides.primaryType ?? 'Order',
    types: {
      EIP712Domain: EIP712_DOMAIN_TYPES,
      Order: ORDER_TYPES,
    },
  };
  return [signer, JSON.stringify(order)];
};

type CancelOverrides = {
  signer?: string;
  chainId?: number;
  verifyingContract?: string;
  orderUid?: string;
};

const buildCancelParams = (overrides: CancelOverrides = {}) => {
  const signer = overrides.signer ?? SIGNER;
  const order = {
    domain: {
      name: 'Gnosis Protocol',
      version: 'v2',
      chainId: overrides.chainId ?? CHAIN_MAINNET,
      verifyingContract: overrides.verifyingContract ?? COW_SETTLEMENT,
    },
    message: {
      orderUids: [overrides.orderUid ?? '0x1234'],
    },
    primaryType: 'OrderCancellations',
    types: {
      EIP712Domain: EIP712_DOMAIN_TYPES,
      OrderCancellations: [{ name: 'orderUids', type: 'bytes[]' }],
    },
  };
  return [signer, JSON.stringify(order)];
};

// ---- Setup / teardown ----

beforeEach(() => {
  vi.mocked(standardFetcher).mockResolvedValue(DEFAULT_APP_DATA_RESPONSE);
});

afterEach(() => vi.resetAllMocks());

// ================================================================

describe('validateSignTypedData', () => {
  describe('happy path', () => {
    it('allows valid stETH → WETH order on mainnet', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows wstETH → USDC order', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ sellToken: WSTETH, buyToken: USDC }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → USDT order', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ buyToken: USDT }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → USDS order', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ buyToken: USDS }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → WBTC order', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ buyToken: WBTC }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → ETH (0xeeee) order', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ buyToken: ETH_ADDRESS }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows valid order on Sepolia', async () => {
      const sepoliaAppData = buildAppDataResponse(SEPOLIA_FEE_RECIPIENT);
      vi.mocked(standardFetcher).mockResolvedValue(sepoliaAppData);
      const result = await validateSignTypedData(
        buildTypedDataParams({
          chainId: CHAIN_SEPOLIA,
          verifyingContract: SEPOLIA_COW_SETTLEMENT,
          sellToken: SEPOLIA_STETH,
          buyToken: SEPOLIA_WETH,
          appData: hashFullAppData(sepoliaAppData.fullAppData),
        }),
        sepoliaCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('normalises checksummed signer address', async () => {
      const checksummed = '0xF39Fd6e51aad88F6f4ce6aB8827279cffFb92266';
      const result = await validateSignTypedData(
        buildTypedDataParams({ signer: checksummed }),
        { chainId: CHAIN_MAINNET, signer: checksummed },
      );
      expect(result.allowed).toBe(true);
    });

    it('allows order with real production appData', async () => {
      vi.mocked(standardFetcher).mockResolvedValue({
        fullAppData: JSON.stringify({
          appCode: 'Lido Staking Widget',
          metadata: {
            orderClass: {
              orderClass: 'market',
            },
            partnerFee: {
              recipient: '0x3e40d73eb977dc6a537af587d48316fee66e9c8c',
              volumeBps: 30,
            },
            quote: {
              slippageBips: 300,
              smartSlippage: true,
            },
            widget: {
              appCode: 'CoW Swap',
              environment: 'production',
            },
          },
          version: '1.14.0',
        }),
      });
      const result = await validateSignTypedData(
        buildTypedDataParams({ appData: REAL_APP_DATA_HASH }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('result shape', () => {
    it('returns parsed order message as result on success', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
      if (!result.allowed) return;
      expect(result.result).toBeDefined();
      if (!result.result) return;
      expect(result.result.sellToken).toBe(STETH);
      expect(result.result.buyToken).toBe(WETH);
      expect(result.result.sellAmount).toBe(1000000000000000000n);
      expect(result.result.buyAmount).toBe(950000000000000000n);
      expect(result.result.feeAmount).toBe(0n);
      expect(result.result.kind).toBe('sell');
      expect(result.result.partiallyFillable).toBe(false);
    });
  });

  describe('invalid params', () => {
    it('rejects undefined params', async () => {
      const result = await validateSignTypedData(undefined, mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects non-array params', async () => {
      const result = await validateSignTypedData({}, mainnetCtx);
      expect(result.allowed).toBe(false);
    });

    it('rejects when signer element is not an address', async () => {
      const result = await validateSignTypedData(
        ['not-an-address', '{}'],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when typed data element is not a JSON string', async () => {
      const result = await validateSignTypedData(
        [SIGNER, 'not-json{{{'],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when typed data JSON has wrong domain name', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ domainName: 'Evil Protocol' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when typed data JSON has wrong version', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ version: 'v1' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when primaryType is not Order', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ primaryType: 'Transfer' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when kind is not sell', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ kind: 'buy' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when partiallyFillable is true', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ partiallyFillable: true }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when sellTokenBalance is not erc20', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ sellTokenBalance: 'external' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when sellAmount is not a valid bigint string', async () => {
      // bigintStringSchema rejects a non-numeric amount (BigInt() throws).
      const result = await validateSignTypedData(
        buildTypedDataParams({ sellAmount: 'not-a-number' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when sellAmount is a negative bigint string', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ sellAmount: '-1' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('signer / chain / contract checks', () => {
    it('rejects when params signer differs from ctx.signer', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ signer: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when domain chainId differs from ctx.chainId', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ chainId: CHAIN_SEPOLIA }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when verifyingContract is not CoW Settlement', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ verifyingContract: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('token allowlist', () => {
    it('rejects sell token not in allowlist', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ sellToken: WETH }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects buy token not in allowlist', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ buyToken: STETH }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects arbitrary attacker address as sell token', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ sellToken: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects mainnet sell token on Sepolia', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({
          chainId: CHAIN_SEPOLIA,
          verifyingContract: SEPOLIA_COW_SETTLEMENT,
          sellToken: STETH,
          buyToken: SEPOLIA_WETH,
        }),
        sepoliaCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('receiver validation', () => {
    it('rejects when receiver differs from signer', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ receiver: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects real stETH→ETH order with receiver replaced by attacker', async () => {
      vi.mocked(standardFetcher).mockResolvedValue({
        fullAppData: JSON.stringify({
          appCode: 'Lido Staking Widget',
          metadata: {
            orderClass: { orderClass: 'market' },
            partnerFee: {
              recipient: '0x3e40d73eb977dc6a537af587d48316fee66e9c8c',
              volumeBps: 30,
            },
            quote: { slippageBips: 300, smartSlippage: true },
            widget: { appCode: 'CoW Swap', environment: 'production' },
          },
          version: '1.14.0',
        }),
      });
      // Real order with receiver swapped to attacker; receiver check fires before validTo check
      const result = await validateSignTypedData(
        buildTypedDataParams({
          sellToken: STETH,
          buyToken: ETH_ADDRESS,
          sellAmount: '4497656450651374',
          buyAmount: '3757899892262334',
          feeAmount: '0',
          validTo: 1780074458,
          appData: REAL_APP_DATA_HASH,
          receiver: ATTACKER,
        }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('validTo checks', () => {
    it('rejects expired validTo', async () => {
      const expiredValidTo = Math.floor(Date.now() / 1000) - 60;
      const result = await validateSignTypedData(
        buildTypedDataParams({ validTo: expiredValidTo }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects validTo too far in future (> MAX_ORDER_AGE_SECONDS = 1800s)', async () => {
      const tooFarValidTo = Math.floor(Date.now() / 1000) + 1800 + 600;
      const result = await validateSignTypedData(
        buildTypedDataParams({ validTo: tooFarValidTo }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('appData validation', () => {
    it('rejects when fetch fails (network error)', async () => {
      vi.mocked(standardFetcher).mockRejectedValue(new Error('Network error'));
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when appData response has wrong appCode (schema fail)', async () => {
      vi.mocked(standardFetcher).mockResolvedValue(
        buildAppDataResponse(FEE_RECIPIENT, { appCode: 'Evil App' }),
      );
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when partnerFee.volumeBps is wrong', async () => {
      vi.mocked(standardFetcher).mockResolvedValue(
        buildAppDataResponse(FEE_RECIPIENT, { volumeBps: 50 }),
      );
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when slippageBips > 300', async () => {
      vi.mocked(standardFetcher).mockResolvedValue(
        buildAppDataResponse(FEE_RECIPIENT, { slippageBips: 301 }),
      );
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when orderClass is not market', async () => {
      vi.mocked(standardFetcher).mockResolvedValue(
        buildAppDataResponse(FEE_RECIPIENT, { orderClass: 'limit' }),
      );
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when partner fee recipient mismatches feeRecipient', async () => {
      vi.mocked(standardFetcher).mockResolvedValue(
        buildAppDataResponse(ATTACKER),
      );
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('rejects when computed appData hash mismatches order.appData', async () => {
      // Fetch returns the valid default document, but the order carries a
      // different appData hash than the one the validator derives from it.
      const wrongHash =
        '0x1111111111111111111111111111111111111111111111111111111111111111';
      const result = await validateSignTypedData(
        buildTypedDataParams({ appData: wrongHash }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });
});

describe('validateSignTypedData — order cancellation (OrderCancellations)', () => {
  it('allows a valid cancellation on mainnet', async () => {
    const result = await validateSignTypedData(buildCancelParams(), mainnetCtx);
    expect(result.allowed).toBe(true);
  });

  it('rejects cancellation when domain chainId differs from ctx.chainId', async () => {
    const result = await validateSignTypedData(
      buildCancelParams({ chainId: CHAIN_SEPOLIA }),
      mainnetCtx,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('rejects cancellation when verifyingContract is not CoW Settlement', async () => {
    const result = await validateSignTypedData(
      buildCancelParams({ verifyingContract: ATTACKER }),
      mainnetCtx,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('rejects cancellation with more than one order UID', async () => {
    // schema requires exactly one order UID
    const order = {
      domain: {
        name: 'Gnosis Protocol',
        version: 'v2',
        chainId: CHAIN_MAINNET,
        verifyingContract: COW_SETTLEMENT,
      },
      message: { orderUids: ['0x1234', '0x5678'] },
      primaryType: 'OrderCancellations',
      types: {
        EIP712Domain: EIP712_DOMAIN_TYPES,
        OrderCancellations: [{ name: 'orderUids', type: 'bytes[]' }],
      },
    };
    const result = await validateSignTypedData(
      [SIGNER, JSON.stringify(order)],
      mainnetCtx,
    );
    expect(result.allowed).toBe(false);
  });
});

describe('validateCowSwapOrderMessage — prefetched appData', () => {
  // A valid, in-window order message (bigint amounts) used to exercise the
  // prefetched-appData branch directly.
  const buildOrderMessage = () => ({
    sellToken: STETH as `0x${string}`,
    buyToken: WETH as `0x${string}`,
    sellAmount: 1000000000000000000n,
    buyAmount: 950000000000000000n,
    validTo: Math.floor(Date.now() / 1000) + 600,
    kind: 'sell' as const,
    partiallyFillable: false as const,
    appData: APP_DATA,
    receiver: SIGNER as `0x${string}`,
    feeAmount: 0n,
    sellTokenBalance: 'erc20' as const,
    buyTokenBalance: 'erc20' as const,
  });

  it('rejects when prefetched appData fails schema validation', async () => {
    const result = await validateCowSwapOrderMessage(
      buildOrderMessage(),
      mainnetCtx,
      { not: 'valid-app-data' } as never,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
    // Fetch must not be used when appData is supplied inline.
    expect(vi.mocked(standardFetcher)).not.toHaveBeenCalled();
  });
});

describe('validateCowSwapOrderMessage — hooks in appData', () => {
  const validHook = {
    callData: '0x1234' as const,
    dappId: 'test-dapp',
    gasLimit: '21000',
    target: '0x1111111111111111111111111111111111111111' as const,
  };

  const buildAppDataWithHooks = (
    feeRecipient: string,
    hooks: { pre?: (typeof validHook)[]; post?: (typeof validHook)[] },
  ) => {
    const fullAppData = JSON.stringify({
      appCode: 'Lido Staking Widget',
      metadata: {
        orderClass: { orderClass: 'market' },
        partnerFee: { recipient: feeRecipient, volumeBps: 30 },
        quote: { slippageBips: 100, smartSlippage: false },
        widget: { appCode: 'Lido Staking Widget', environment: 'mainnet' },
        hooks,
      },
      version: '1.0.0',
    });
    return { fullAppData };
  };

  it('rejects order when pre-hooks are present', async () => {
    vi.mocked(standardFetcher).mockResolvedValue(
      buildAppDataWithHooks(FEE_RECIPIENT, { pre: [validHook] }),
    );
    const result = await validateSignTypedData(
      buildTypedDataParams(),
      mainnetCtx,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('rejects order when post-hooks are present', async () => {
    vi.mocked(standardFetcher).mockResolvedValue(
      buildAppDataWithHooks(FEE_RECIPIENT, { post: [validHook] }),
    );
    const result = await validateSignTypedData(
      buildTypedDataParams(),
      mainnetCtx,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('allows order when hooks field is absent', async () => {
    // Default mock has no hooks — already covered but explicitly test
    const result = await validateSignTypedData(
      buildTypedDataParams(),
      mainnetCtx,
    );
    expect(result.allowed).toBe(true);
  });

  it('allows order when hooks object is present but both pre and post are empty arrays', async () => {
    const appData = buildAppDataWithHooks(FEE_RECIPIENT, { pre: [], post: [] });
    vi.mocked(standardFetcher).mockResolvedValue(appData);
    const result = await validateSignTypedData(
      buildTypedDataParams({ appData: hashFullAppData(appData.fullAppData) }),
      mainnetCtx,
    );
    expect(result.allowed).toBe(true);
  });
});
