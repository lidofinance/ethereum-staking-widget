import {
  decodeFunctionData,
  ethAddress,
  isAddressEqual,
  Address,
  Hex,
  maxUint32,
} from 'viem';

import { CowEthFlowAbi } from '../../../abi';

import { deny } from './deny';
import { validateCowSwapOrderMessage } from './validate-typed-message';
import { calculateOrderUID, hashCowswapOrder } from './order';
import type {
  CancelOrderData,
  OrderData,
  ValidationContext,
  ValidationResult,
} from './types';

// EthFlow sells native ETH: createOrder carries the order and the ETH, invalidateOrder cancels it
export const validateEthFlowCall = async (
  data: Hex,
  value: bigint,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData | CancelOrderData>> => {
  const { cowEthFlow, cowSettlement, weth } = ctx.networkTxConfig;
  if (!cowEthFlow) return deny(2041);

  let decoded;
  try {
    decoded = decodeFunctionData({ abi: CowEthFlowAbi, data });
  } catch {
    return deny(2041);
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
    if (value > 0n) return deny(2042);

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
    return deny(2043);
  }
  if (ethFlowOrder.feeAmount !== 0n) {
    return deny(2044);
  }
  // the contract takes exactly sellAmount + feeAmount
  if (value !== ethFlowOrder.sellAmount) {
    return deny(2045);
  }
  // ETH to WETH is a wrap, not a trade
  if (isAddressEqual(order.buyToken, weth)) {
    return deny(2046);
  }

  // same checks as a signed order: tokens, receiver, validTo, appData
  const messageResult = await validateCowSwapOrderMessage(order, ctx);
  if (!messageResult.allowed) return messageResult;

  return { allowed: true, result: order };
};
