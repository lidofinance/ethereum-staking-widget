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

import { validateSignTypedData } from '../validate-typed-message';
import { standardFetcher } from 'utils/standardFetcher';
import { MetadataApi } from '@cowprotocol/sdk-app-data';

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
const SEPOLIA_WSTETH = sepoliaNetwork.contracts.wsteth.toLowerCase();
const SEPOLIA_COW_VAULT_RELAYER =
  sepoliaNetwork.contracts.cowVaultRelayer.toLowerCase();
const SEPOLIA_FEE_RECIPIENT = sepoliaNetwork.contracts.daoAgent.toLowerCase();

const COW_VAULT_RELAYER =
  mainnetNetwork.contracts.cowVaultRelayer.toLowerCase();

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ATTACKER = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const SIGNER = '0x2222222222222222222222222222222222222222';

const mainnetCtx = { chainId: CHAIN_MAINNET, signer: SIGNER as `0x${string}` };
const sepoliaCtx = { chainId: CHAIN_SEPOLIA, signer: SIGNER as `0x${string}` };

// ---- App data response helper ----

const APP_DATA =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

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

const buildMetadataApiMock = (appDataHex: string = APP_DATA) => {
  function MockMetadataApi(this: any) {
    this.getAppDataInfo = vi.fn().mockResolvedValue({ appDataHex });
  }
  return MockMetadataApi;
};

// ---- EIP-712 type definitions ----

const EIP712_DOMAIN_TYPES = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
] as const;

const PERMIT_TYPES = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
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

type PermitOverrides = {
  signer?: string;
  chainId?: number;
  verifyingContract?: string;
  domainName?: string;
  version?: string;
  primaryType?: string;
  owner?: string;
  spender?: string;
  value?: string;
  nonce?: number;
  deadline?: number;
};

const buildPermitParams = (overrides: PermitOverrides = {}) => {
  const signer = overrides.signer ?? SIGNER;
  const futureDeadline = Math.floor(Date.now() / 1000) + 3600;
  const permit = {
    domain: {
      name: overrides.domainName ?? 'Wrapped liquid staked Ether 2.0',
      verifyingContract: overrides.verifyingContract ?? WSTETH,
      chainId: overrides.chainId ?? CHAIN_MAINNET,
      version: overrides.version ?? '1',
    },
    message: {
      owner: overrides.owner ?? signer,
      spender: overrides.spender ?? COW_VAULT_RELAYER,
      value:
        overrides.value ??
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      nonce: overrides.nonce ?? 0,
      deadline: overrides.deadline ?? futureDeadline,
    },
    primaryType: overrides.primaryType ?? 'Permit',
    types: {
      EIP712Domain: EIP712_DOMAIN_TYPES,
      Permit: PERMIT_TYPES,
    },
  };
  return [signer, JSON.stringify(permit)];
};

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
};

