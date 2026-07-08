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
import { sepolia } from 'viem/chains';
import { z } from 'zod';
import { standardFetcher } from 'utils/standardFetcher';

import { validateCowSwapOrderMessage } from './validate-typed-message';
import {
  addressSchema,
  AppDataSchema,
  bigintStringSchema,
  calculateOrderUID,
  CancelOrderData,
  getAppDataHex,
  getNetworkTxConfig,
  hashCowswapOrder,
  hexSchema,
  isCancelOrder,
  jsonStringSchema,
  OrderData,
  ValidationContext,
  ValidationResult,
} from './utils';
import { CowSettlementAbi } from '../abi';
import { COWSWAP_API_TIMEOUT_MS, COWSWAP_ORDER_API } from '../consts';
import { readThresholds } from '../trade-guard/utils';
import { TRANSACTION_ERROR } from './consts';

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

const CowSwapGetOrderResponseSchema = z.object({
  creationDate: z.string(),
  owner: addressSchema,
  uid: hexSchema,
  availableBalance: z.string().nullable(),
  executedBuyAmount: z.string(),
  executedSellAmount: z.string(),
  executedSellAmountBeforeFees: z.string(),
  executedFeeAmount: z.string(),
  executedFee: z.string(),
  executedFeeToken: addressSchema,
  invalidated: z.boolean(),
  status: z.string(),
  class: z.string(),
  settlementContract: addressSchema,
  isLiquidityOrder: z.boolean(),
  fullAppData: jsonStringSchema(AppDataSchema),
  quote: z.object({
    gasAmount: bigintStringSchema,
    gasPrice: bigintStringSchema,
    sellTokenPrice: z.string(),
    sellAmount: bigintStringSchema,
    buyAmount: bigintStringSchema,
    feeAmount: bigintStringSchema,
    solver: addressSchema,
    verified: z.unknown(),
    metadata: z.unknown(),
  }),
  sellToken: addressSchema,
  buyToken: addressSchema,
  receiver: addressSchema,
  sellAmount: bigintStringSchema,
  buyAmount: bigintStringSchema,
  validTo: z.uint32(),
  appData: hexSchema,
  feeAmount: bigintStringSchema,
  kind: z.literal('sell'),
  partiallyFillable: z.literal(false),
  sellTokenBalance: z.literal('erc20'),
  buyTokenBalance: z.literal('erc20'),
  signingScheme: z.string(),
  signature: z.unknown(),
  interactions: z.object({
    pre: z.array(z.unknown()).length(0),
    post: z.array(z.unknown()).length(0),
  }),
});

const fetchOrderByUID = async (orderUID: Hex, chainId: number) => {
  const environment = chainId === sepolia.id ? 'sepolia' : 'mainnet';
  const result = await standardFetcher(
    COWSWAP_ORDER_API(orderUID, environment),
    { timeoutMs: COWSWAP_API_TIMEOUT_MS },
  );

  return CowSwapGetOrderResponseSchema.parse(result);
};

const validatePreSetSignature = async (
  orderUID: Hex,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData>> => {
  const { chainId } = ctx;
  try {
    const orderData = await fetchOrderByUID(orderUID, chainId);
    const appDataHex = getAppDataHex(orderData.fullAppData);

    const { cowSettlement } = getNetworkTxConfig(chainId);

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
  const { chainId } = ctx;
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

  const { sellTokens, cowVaultRelayer, cowSettlement } =
    getNetworkTxConfig(chainId);
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
