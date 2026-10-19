import {
  decodeFunctionData,
  erc20Abi,
  ethAddress,
  isAddressEqual,
  Address,
  Hex,
  hexToBigInt,
  maxUint256,
  maxUint32,
} from 'viem';
import { z } from 'zod';

import { CowEthFlowAbi, CowSettlementAbi } from '../../../abi';

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
  ApprovalData,
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

    // amount is capped by the trade guard approval snapshot, see extractApprovals
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

// EthFlow sells native ETH: createOrder carries the order and the ETH, invalidateOrder cancels it
const validateEthFlowCall = async (
  data: Hex,
  value: bigint,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData | CancelOrderData>> => {
  const { cowEthFlow, cowSettlement, weth } = ctx.networkTxConfig;
  if (!cowEthFlow) return { allowed: false, reason: TRANSACTION_ERROR(2041) };

  let decoded;
  try {
    decoded = decodeFunctionData({ abi: CowEthFlowAbi, data });
  } catch {
    return { allowed: false, reason: TRANSACTION_ERROR(2041) };
  }

  const [ethFlowOrder] = decoded.args;
  const order: OrderData = {
    sellToken: ethAddress,
    buyToken: ethFlowOrder.buyToken.toLowerCase() as Address,
    receiver: ethFlowOrder.receiver.toLowerCase() as Address,
    sellAmount: ethFlowOrder.sellAmount,
    buyAmount: ethFlowOrder.buyAmount,
    validTo: ethFlowOrder.validTo,
    appData: ethFlowOrder.appData,
    feeAmount: ethFlowOrder.feeAmount,
    kind: 'sell',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
  };

  if (decoded.functionName === 'invalidateOrder') {
    if (value > 0n) return { allowed: false, reason: TRANSACTION_ERROR(2042) };

    // EthFlow places the order as WETH, owned by the contract, never expiring
    const settlementOrder = {
      ...order,
      sellToken: weth,
      validTo: Number(maxUint32),
    };
    const orderUid = calculateOrderUID(
      hashCowswapOrder(settlementOrder, ctx.chainId, cowSettlement),
      cowEthFlow,
      Number(maxUint32),
    );
    // we allow to cancel any order, same as Settlement.invalidateOrder
    return { allowed: true, result: { isCancel: true, orderUid } };
  }

  if (ethFlowOrder.partiallyFillable) {
    return { allowed: false, reason: TRANSACTION_ERROR(2043) };
  }
  if (ethFlowOrder.feeAmount !== 0n) {
    return { allowed: false, reason: TRANSACTION_ERROR(2044) };
  }
  // the contract takes exactly sellAmount + feeAmount
  if (value !== ethFlowOrder.sellAmount) {
    return { allowed: false, reason: TRANSACTION_ERROR(2045) };
  }
  // ETH to WETH is a wrap, not a trade
  if (isAddressEqual(order.buyToken, weth)) {
    return { allowed: false, reason: TRANSACTION_ERROR(2046) };
  }

  // same checks as a signed order: tokens, receiver, validTo, appData
  const messageResult = await validateCowSwapOrderMessage(order, ctx);
  if (!messageResult.allowed) return messageResult;

  return { allowed: true, result: order };
};

/**
 * Validates eth_sendTransaction parameters.
 *
 * Rules:
 * - Contract creation (no `to`): blocked
 * - Unknown target address: blocked
 * - ETH value only for EthFlow.createOrder, equal to the order sell amount
 * - CoW Protocol contract (Settlement): only allow setPreSignature() calls with valid orderUID and signature
 * - Other tokens: approve() only, spender must be VaultRelayer, amount checked by the trade guard
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

  const { to: txTo, from, data, value } = parseResult.data[0];

  if (from && !isAddressEqual(from, ctx.signer)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2047),
    };
  }

  const txValue = value ? hexToBigInt(value) : 0n;
  const { sellTokens, cowVaultRelayer, cowSettlement, cowEthFlow } =
    ctx.networkTxConfig;

  if (cowEthFlow && isAddressEqual(txTo, cowEthFlow)) {
    return validateEthFlowCall(data, txValue, ctx);
  }

  if (txValue > 0n) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2031),
    };
  }

  // native ETH placeholder is never a transaction target
  const allowedTargets = new Set(
    [...sellTokens, cowSettlement].filter((address) => address !== ethAddress),
  );

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

// EIP-5792 batch; unknown top-level keys (e.g. capabilities) are dropped
const sendCallsParamsSchema = z.tuple([
  z.object({
    version: z.string().optional(),
    chainId: hexSchema.optional(),
    from: addressSchema.optional(),
    atomicRequired: z.boolean().optional(),
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

  const { calls, chainId, from } = parseResult.data[0];

  // the batch must run on the guarded chain and account
  if (chainId !== undefined && hexToBigInt(chainId) !== BigInt(ctx.chainId)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2048),
    };
  }
  if (from && !isAddressEqual(from, ctx.signer)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2047),
    };
  }

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

// Approve calls of an already validated eth_sendTransaction / wallet_sendCalls request
export const extractApprovals = (
  method: string,
  params: unknown,
): ApprovalData[] => {
  let calls: { to: Address; data: Hex }[] = [];
  if (method === 'eth_sendTransaction') {
    const parsed = sendTransactionParamsSchema.safeParse(params);
    if (!parsed.success) throw new Error(TRANSACTION_ERROR(2040));
    calls = [parsed.data[0]];
  } else if (method === 'wallet_sendCalls') {
    const parsed = sendCallsParamsSchema.safeParse(params);
    if (!parsed.success) throw new Error(TRANSACTION_ERROR(2040));
    calls = parsed.data[0].calls;
  }

  const approvals: ApprovalData[] = [];
  for (const { to, data } of calls) {
    try {
      const { functionName, args } = decodeFunctionData({
        abi: erc20Abi,
        data,
      });
      if (functionName === 'approve') {
        approvals.push({
          token: to.toLowerCase() as Address,
          amount: args[1],
        });
      }
    } catch {
      // not an ERC-20 call, e.g. setPreSignature
    }
  }

  return approvals;
};

// Params forwarded to the wallet: only the validated fields, unknown keys dropped
export const sanitizeTransactionParams = (
  method: string,
  params: unknown[] | undefined,
): unknown[] | undefined => {
  if (method === 'eth_sendTransaction') {
    return sendTransactionParamsSchema.parse(params);
  }
  if (method === 'wallet_sendCalls') {
    return sendCallsParamsSchema.parse(params);
  }

  return params;
};
