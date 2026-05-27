import {
  decodeFunctionData,
  erc20Abi,
  isAddressEqual,
  Address,
  Hex,
  hexToBigInt,
} from 'viem';
import z from 'zod';
import {
  addressSchema,
  getNetworkTxConfig,
  hexSchema,
  ValidationResult,
} from './utils';
import { CowSettlementAbi } from '../abi';

// ================================================================
//  Public validation functions
// ================================================================

const sendTransactionParamsSchema = z.tuple([
  z.object({
    to: addressSchema,
    from: addressSchema.optional(),
    data: hexSchema,
    gas: hexSchema.optional(),
    value: hexSchema.optional(),
  }),
]);

const validateApproveSpender = (
  data: Hex,
  cowVaultRelayer: Address,
): ValidationResult => {
  try {
    const { functionName, args } = decodeFunctionData({
      abi: erc20Abi,
      data: data,
    });

    if (functionName !== 'approve' || !args) {
      return {
        allowed: false,
        reason: `Expected approve(), got ${functionName}()`,
      };
    }

    const spender = args[0];
    if (!isAddressEqual(spender, cowVaultRelayer)) {
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

const validateSettlerSignature = (data: Hex): ValidationResult => {
  try {
    const { functionName, args } = decodeFunctionData({
      abi: CowSettlementAbi,
      data: data,
    });

    if (functionName !== 'setPreSignature' || !args) {
      return {
        allowed: false,
        reason: `Expected setPreSignature(), got ${functionName}()`,
      };
    }

    const [orderUid, signature] = args;

    if (!orderUid || !signature) {
      return {
        allowed: false,
        reason: `setPreSignature() requires orderUid and signature arguments`,
      };
    }

    return { allowed: true };
  } catch {
    return {
      allowed: false,
      reason: 'Cannot decode setPreSignature() calldata',
    };
  }
};

/**
 * Validates eth_sendTransaction parameters.
 *
 * Rules:
 * - Contract creation (no `to`): blocked
 * - Unknown target address: blocked
 * - CoW Protocol contracts (Settlement, VaultRelayer): any call allowed
 * - Other tokens: approve() only, spender must be VaultRelayer, no ETH value
 */
export const validateSendTransaction = (
  params: unknown,
  chainId: number,
): ValidationResult => {
  const parseResult = sendTransactionParamsSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      reason: `Invalid transaction parameters: ${parseResult.error}`,
    };
  }

  const { to: txTo, data, value } = parseResult.data[0];

  if (value && hexToBigInt(value) > 0n) {
    return {
      allowed: false,
      reason: `ETH value is not allowed in transactions`,
    };
  }

  const { tokens, cowVaultRelayer, cowSettlement } =
    getNetworkTxConfig(chainId);
  const allowedTargets = new Set([...tokens, cowSettlement]);

  if (!allowedTargets.has(txTo.toLocaleLowerCase() as Address)) {
    return {
      allowed: false,
      reason: `Transaction to ${txTo} is not allowed. Only token contracts and CoW Protocol addresses are permitted.`,
    };
  }

  // CoW Protocol contracts — trust any call
  if (isAddressEqual(txTo, cowSettlement))
    return validateSettlerSignature(data);

  // Other tokens — only approve(), no ETH value
  if (tokens.has(txTo)) {
    return validateApproveSpender(data, cowVaultRelayer);
  }

  return { allowed: false, reason: `Unexpected target: ${txTo}` };
};

const sendCallsParamsSchema = z.tuple([
  z.object({
    calls: z
      .array(
        z.object({
          to: addressSchema,
          data: hexSchema,
          value: hexSchema.optional(),
        }),
      )
      .min(1, { message: 'calls array cannot be empty' })
      .max(10, { message: 'calls array cannot have more than 10 items' }),
  }),
]);

/**
 * Validates wallet_sendCalls (EIP-5792 batch) parameters.
 * Each call in the batch is validated with the same rules as eth_sendTransaction.
 */
export const validateSendCalls = (
  params: unknown,
  chainId: number,
): ValidationResult => {
  const parseResult = sendCallsParamsSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      reason: `Invalid sendCalls parameters: ${parseResult.error}`,
    };
  }

  const calls = parseResult.data[0].calls;

  for (const [i, call] of calls.entries()) {
    const result = validateSendTransaction([call], chainId);
    if (!result.allowed) {
      return {
        allowed: false,
        reason: `Call #${i} in batch blocked: ${result.reason}`,
      };
    }
  }

  return { allowed: true };
};
