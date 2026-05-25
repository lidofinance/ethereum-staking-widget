import {
  validateSendTransaction,
  validateSendCalls,
  validateSignTypedData,
} from '../validate-tx';

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

const SEPOLIA_WETH = sepoliaNetwork.contracts.weth.toLowerCase();
const SEPOLIA_STETH = sepoliaNetwork.contracts.lido.toLowerCase();
const SEPOLIA_COW_SETTLEMENT =
  sepoliaNetwork.contracts.cowSettlement.toLowerCase();

const USDS = mainnetNetwork.contracts.usds.toLowerCase();
const WBTC = mainnetNetwork.contracts.wbtc.toLowerCase();
const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

const ATTACKER = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const UNKNOWN = '0x1111111111111111111111111111111111111111';
const SIGNER = '0x2222222222222222222222222222222222222222';

// Helper: build approve(address spender, uint256 amount) calldata
const buildApprove = (spender: string): string =>
  '0x095ea7b3' +
  spender.slice(2).toLowerCase().padStart(64, '0') +
  'f'.repeat(64);

// Helper: build transfer(address to, uint256 amount) calldata
const buildTransfer = (to: string): string =>
  '0xa9059cbb' + to.slice(2).toLowerCase().padStart(64, '0') + '0'.repeat(64);

// Selectors
const DEPOSIT_SELECTOR = '0xd0e30db0';
const WITHDRAW_SELECTOR = '0x2e1a7d4d' + '0'.repeat(64);