const buildTypedDataParams = (overrides: OrderOverrides = {}) => {
  const signer = overrides.signer ?? SIGNER;
  const defaultValidTo = Math.floor(Date.now() / 1000) + 3600;
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
      sellAmount: '1000000000000000000',
      buyAmount: '950000000000000000',
      validTo: overrides.validTo ?? defaultValidTo,
      kind: overrides.kind ?? 'sell',
      partiallyFillable: overrides.partiallyFillable ?? false,
      appData: APP_DATA,
      receiver: overrides.receiver ?? signer,
      feeAmount: '0',
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

// ---- Setup / teardown ----

beforeEach(() => {
  vi.mocked(standardFetcher).mockResolvedValue(
    buildAppDataResponse(FEE_RECIPIENT),
  );
  (MetadataApi as unknown as Mock).mockImplementation(
    buildMetadataApiMock(APP_DATA),
  );
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
      vi.mocked(standardFetcher).mockResolvedValue(
        buildAppDataResponse(SEPOLIA_FEE_RECIPIENT),
      );
      const result = await validateSignTypedData(
        buildTypedDataParams({
          chainId: CHAIN_SEPOLIA,
          verifyingContract: SEPOLIA_COW_SETTLEMENT,
          sellToken: SEPOLIA_STETH,
          buyToken: SEPOLIA_WETH,
        }),
        sepoliaCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('normalises checksummed signer address', async () => {
      const checksummed = '0xF39Fd6e51aad88F6f4ce6aB8827279cffFb92266';
      const result = await validateSignTypedData(
        buildTypedDataParams({ signer: checksummed }),
        { chainId: CHAIN_MAINNET, signer: checksummed as `0x${string}` },
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
      expect(result.reason).toContain('Invalid signTypedData parameters');
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
      expect(result.reason).toContain('Invalid signTypedData parameters');
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
  });

  describe('signer / chain / contract checks', () => {
    it('rejects when params signer differs from ctx.signer', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ signer: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Signer address mismatch');
    });

    it('rejects when domain chainId differs from ctx.chainId', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ chainId: CHAIN_SEPOLIA }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Chain ID mismatch');
    });

    it('rejects when verifyingContract is not CoW Settlement', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ verifyingContract: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Verifying contract mismatch');
    });
  });

  describe('token allowlist', () => {
    it('rejects sell token not in allowlist', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ sellToken: WETH }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Sell token');
      expect(result.reason).toContain('not in the allowed list');
    });

    it('rejects buy token not in allowlist', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ buyToken: STETH }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Buy token');
      expect(result.reason).toContain('not in the allowed list');
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
      expect(result.reason).toContain('Sell token');
    });
  });

  describe('receiver validation', () => {
    it('rejects when receiver differs from signer', async () => {
      const result = await validateSignTypedData(
        buildTypedDataParams({ receiver: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Receiver address cannot be different');
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
      expect(result.reason).toContain('validTo has already passed');
    });

    it('rejects validTo too far in future (> MAX_ORDER_AGE_SECONDS = 86400s)', async () => {
      const tooFarValidTo = Math.floor(Date.now() / 1000) + 86400 + 3600;
      const result = await validateSignTypedData(
        buildTypedDataParams({ validTo: tooFarValidTo }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('too far in the future');
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
      expect(result.reason).toContain('Failed to fetch or validate app data');
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
      expect(result.reason).toContain('Failed to fetch or validate app data');
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
      expect(result.reason).toContain('Failed to fetch or validate app data');
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
      expect(result.reason).toContain('Failed to fetch or validate app data');
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
      expect(result.reason).toContain('Failed to fetch or validate app data');
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
      expect(result.reason).toContain('Partner fee recipient mismatch');
    });

    it('rejects when appData hash mismatches order.appData (MetadataApi returns different hash)', async () => {
      const wrongHash =
        '0x1111111111111111111111111111111111111111111111111111111111111111';
      (MetadataApi as unknown as Mock).mockImplementation(
        buildMetadataApiMock(wrongHash),
      );
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('App data mismatch');
    });

    it('rejects when MetadataApi throws', async () => {
      function ThrowingMetadataApi(this: any) {
        this.getAppDataInfo = vi
          .fn()
          .mockRejectedValue(new Error('MetadataApi error'));
      }
      (MetadataApi as unknown as Mock).mockImplementation(ThrowingMetadataApi);
      const result = await validateSignTypedData(
        buildTypedDataParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Failed to fetch or validate app data');
    });
  });
});

describe('validateSignTypedData — wstETH permit', () => {
  describe('permit messages are blocked', () => {
    it('rejects valid wstETH permit on mainnet (permits not allowed)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams(),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit messages are not allowed');
    });

    it('rejects valid wstETH permit on Sepolia (permits not allowed)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({
          chainId: CHAIN_SEPOLIA,
          verifyingContract: SEPOLIA_WSTETH,
          spender: SEPOLIA_COW_VAULT_RELAYER,
        }),
        sepoliaCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit messages are not allowed');
    });

    it('rejects permit even when deadline is in the past (permit check runs first)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ deadline: 1000 }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit messages are not allowed');
    });

    it('rejects permit when chain differs from ctx (permit blocked before chain check)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ chainId: CHAIN_SEPOLIA }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      // Permit hits block before chain check
      expect(result.reason).toContain('Permit messages are not allowed');
    });

    it('rejects permit with wrong verifyingContract (permit blocked regardless)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ verifyingContract: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit messages are not allowed');
    });

    it('rejects permit when owner is not the signer (permit blocked regardless)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ owner: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit messages are not allowed');
    });

    it('rejects permit when spender is not CoW VaultRelayer (permit blocked regardless)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ spender: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit messages are not allowed');
    });

    it('rejects permit when value is zero (permit blocked regardless)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ value: '0' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit messages are not allowed');
    });
  });

  describe('schema validation (runs before permit block)', () => {
    it('rejects wrong domain name (schema fail — Invalid signTypedData parameters)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ domainName: 'Evil Token' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid signTypedData parameters');
    });

    it('rejects wrong domain version (schema fail)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ version: '2' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects unknown primaryType (schema fail — Invalid signTypedData parameters)', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ primaryType: 'Transfer' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid signTypedData parameters');
    });
  });

  describe('signer check (runs before permit block)', () => {
    it('rejects when signer differs from ctx.signer', async () => {
      const result = await validateSignTypedData(
        buildPermitParams({ signer: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Signer address mismatch');
    });
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
    expect(result.reason).toContain('Pre/Post Hooks are not allowed');
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
    expect(result.reason).toContain('Pre/Post Hooks are not allowed');
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
    vi.mocked(standardFetcher).mockResolvedValue(
      buildAppDataWithHooks(FEE_RECIPIENT, { pre: [], post: [] }),
    );
    const result = await validateSignTypedData(
      buildTypedDataParams(),
      mainnetCtx,
    );
    expect(result.allowed).toBe(true);
  });
});
