import { ethAddress, isAddressEqual, hexToBigInt } from 'viem';

import { deny } from './deny';
import { isCancelOrder } from './order';
import { extractApprovals, isWethDeposit } from './params';
import { sendCallsParamsSchema } from './schemas';
import { validateSendTransaction } from './validate-send-transaction';
import type {
  CancelOrderData,
  OrderData,
  ValidationContext,
  ValidationResult,
} from './types';

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
    return deny(2033);
  }

  const { calls, chainId, from } = parseResult.data[0];

  // the batch must run on the guarded chain and account
  if (chainId !== undefined && hexToBigInt(chainId) !== BigInt(ctx.chainId)) {
    return deny(2048);
  }
  if (from && !isAddressEqual(from, ctx.signer)) {
    return deny(2047);
  }

  // Safe sells ETH as WETH.deposit{value} + [WETH.approve] + setPreSignature(WETH order)
  const { weth, sellTokens } = ctx.networkTxConfig;
  const depositIndexes = calls.flatMap((call, index) =>
    isWethDeposit(call, weth) ? [index] : [],
  );
  if (depositIndexes.length > 1) {
    return deny(2052);
  }
  const depositCall =
    depositIndexes[0] === undefined ? undefined : calls[depositIndexes[0]];
  const depositValue = depositCall?.value ? hexToBigInt(depositCall.value) : 0n;
  if (depositCall && (depositValue === 0n || !sellTokens.has(ethAddress))) {
    return deny(2053);
  }

  let order: OrderData | CancelOrderData | undefined = undefined;

  for (const [index, call] of calls.entries()) {
    // the deposit is checked against the order below
    if (index === depositIndexes[0]) continue;

    const result = await validateSendTransaction([call], ctx);
    if (!result.allowed) {
      return deny(2034);
    }
    if (result.result) {
      if (order) {
        // only 1 order/cancel per call batch
        return deny(2035);
      }
      order = result.result;
    }
  }

  if (!order) {
    return deny(2036);
  }

  if (isCancelOrder(order) && calls.length > 1) {
    // during cancel, no other calls are allowed
    return deny(2037);
  }

  if (depositCall) {
    // the wrapped ETH must be exactly what the order sells
    if (isCancelOrder(order) || !isAddressEqual(order.sellToken, weth)) {
      return deny(2054);
    }
    if (order.sellAmount !== depositValue) {
      return deny(2055);
    }
    const approvals = extractApprovals('wallet_sendCalls', params);
    if (
      approvals.some(
        ({ token, amount }) =>
          isAddressEqual(token, weth) && amount > depositValue,
      )
    ) {
      return deny(2056);
    }
    // checked against the trade snapshot as a native ETH sale
    return { allowed: true, result: { ...order, sellToken: ethAddress } };
  }

  return { allowed: true, result: order };
};
