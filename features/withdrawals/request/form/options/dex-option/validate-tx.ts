// ================================================================
//  Deep transaction validation for CowSwap provider bridge
//
//  Level 2: validate target address (to ∈ allowlist)
//  Level 3: validate calldata (approve spender, function selector)
// ================================================================

// ---- CoW Protocol contract addresses ----
// Same on Mainnet and Sepolia (deterministic CREATE2 deploy).
// https://etherscan.io/address/0xC92E8bdf79f0507f65a392b0ab4667716BFE0110
// https://etherscan.io/address/0x9008D19f58AAbD9eD0D60971565AA8510560ab41

const COW_VAULT_RELAYER = '0xc92e8bdf79f0507f65a392b0ab4667716bfe0110';
const COW_SETTLEMENT = '0x9008d19f58aabd9ed0d60971565aa8510560ab41';

// ---- Token addresses (Mainnet) ----

const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const MAINNET_TOKEN_ADDRESSES = new Set([
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', // stETH
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH
  WETH,
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0xdc035d45d973e3ec169d2276ddab16f1e407384f', // USDS
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
]);

// ---- Token addresses (Sepolia) ----

const SEPOLIA_WETH = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';

const SEPOLIA_TOKEN_ADDRESSES = new Set([SEPOLIA_WETH]);

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

const getNetworkConfig = (
  chainId: number,
): { tokens: Set<string>; weth: string } => {
  if (chainId === 11155111) {
    return { tokens: SEPOLIA_TOKEN_ADDRESSES, weth: SEPOLIA_WETH };
  }
  return { tokens: MAINNET_TOKEN_ADDRESSES, weth: WETH };
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

const validateApproveSpender = (data: string): ValidationResult => {
  const spender = extractAddress(data, 0);

  if (!spender) {
    return {
      allowed: false,
      reason: 'Cannot parse approve() spender from calldata',
    };
  }

  if (spender !== COW_VAULT_RELAYER) {
    return {
      allowed: false,
      reason:
        `approve() spender must be CoW VaultRelayer ` +
        `(${COW_VAULT_RELAYER}), got ${spender}`,
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

  const { tokens, weth } = getNetworkConfig(chainId);

  const allowedTargets = new Set([
    ...tokens,
    COW_VAULT_RELAYER,
    COW_SETTLEMENT,
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
  if (to === COW_VAULT_RELAYER || to === COW_SETTLEMENT) {
    return { allowed: true };
  }

  // WETH — approve / deposit / withdraw
  if (to === weth) {
    if (selector === SELECTORS.deposit || selector === SELECTORS.withdraw) {
      return { allowed: true };
    }

    if (selector === SELECTORS.approve) {
      return validateApproveSpender(data);
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

    return validateApproveSpender(data);
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
