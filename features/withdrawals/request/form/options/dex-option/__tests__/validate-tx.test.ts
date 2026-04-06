import {
  validateSendTransaction,
  validateSendCalls,
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

const ATTACKER = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const UNKNOWN = '0x1111111111111111111111111111111111111111';

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
      expect(result.reason).toContain('Missing');
    });

    it('rejects empty params array', () => {
      const result = validateSendTransaction([], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Missing');
    });

    it('rejects non-object params', () => {
      const result = validateSendTransaction(['string'], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Missing');
    });

    it('rejects contract creation (no to field)', () => {
      const result = validateSendTransaction(
        [{ data: '0x6060604052...' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Contract creation');
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

    it.each(tokens)(
      'blocks approve(attacker) on %s',
      (_name, tokenAddr) => {
        const result = validateSendTransaction(
          [{ to: tokenAddr, data: buildApprove(ATTACKER) }],
          CHAIN_MAINNET,
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('VaultRelayer');
      },
    );

    it.each(tokens)(
      'blocks transfer() on %s',
      (_name, tokenAddr) => {
        const result = validateSendTransaction(
          [{ to: tokenAddr, data: buildTransfer(ATTACKER) }],
          CHAIN_MAINNET,
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('Only approve()');
      },
    );

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
      const checksummedSteth =
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
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
      expect(result.reason).toContain('parse');
    });
  });

  describe('WETH operations', () => {
    it('allows deposit() on WETH', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: DEPOSIT_SELECTOR, value: '0xDE0B6B3A7640000' }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
    });

    it('allows withdraw() on WETH', () => {
      const result = validateSendTransaction(
        [{ to: WETH, data: WITHDRAW_SELECTOR }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
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
      expect(result.reason).toContain('Only approve(), deposit(), withdraw()');
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
    it('allows deposit() on Sepolia WETH', () => {
      const result = validateSendTransaction(
        [{ to: SEPOLIA_WETH, data: DEPOSIT_SELECTOR }],
        CHAIN_SEPOLIA,
      );
      expect(result.allowed).toBe(true);
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
    it('handles tx with no data field (defaults to 0x)', () => {
      const result = validateSendTransaction(
        [{ to: COW_SETTLEMENT }],
        CHAIN_MAINNET,
      );
      expect(result.allowed).toBe(true);
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
            calls: [
              { to: STETH, data: buildApprove(COW_VAULT_RELAYER) },
            ],
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

    it('allows WETH deposit + approve batch', () => {
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
      expect(result.allowed).toBe(true);
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
      expect(result.reason).toContain('Empty');
    });

    it('rejects missing calls field', () => {
      const result = validateSendCalls([{}], CHAIN_MAINNET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Missing calls');
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