describe('validateSendTransaction', () => {
  describe('basic validation', () => {
    it('rejects undefined params', () => {
      const result = validateSendTransaction(undefined, CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects empty params array', () => {
      const result = validateSendTransaction([], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects non-object params', () => {
      const result = validateSendTransaction(['string'], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects tx with no to field', () => {
      const result = validateSendTransaction([{ data: '0x' }], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid transaction parameters');
    });

    it('rejects unknown target address', () => {
      const result = validateSendTransaction(
        [{ to: UNKNOWN, data: '0x' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed');
    });

    it('rejects ETH transfer to unknown address', () => {
      const result = validateSendTransaction(
        [{ to: UNKNOWN, value: '0xDE0B6B3A7640000', data: '0x' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('token approve validation', () => {
    const tokens = [
      ['stETH', STETH],
      ['wstETH', WSTETH],
      ['USDC', USDC],
      ['USDT', USDT],
    ] as const;

    it.each(tokens)(
      'allows approve(VaultRelayer) on %s',
      (_name, tokenAddr) => {
        const result = validateSendTransaction(
          [{ to: tokenAddr, data: buildApprove(COW_VAULT_RELAYER) }],
          CHAIN_MAINNET,
        );
        expect(result.allowed).toBe(true);
      },
    );

    it.each(tokens)('blocks approve(attacker) on %s', (_name, tokenAddr) => {
      const result = validateSendTransaction(
        [{ to: tokenAddr, data: buildApprove(ATTACKER) }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('VaultRelayer');
    });

    it.each(tokens)('blocks transfer() on %s', (_name, tokenAddr) => {
      const result = validateSendTransaction(
        [{ to: tokenAddr, data: buildTransfer(ATTACKER) }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Expected approve(), got transfer()');
    });

    it('blocks approve with ETH value on non-WETH token', () => {
      const result = validateSendTransaction(
        [
          {
            to: STETH,
            data: buildApprove(COW_VAULT_RELAYER),
            value: '0xDE0B6B3A7640000',
          },
        ],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('ETH value');
    });

    it('allows approve with zero value on token', () => {
      const result = validateSendTransaction(
        [
          {
            to: STETH,
            data: buildApprove(COW_VAULT_RELAYER),
            value: '0x0',
          },
        ],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('handles checksummed address (mixed case to)', () => {
      const checksummedSteth = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
      const result = validateSendTransaction(
        [{ to: checksummedSteth, data: buildApprove(COW_VAULT_RELAYER) }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('blocks approve with truncated calldata', () => {
      const result = validateSendTransaction(
        [{ to: STETH, data: '0x095ea7b3' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Cannot decode approve() calldata');
    });
  });

  describe('WETH operations', () => {
    it('blocks deposit() on WETH (ETH value not allowed)', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: DEPOSIT_SELECTOR, value: '0xDE0B6B3A7640000' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('ETH value');
    });

    it('blocks withdraw() on WETH (only approve() allowed)', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: WITHDRAW_SELECTOR }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
    });

    it('allows approve(VaultRelayer) on WETH', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: buildApprove(COW_VAULT_RELAYER) }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('blocks approve(attacker) on WETH', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: buildApprove(ATTACKER) }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('VaultRelayer');
    });

    it('blocks transfer() on WETH', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: buildTransfer(ATTACKER) }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Expected approve(), got transfer()');
    });

    it('blocks unknown selector on WETH', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: '0x12345678' + '0'.repeat(128) }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('CoW Protocol contracts', () => {
    it('allows any call to GPv2Settlement', () => {
      const result = validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: '0xabcdef12' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows any call to GPv2VaultRelayer', () => {
      const result = validateSendTransaction(
        [{ to: COW_VAULT_RELAYER, data: '0x12345678' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows call with checksummed CoW Settlement address', () => {
      const checksummed = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41';
      const result = validateSendTransaction(
        [{ to: checksummed, data: '0xabcdef12' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('Sepolia testnet', () => {
    it('blocks deposit() on Sepolia WETH (only approve() allowed)', () => {
      const result = validateSendTransaction(
        [{ to: SEPOLIA_WETH, data: DEPOSIT_SELECTOR }],
        CHAIN_SEPOLIA,
      );
      expect(result.allowed).toBe(false);
    });

    it('allows approve(VaultRelayer) on Sepolia WETH', () => {
      const result = validateSendTransaction(
        [{ to: SEPOLIA_WETH, data: buildApprove(COW_VAULT_RELAYER) }],
        CHAIN_SEPOLIA,
      );
      expect(result.allowed).toBe(true);
    });

    it('rejects mainnet WETH on Sepolia', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: DEPOSIT_SELECTOR }],
        CHAIN_SEPOLIA,
      );
      expect(result.allowed).toBe(false);
    });

    it('allows CoW Settlement on Sepolia (same address)', () => {
      const result = validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: '0xabcdef12' }],
        CHAIN_SEPOLIA,
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('rejects tx with no data field (data is required)', () => {
      const result = validateSendTransaction(
        [{ to: COW_SETTLEMENT }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
    });

    it('handles tx with empty data (0x)', () => {
      const result = validateSendTransaction(
        [{ to: COW_SETTLEMENT, data: '0x' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('rejects null param', () => {
      const result = validateSendTransaction([null], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
    });
  });
});

describe('validateSendCalls', () => {
  describe('valid batches', () => {
    it('allows single valid call', () => {
      const result = validateSendCalls(
        [
          {
            calls: [{ to: STETH, data: buildApprove(COW_VAULT_RELAYER) }],
          },
        ],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows approve + Settlement call batch', () => {
      const result = validateSendCalls(
        [
          {
            calls: [
              { to: STETH, data: buildApprove(COW_VAULT_RELAYER) },
              { to: COW_SETTLEMENT, data: '0x12345678' },
            ],
          },
        ],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('blocks WETH deposit + approve batch (ETH value not allowed)', () => {
      const result = validateSendCalls(
        [
          {
            calls: [
              { to: WETH, data: DEPOSIT_SELECTOR, value: '0x1' },
              { to: WETH, data: buildApprove(COW_VAULT_RELAYER) },
            ],
          },
        ],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('invalid batches', () => {
    it('rejects batch with one invalid call', () => {
      const result = validateSendCalls(
        [
          {
            calls: [
              { to: STETH, data: buildApprove(COW_VAULT_RELAYER) },
              { to: ATTACKER, data: '0x' },
            ],
          },
        ],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Call #1');
    });

    it('reports correct index for invalid call', () => {
      const result = validateSendCalls(
        [
          {
            calls: [
              { to: COW_SETTLEMENT, data: '0x12345678' },
              { to: COW_SETTLEMENT, data: '0x12345678' },
              { to: UNKNOWN, data: '0x' },
            ],
          },
        ],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Call #2');
    });

    it('rejects empty calls array', () => {
      const result = validateSendCalls([{ calls: [] }], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('cannot be empty');
    });

    it('rejects missing calls field', () => {
      const result = validateSendCalls([{}], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('sendCalls');
    });

    it('rejects undefined params', () => {
      const result = validateSendCalls(undefined, CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
    });

    it('rejects non-object params', () => {
      const result = validateSendCalls(['string'], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Sepolia batches', () => {
    it('allows Sepolia WETH + Settlement batch', () => {
      const result = validateSendCalls(
        [
          {
            calls: [
              { to: SEPOLIA_WETH, data: buildApprove(COW_VAULT_RELAYER) },
              { to: COW_SETTLEMENT, data: '0x12345678' },
            ],
          },
        ],
        CHAIN_SEPOLIA,
      );
      expect(result.allowed).toBe(true);
    });
  });
});

// ---- validateSignTypedData ----

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

const mainnetCtx = { chainId: CHAIN_MAINNET, signer: SIGNER as `0x${string}` };
const sepoliaCtx = {
  chainId: CHAIN_SEPOLIA,
  signer: SIGNER as `0x${string}`,
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
