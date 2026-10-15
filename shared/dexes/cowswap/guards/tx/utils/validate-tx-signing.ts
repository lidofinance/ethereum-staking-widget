import {
  decodeFunctionData,
  erc20Abi,
  isAddressEqual,
  Address,
  Hex,
  hexToBigInt,
  maxUint256,
  parseEther,
} from 'viem';
import { z } from 'zod';

import { CowSettlementAbi } from '../../../abi';

import { readThresholds } from '../../trade/utils';

import { TRANSACTION_ERROR } from '../consts';

import { validateCowSwapOrderMessage } from './validate-typed-message';
import {
  isCancelOrder,
  calculateOrderUID,
  hashCowswapOrder,
  fetchOrderByUID,
} from './order';
import { getAppDataHex } from './app-data';
import {
  sendTransactionParamsSchema,
  addressSchema,
  hexSchema,
} from './schemas';
import type {
  CancelOrderData,
  OrderData,
  ValidationContext,
  ValidationResult,
} from './types';

// ================================================================
//  Public validation functions
// ================================================================

const validatePreSetSignature = async (
  orderUID: Hex,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData>> => {
  const { chainId, networkTxConfig } = ctx;
  try {
    const orderData = await fetchOrderByUID(orderUID, chainId);
    const appDataHex = getAppDataHex(orderData.fullAppData);

    const { cowSettlement } = networkTxConfig;

    const order: OrderData = {
      appData: appDataHex,
      buyAmount: orderData.buyAmount,
      buyToken: orderData.buyToken,
      feeAmount: orderData.feeAmount,
      receiver: orderData.receiver,
      sellAmount: orderData.sellAmount,
      sellToken: orderData.sellToken,
      validTo: orderData.validTo,
      buyTokenBalance: 'erc20',
      kind: 'sell',
      partiallyFillable: false,
      sellTokenBalance: 'erc20',
    };

    const orderHex = hashCowswapOrder(order, chainId, cowSettlement);

    const orderUIDRecalculated = calculateOrderUID(
      orderHex,
      ctx.signer,
      orderData.validTo,
    );

    if (orderUIDRecalculated !== orderUID) {
      return {
        allowed: false,
        reason: TRANSACTION_ERROR(2018),
      };
    }

    const cowSwapValidationResult = await validateCowSwapOrderMessage(
      order,
      ctx,
      orderData.fullAppData,
    );

    if (!cowSwapValidationResult.allowed) {
      return cowSwapValidationResult;
    }

    return { allowed: true, result: order };
  } catch (error) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2019),
    };
  }
};

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
        reason: TRANSACTION_ERROR(2020),
      };
    }

    const [spender, amount] = args;
    if (!isAddressEqual(spender, cowVaultRelayer)) {
      return {
        allowed: false,
        reason: TRANSACTION_ERROR(2023),
      };
    }

    if (amount === maxUint256) {
      return {
        allowed: false,
        reason: TRANSACTION_ERROR(2024),
      };
    }

    const maxAllowedSellAmount = parseEther(
      readThresholds().maxAllowedSellAmount.toFixed(0),
    );

    if (amount > maxAllowedSellAmount) {
      return {
        allowed: false,
        reason: TRANSACTION_ERROR(2025),
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: TRANSACTION_ERROR(2026) };
  }
};

const validateSettlerSignature = async (
  data: Hex,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData | CancelOrderData>> => {
  try {
    const { functionName, args } = decodeFunctionData({
      abi: CowSettlementAbi,
      data: data,
    });

    if (functionName == 'setPreSignature') {
      const [orderUID, signature] = args;

      if (!orderUID || !signature) {
        return {
          allowed: false,
          reason: TRANSACTION_ERROR(2028),
        };
      }

      return validatePreSetSignature(orderUID, ctx);
    } else if (functionName == 'invalidateOrder') {
      // we allow to cancel any order and no need to validate the order
      const [orderUID] = args;
      return {
        result: { isCancel: true, orderUid: orderUID },
        allowed: true,
      };
    }

    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2027),
    };
  } catch {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2029),
    };
  }
};

/**
 * Validates eth_sendTransaction parameters.
 *
 * Rules:
 * - Contract creation (no `to`): blocked
 * - Unknown target address: blocked
 * - no ETH value allowed in any transaction(as withdrawal flow should not require sending ETH)
 * - CoW Protocol contract (Settlement): only allow setPreSignature() calls with valid orderUID and signature
 * - Other tokens: approve() only, spender must be VaultRelayer,
 */
export const validateSendTransaction = async (
  params: unknown,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData | undefined | CancelOrderData>> => {
  const parseResult = sendTransactionParamsSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2030),
    };
  }

  const { to: txTo, data, value } = parseResult.data[0];

  if (value && hexToBigInt(value) > 0n) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2031),
    };
  }

  const { sellTokens, cowVaultRelayer, cowSettlement } = ctx.networkTxConfig;
  const allowedTargets = new Set([...sellTokens, cowSettlement]);

  if (allowedTargets.has(txTo.toLocaleLowerCase() as Address)) {
    // CoW Protocol - only preSetSignature and only for smart wallets(can't sign messages)
    if (isAddressEqual(txTo, cowSettlement))
      return validateSettlerSignature(data, ctx);

    return {
      ...validateApproveSpender(data, cowVaultRelayer),
      result: undefined,
    };
  }
  return {
    allowed: false,
    reason: TRANSACTION_ERROR(2032),
  };
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
export const validateSendCalls = async (
  params: unknown,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData | CancelOrderData>> => {
  const parseResult = sendCallsParamsSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2033),
    };
  }

  const calls = parseResult.data[0].calls;

  let order: OrderData | CancelOrderData | undefined = undefined;

  for (const [_, call] of calls.entries()) {
    const result = await validateSendTransaction([call], ctx);
    if (!result.allowed) {
      return {
        allowed: false,
        reason: TRANSACTION_ERROR(2034),
      };
    }
    if (result.result) {
      if (order) {
        // only 1 order/cancel per call batch
        return {
          allowed: false,
          reason: TRANSACTION_ERROR(2035),
        };
      }
      order = result.result;
    }
  }

  if (!order) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2036),
    };
  }

  if (isCancelOrder(order) && calls.length > 1) {
    // during cancel, no other calls are allowed
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2037),
    };
  }

  return { allowed: true, result: order };
};
