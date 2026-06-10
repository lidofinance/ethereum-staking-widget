import { mainnet, sepolia } from 'viem/chains';
import { COWSWAP_WIDGET_ALLOWED_RPC_METHODS } from '../consts';
import { OrderData, ValidationContext, jsonRpcRequestSchema } from './utils';
import {
  validateSendCalls,
  validateSendTransaction,
} from './validate-tx-signing';
import { validateSignTypedData } from './validate-typed-message';

export const validateTx = async (request: unknown, ctx: ValidationContext) => {
  let order: OrderData | undefined = undefined;

  const {
    data: sanitizedRequest,
    success,
    error,
  } = jsonRpcRequestSchema.safeParse(request);

  if (!success) {
    throw new Error(`Invalid JSON-RPC request, error: ${error.message}`);
  }

  const { method, params } = sanitizedRequest;

  if (
    [
      'eth_signTypedData_v4',
      'eth_sendTransaction',
      'wallet_sendCalls',
    ].includes(method) &&
    ctx.chainId !== mainnet.id &&
    ctx.chainId !== sepolia.id
  ) {
    throw new Error(`Signing is not allowed on chainId ${ctx.chainId}`);
  }

  switch (method) {
    case 'eth_signTypedData_v4': {
      // Defense-in-depth: verify CowSwap order before signing
      // !NB: this validation modifies the params to override the wstETH permit deadline
      const { allowed, result, reason } = await validateSignTypedData(
        params,
        ctx,
      );

      if (!allowed) {
        console.warn('[DEX Provider] Signing Typed Data blocked:', reason);
        throw new Error(reason);
      }
      if (result) {
        order = result;
      }
      break;
    }
    case 'eth_sendTransaction': {
      const result = await validateSendTransaction(params, ctx);
      if (!result.allowed) {
        console.warn('[DEX Provider] Transaction blocked:', result.reason);
        throw new Error(result.reason);
      }
      if (result.result) {
        order = result.result;
      }
      break;
    }
    case 'wallet_sendCalls': {
      const result = await validateSendCalls(params, ctx);
      if (!result.allowed) {
        console.warn('[DEX Provider] Batch call blocked:', result.reason);
        throw new Error(result.reason);
      }
      if (result.result) {
        order = result.result;
      }
      break;
    }
  }
  // Last line of defense, against unexpected RPC methods
  if (!COWSWAP_WIDGET_ALLOWED_RPC_METHODS.has(method)) {
    console.warn(`[DEX Provider] RPC method "${method}" blocked`);
    throw new Error(`RPC method "${method}" is not allowed`);
  }

  return {
    order,
    sanitizedRequest,
  };
};
