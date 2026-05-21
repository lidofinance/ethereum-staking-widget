import { decodeFunctionData, erc20Abi } from 'viem';
import type { Hex } from 'viem';

import { wethABI } from 'abi/weth-abi';
import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

const ALLOWED_WETH_FUNCTIONS = new Set(['approve', 'deposit', 'withdraw']);

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
    if (addr) addresses.add(addr.toLowerCase());
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

// ---- Types ----

type TxParam = { to?: string; data?: string; value?: string };

export type ValidationResult = { allowed: boolean; reason?: string };

// ---- Helpers ----

const getNetworkTxConfig = (chainId: number): NetworkTxConfig => {
  if (chainId === 11155111) return SEPOLIA_CONFIG;
  return MAINNET_CONFIG;
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
  try {
    const { functionName, args } = decodeFunctionData({
      abi: erc20Abi,
      data: data as Hex,
    });

    if (functionName !== 'approve' || !args) {
      return {
        allowed: false,
        reason: `Expected approve(), got ${functionName}()`,
      };
    }

    const spender = (args[0] as string).toLowerCase();
    if (spender !== cowVaultRelayer) {
      return {
        allowed: false,
        reason: `approve() spender must be CoW VaultRelayer (${cowVaultRelayer}), got ${spender}`,
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Cannot decode approve() calldata' };
  }
};

// ================================================================
//  Public validation functions
// ================================================================

const validateWethTransaction = (
  data: string,
  cowVaultRelayer: string,
): ValidationResult => {
  try {
    const { functionName, args } = decodeFunctionData({
      abi: wethABI,
      data: data as Hex,
    });

    if (!ALLOWED_WETH_FUNCTIONS.has(functionName)) {
      return {
        allowed: false,
        reason: `Only approve(), deposit(), withdraw() allowed on WETH. Got ${functionName}()`,
      };
    }

    if (functionName === 'approve' && args) {
      const spender = (args[0] as string).toLowerCase();
      if (spender !== cowVaultRelayer) {
        return {
          allowed: false,
          reason: `approve() spender must be CoW VaultRelayer (${cowVaultRelayer}), got ${spender}`,
        };
      }
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Cannot decode WETH calldata' };
  }
};

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
  const txTo = tx.to?.toLowerCase();
  const data = (tx.data ?? '0x').toLowerCase();

  if (!txTo) {
    return { allowed: false, reason: 'Contract creation is not allowed' };
  }

  const { tokens, weth, cowVaultRelayer, cowSettlement } =
    getNetworkTxConfig(chainId);
  const allowedTargets = new Set([...tokens, cowVaultRelayer, cowSettlement]);

  if (!allowedTargets.has(txTo)) {
    return {
      allowed: false,
      reason: `Transaction to ${txTo} is not allowed. Only token contracts and CoW Protocol addresses are permitted.`,
    };
  }
  const isCowSwapContract = txTo === cowVaultRelayer || txTo === cowSettlement;
  // CoW Protocol contracts — trust any call
  if (isCowSwapContract) return { allowed: true };

  const isWethContract = txTo === weth;
  // WETH — decode with extended ABI (approve + deposit + withdraw)
  if (isWethContract) return validateWethTransaction(data, cowVaultRelayer);

  // Other tokens — only approve(), no ETH value
  if (tokens.has(txTo)) {
    if (hasNonZeroValue(tx.value)) {
      return {
        allowed: false,
        reason: 'ETH value is not allowed on token approve()',
      };
    }

    return validateApproveSpender(data, cowVaultRelayer);
  }

  return { allowed: false, reason: `Unexpected target: ${txTo}` };
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
