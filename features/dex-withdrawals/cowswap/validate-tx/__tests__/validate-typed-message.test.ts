import { validateSignTypedData } from '../validate-typed-message';

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
const SEPOLIA_STETH = sepoliaNetwork.contracts.lido.toLowerCase();
const SEPOLIA_COW_SETTLEMENT =
  sepoliaNetwork.contracts.cowSettlement.toLowerCase();

const USDS = mainnetNetwork.contracts.usds.toLowerCase();
const WBTC = mainnetNetwork.contracts.wbtc.toLowerCase();
const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

const SEPOLIA_WETH = sepoliaNetwork.contracts.weth.toLowerCase();
const SEPOLIA_WSTETH = sepoliaNetwork.contracts.wsteth.toLowerCase();

const COW_VAULT_RELAYER =
  mainnetNetwork.contracts.cowVaultRelayer.toLowerCase();
const SEPOLIA_COW_VAULT_RELAYER =
  sepoliaNetwork.contracts.cowVaultRelayer.toLowerCase();

const ATTACKER = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const SIGNER = '0x2222222222222222222222222222222222222222';

const mainnetCtx = { chainId: CHAIN_MAINNET, signer: SIGNER as `0x${string}` };
const sepoliaCtx = {
  chainId: CHAIN_SEPOLIA,
  signer: SIGNER as `0x${string}`,
};

// ---- validateSignTypedData ----

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
};

const buildTypedDataParams = (overrides: OrderOverrides = {}) => {
  const signer = overrides.signer ?? SIGNER;
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
      validTo: 9999999999,
      kind: overrides.kind ?? 'sell',
      partiallyFillable: overrides.partiallyFillable ?? false,
      appData:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
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

describe('validateSignTypedData', () => {
  describe('happy path', () => {
    it('allows valid stETH → WETH order on mainnet', () => {
      const result = validateSignTypedData(buildTypedDataParams(), mainnetCtx);
      expect(result.allowed).toBe(true);
    });

    it('allows wstETH → USDC order', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ sellToken: WSTETH, buyToken: USDC }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → USDT order', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ buyToken: USDT }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → USDS order', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ buyToken: USDS }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → WBTC order', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ buyToken: WBTC }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows stETH → ETH (0xeeee) order', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ buyToken: ETH_ADDRESS }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows valid order on Sepolia', () => {
      const result = validateSignTypedData(
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

    it('normalises checksummed signer address', () => {
      const checksummed = '0xF39Fd6e51aad88F6f4ce6aB8827279cffFb92266';
      const result = validateSignTypedData(
        buildTypedDataParams({ signer: checksummed }),
        { chainId: CHAIN_MAINNET, signer: checksummed as `0x${string}` },
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('result shape', () => {
    it('returns parsed order message as result on success', () => {
      const result = validateSignTypedData(buildTypedDataParams(), mainnetCtx);
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
    it('rejects undefined params', () => {
      const result = validateSignTypedData(undefined, mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid signTypedData parameters');
    });

    it('rejects non-array params', () => {
      const result = validateSignTypedData({}, mainnetCtx);
      expect(result.allowed).toBe(false);
    });

    it('rejects when signer element is not an address', () => {
      const result = validateSignTypedData(
        ['not-an-address', '{}'],
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when typed data element is not a JSON string', () => {
      const result = validateSignTypedData([SIGNER, 'not-json{{{'], mainnetCtx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid signTypedData parameters');
    });

    it('rejects when typed data JSON has wrong domain name', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ domainName: 'Evil Protocol' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when typed data JSON has wrong version', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ version: 'v1' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when primaryType is not Order', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ primaryType: 'Transfer' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when kind is not sell', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ kind: 'buy' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when partiallyFillable is true', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ partiallyFillable: true }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects when sellTokenBalance is not erc20', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ sellTokenBalance: 'external' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('signer / chain / contract checks', () => {
    it('rejects when params signer differs from ctx.signer', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ signer: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Signer address mismatch');
    });

    it('rejects when domain chainId differs from ctx.chainId', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ chainId: CHAIN_SEPOLIA }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Chain ID mismatch');
    });

    it('rejects when verifyingContract is not CoW Settlement', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ verifyingContract: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Verifying contract mismatch');
    });
  });

  describe('token allowlist', () => {
    it('rejects sell token not in allowlist', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ sellToken: WETH }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Sell token');
      expect(result.reason).toContain('not in the allowed list');
    });

    it('rejects buy token not in allowlist', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ buyToken: STETH }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Buy token');
      expect(result.reason).toContain('not in the allowed list');
    });

    it('rejects arbitrary attacker address as sell token', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ sellToken: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects mainnet sell token on Sepolia', () => {
      const result = validateSignTypedData(
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
    it('rejects when receiver differs from signer', () => {
      const result = validateSignTypedData(
        buildTypedDataParams({ receiver: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Receiver address cannot be different');
    });
  });
});

describe('validateSignTypedData — wstETH permit', () => {
  describe('happy path', () => {
    it('allows valid wstETH permit on mainnet', () => {
      const result = validateSignTypedData(buildPermitParams(), mainnetCtx);
      expect(result.allowed).toBe(true);
    });

    it('allows valid wstETH permit on Sepolia', () => {
      const result = validateSignTypedData(
        buildPermitParams({
          chainId: CHAIN_SEPOLIA,
          verifyingContract: SEPOLIA_WSTETH,
          spender: SEPOLIA_COW_VAULT_RELAYER,
        }),
        sepoliaCtx,
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('schema validation', () => {
    it('rejects wrong domain name', () => {
      const result = validateSignTypedData(
        buildPermitParams({ domainName: 'Evil Token' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid signTypedData parameters');
    });

    it('rejects wrong domain version', () => {
      const result = validateSignTypedData(
        buildPermitParams({ version: '2' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
    });

    it('rejects unknown primaryType', () => {
      const result = validateSignTypedData(
        buildPermitParams({ primaryType: 'Transfer' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid signTypedData parameters');
    });
  });

  describe('signer / chain / contract checks', () => {
    it('rejects when signer differs from ctx.signer', () => {
      const result = validateSignTypedData(
        buildPermitParams({ signer: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Signer address mismatch');
    });

    it('rejects when domain chainId differs from ctx.chainId', () => {
      const result = validateSignTypedData(
        buildPermitParams({ chainId: CHAIN_SEPOLIA }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Chain ID mismatch');
    });

    it('rejects when verifyingContract is not wstETH', () => {
      const result = validateSignTypedData(
        buildPermitParams({ verifyingContract: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Verifying contract mismatch');
    });
  });

  describe('permit field checks', () => {
    it('rejects when owner is not the signer', () => {
      const result = validateSignTypedData(
        buildPermitParams({ owner: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Owner address cannot be different');
    });

    it('rejects when spender is not CoW VaultRelayer', () => {
      const result = validateSignTypedData(
        buildPermitParams({ spender: ATTACKER }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Spender must be CoW VaultRelayer');
    });

    it('rejects when value is zero', () => {
      const result = validateSignTypedData(
        buildPermitParams({ value: '0' }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit value must be greater than 0');
    });

    it('rejects when deadline is in the past', () => {
      const result = validateSignTypedData(
        buildPermitParams({ deadline: 1000 }),
        mainnetCtx,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permit deadline has passed');
    });
  });
});
