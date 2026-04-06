// ================================================================
//  Deep transaction validation for CowSwap provider bridge
//
//  Level 2: validate target address (to ∈ allowlist)
//  Level 3: validate calldata (approve spender, function selector)
// ================================================================

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

// ---- Contract addresses from network configs ----

// Keys from networks/*.json used for DEX token allowlist
const DEX_TOKEN_KEYS = [
  'lido', // stETH
  'wsteth',
  'weth',
  'usdc',
  'usdt',
  'usds',
  'wbtc',
] as const;

const collectTokenAddresses = (
  contracts: Record<string, string>,
): Set<string> => {
  const addresses = new Set<string>();
  for (const key of DEX_TOKEN_KEYS) {
    const addr = contracts[key];
    if (addr) {
      addresses.add(addr.toLowerCase());
    }
  }
  return addresses;
};

type NetworkTxConfig = {
  tokens: Set<string>;
  weth: string;
  cowVaultRelayer: string;
  cowSettlement: string;
};

const buildNetworkTxConfig = (
  contracts: Record<string, string>,
): NetworkTxConfig => ({
  tokens: collectTokenAddresses(contracts),
  weth: contracts.weth.toLowerCase(),
  cowVaultRelayer: contracts.cowVaultRelayer.toLowerCase(),
  cowSettlement: contracts.cowSettlement.toLowerCase(),
});

const MAINNET_CONFIG = buildNetworkTxConfig(mainnetNetwork.contracts);
const SEPOLIA_CONFIG = buildNetworkTxConfig(sepoliaNetwork.contracts);

// ---- Function selectors (first 4 bytes of keccak256 signature) ----

const SELECTORS = {
  approve: '0x095ea7b3',
  deposit: '0xd0e30db0',
  withdraw: '0x2e1a7d4d',
} as const;

// ---- Types ----

type TxParam = {
  to?: string;
  data?: string;
  value?: string;
};

export type ValidationResult = {
  allowed: boolean;
  reason?: string;
};

// ---- Internal helpers ----

const getNetworkTxConfig = (chainId: number): NetworkTxConfig => {
  if (chainId === 11155111) return SEPOLIA_CONFIG;
  return MAINNET_CONFIG;
};

/**
 * Extracts an address argument from ABI-encoded calldata.
 *
 * Layout: "0x" (2) + selector (8) + arg0 (64) + arg1 (64) + ...
 * Address occupies last 40 chars of a 64-char slot (first 24 are zero-padding).
 */
const extractAddress = (data: string, argIndex: number): string | null => {
  const argStart = 2 + 8 + argIndex * 64;
  const addressStart = argStart + 24;
  const addressEnd = addressStart + 40;

  if (data.length < addressEnd) return null;

  return '0x' + data.slice(addressStart, addressEnd).toLowerCase();
};

const hasNonZeroValue = (value: string | undefined): boolean => {
  if (!value) return false;
  const stripped = value.replace(/^0x0*/i, '');
  return stripped.length > 0;
};

const validateApproveSpender = (
  data: string,
  cowVaultRelayer: string,
): ValidationResult => {
  const spender = extractAddress(data, 0);

  if (!spender) {
    return {
      allowed: false,
      reason: 'Cannot parse approve() spender from calldata',
    };
  }

  if (spender !== cowVaultRelayer) {
    return {
      allowed: false,
      reason:
        `approve() spender must be CoW VaultRelayer ` +
        `(${cowVaultRelayer}), got ${spender}`,
    };
  }

  return { allowed: true };
};

// ================================================================
//  Public validation functions
// ================================================================

/**
 * Validates eth_sendTransaction parameters.
 *
 * Rules:
 * - Contract creation (no `to`): blocked
 * - Unknown target address: blocked
 * - CoW Protocol contracts (Settlement, VaultRelayer): any call allowed
 * - WETH: approve() / deposit() / withdraw() only
 * - Other tokens: approve() only, spender must be VaultRelayer, no ETH value
 */
export const validateSendTransaction = (
  params: unknown[] | undefined,
  chainId: number,
): ValidationResult => {
  if (!params?.[0] || typeof params[0] !== 'object') {
    return { allowed: false, reason: 'Missing transaction params' };
  }

  const tx = params[0] as TxParam;

  if (!tx.to) {
    return { allowed: false, reason: 'Contract creation is not allowed' };
  }

  const to = tx.to.toLowerCase();
  const data = (tx.data ?? '0x').toLowerCase();
  const selector = data.slice(0, 10);

  const { tokens, weth, cowVaultRelayer, cowSettlement } =
    getNetworkTxConfig(chainId);

  const allowedTargets = new Set([
    ...tokens,
    cowVaultRelayer,
    cowSettlement,
  ]);

  if (!allowedTargets.has(to)) {
    return {
      allowed: false,
      reason:
        `Transaction to ${to} is not allowed. ` +
        `Only token contracts and CoW Protocol addresses are permitted.`,
    };
  }

  // CoW Protocol contracts — trust any call
  if (to === cowVaultRelayer || to === cowSettlement) {
    return { allowed: true };
  }

  // WETH — approve / deposit / withdraw
  if (to === weth) {
    if (selector === SELECTORS.deposit || selector === SELECTORS.withdraw) {
      return { allowed: true };
    }

    if (selector === SELECTORS.approve) {
      return validateApproveSpender(data, cowVaultRelayer);
    }

    return {
      allowed: false,
      reason:
        `Only approve(), deposit(), withdraw() allowed on WETH. ` +
        `Got selector: ${selector}`,
    };
  }

  // Other tokens — only approve(), no ETH value
  if (tokens.has(to)) {
    if (selector !== SELECTORS.approve) {
      return {
        allowed: false,
        reason:
          `Only approve() is allowed on token ${to}. ` +
          `Got selector: ${selector}`,
      };
    }

    if (hasNonZeroValue(tx.value)) {
      return {
        allowed: false,
        reason: 'ETH value is not allowed on token approve()',
      };
    }

    return validateApproveSpender(data, cowVaultRelayer);
  }

  return { allowed: false, reason: `Unexpected target: ${to}` };
};

/**
 * Validates wallet_sendCalls (EIP-5792 batch) parameters.
 * Each call in the batch is validated with the same rules as eth_sendTransaction.
 */
export const validateSendCalls = (
  params: unknown[] | undefined,
  chainId: number,
): ValidationResult => {
  if (!params?.[0] || typeof params[0] !== 'object') {
    return { allowed: false, reason: 'Missing sendCalls params' };
  }

  const batch = params[0] as { calls?: TxParam[] };

  if (!Array.isArray(batch.calls)) {
    return { allowed: false, reason: 'Missing calls array in sendCalls' };
  }

  if (batch.calls.length === 0) {
    return { allowed: false, reason: 'Empty calls array' };
  }

  for (let i = 0; i < batch.calls.length; i++) {
    const result = validateSendTransaction([batch.calls[i]], chainId);
    if (!result.allowed) {
      return {
        allowed: false,
        reason: `Call #${i} in batch blocked: ${result.reason}`,
      };
    }
  }

  return { allowed: true };
};
