import {
  decodeFunctionData,
  erc20Abi,
  isAddressEqual,
  Address,
  Hex,
  hexToBigInt,
  maxUint256,
  parseEther,
  formatEther,
} from 'viem';
import { sepolia } from 'viem/chains';
import z from 'zod';
import { standardFetcher } from 'utils/standardFetcher';

import { validateCowSwapOrderMessage } from './validate-typed-message';
import {
  addressSchema,
  AppDataSchema,
  bigintStringSchema,
  calculateOrderUID,
  getAppDataHex,
  getNetworkTxConfig,
  hashCowswapOrder,
  hexSchema,
  jsonStringSchema,
  OrderData,
  ValidationContext,
  ValidationResult,
} from './utils';
import { CowSettlementAbi } from '../abi';
import { COWSWAP_API_TIMEOUT_MS, COWSWAP_ORDER_API } from '../consts';
import { readThresholds } from '../trade-guard/utils';

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
  validTo: z.number(),
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
    const orderData = await fetchOrderByUID(orderUID, chainId); // or 'staging' based on your environment

    const appDataHex = await getAppDataHex(orderData.fullAppData);

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
        reason: `Order UID does not match verified order data.`,
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
      reason: `Failed to fetch order data for UID ${orderUID}: ${error}`,
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
        reason: `Expected approve(), got ${functionName}()`,
      };
    }

    const [spender, amount] = args;
    if (!isAddressEqual(spender, cowVaultRelayer)) {
      return {
        allowed: false,
        reason: `approve() spender must be CoW VaultRelayer (${cowVaultRelayer}), got ${spender}`,
      };
    }

    if (amount === maxUint256) {
      return {
        allowed: false,
        reason: `approve() with infinite amount is not allowed`,
      };
    }

    const maxAllowedSellAmount = parseEther(
      readThresholds().maxAllowedSellAmount.toFixed(0),
    );

    if (amount > maxAllowedSellAmount) {
      return {
        allowed: false,
        reason: `approve() amount(${formatEther(amount)}) exceeds maximum allowed sell amount (${formatEther(maxAllowedSellAmount)})`,
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Cannot decode approve() calldata' };
  }
};

const validateSettlerSignature = async (
  data: Hex,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData>> => {
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

    const [orderUID, signature] = args;

    if (!orderUID || !signature) {
      return {
        allowed: false,
        reason: `setPreSignature() requires orderUID and signature arguments`,
      };
    }

    return validatePreSetSignature(orderUID, ctx);
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
 * - no ETH value allowed in any transaction(as withdrawal flow should not require sending ETH)
 * - CoW Protocol contract (Settlement): only allow setPreSignature() calls with valid orderUID and signature
 * - Other tokens: approve() only, spender must be VaultRelayer,
 */
export const validateSendTransaction = async (
  params: unknown,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData | undefined>> => {
  const { chainId } = ctx;
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

  const { sellTokens, cowVaultRelayer, cowSettlement } =
    getNetworkTxConfig(chainId);
  const allowedTargets = new Set([...sellTokens, cowSettlement]);

  if (!allowedTargets.has(txTo.toLocaleLowerCase() as Address)) {
    return {
      allowed: false,
      reason: `Transaction to ${txTo} is not allowed. Only token contracts and CoW Protocol addresses are permitted.`,
    };
  }

  // CoW Protocol - only preSetSignature and only for smart wallets(can't sign messages)
  if (isAddressEqual(txTo, cowSettlement))
    return validateSettlerSignature(data, ctx);

  // Other tokens — only approve(), no ETH value
  if (sellTokens.has(txTo)) {
    return {
      ...validateApproveSpender(data, cowVaultRelayer),
      result: undefined,
    };
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
export const validateSendCalls = async (
  params: unknown,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData>> => {
  const parseResult = sendCallsParamsSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      reason: `Invalid sendCalls parameters: ${parseResult.error}`,
    };
  }

  const calls = parseResult.data[0].calls;

  let order: OrderData | undefined = undefined;

  for (const [i, call] of calls.entries()) {
    const result = await validateSendTransaction([call], ctx);
    if (!result.allowed) {
      return {
        allowed: false,
        reason: `Call #${i} in batch blocked: ${result.reason}`,
      };
    }
    if (result.result) {
      if (order) {
        return {
          allowed: false,
          reason: `Multiple order messages in batch calls are not allowed`,
        };
      }
      order = result.result;
    }
  }

  if (!order) {
    return {
      allowed: false,
      reason: `Batch calls must include at least one valid order message transaction`,
    };
  }

  return { allowed: true, result: order };
};
