import {
  decodeFunctionData,
  erc20Abi,
  ethAddress,
  isAddressEqual,
  Address,
  Hex,
  hexToBigInt,
  maxUint256,
} from 'viem';

import { CowSettlementAbi } from '../../../abi';

import { deny } from './deny';
import { validateCowSwapOrderMessage } from './validate-typed-message';
import { validateEthFlowCall } from './validate-eth-flow';
import { calculateOrderUID, hashCowswapOrder, fetchOrderByUID } from './order';
import { getAppDataHex } from './app-data';
import { sendTransactionParamsSchema } from './schemas';
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
      return deny(2018);
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
    return deny(2019);
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
      return deny(2020);
    }

    const [spender, amount] = args;
    if (!isAddressEqual(spender, cowVaultRelayer)) {
      return deny(2023);
    }

    if (amount === maxUint256) {
      return deny(2024);
    }

    // amount is capped by the trade guard approval snapshot, see extractApprovals
    return { allowed: true };
  } catch {
    return deny(2026);
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
        return deny(2028);
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

    return deny(2027);
  } catch {
    return deny(2029);
  }
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
    return deny(2030);
  }

  const { to: txTo, from, data, value } = parseResult.data[0];

  if (from && !isAddressEqual(from, ctx.signer)) {
    return deny(2047);
  }

  const txValue = value ? hexToBigInt(value) : 0n;
  const { sellTokens, cowVaultRelayer, cowSettlement, cowEthFlow } =
    ctx.networkTxConfig;

  if (cowEthFlow && isAddressEqual(txTo, cowEthFlow)) {
    return validateEthFlowCall(data, txValue, ctx);
  }

  if (txValue > 0n) {
    return deny(2031);
  }

  // native ETH placeholder is never a transaction target
  const allowedTargets = new Set(
    [...sellTokens, cowSettlement].filter((address) => address !== ethAddress),
  );

  // txTo is lowercased by addressSchema
  if (allowedTargets.has(txTo)) {
    // CoW Protocol - only preSetSignature and only for smart wallets(can't sign messages)
    if (isAddressEqual(txTo, cowSettlement))
      return validateSettlerSignature(data, ctx);

    return {
      ...validateApproveSpender(data, cowVaultRelayer),
      result: undefined,
    };
  }
  return deny(2032);
};
