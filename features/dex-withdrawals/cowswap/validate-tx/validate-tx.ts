import {
  BLOCKED_RPC_METHODS,
  BLOCKED_RPC_NAMESPACES,
  COWSWAP_WIDGET_ALLOWED_RPC_METHODS,
} from '../consts';
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

  // Level 1: block dangerous RPC methods
  if (BLOCKED_RPC_METHODS.has(method)) {
    throw new Error(`RPC method "${method}" is not allowed`);
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
  //  that don't pass namespace filter and are not explicitly allowed
  if (
    BLOCKED_RPC_NAMESPACES.test(method) &&
    !COWSWAP_WIDGET_ALLOWED_RPC_METHODS.has(method)
  ) {
    console.warn(
      `[DEX Provider] RPC method "${method}" blocked by namespace filter`,
    );
    throw new Error(`RPC method "${method}" is not allowed`);
  }

  return {
    order,
    sanitizedRequest,
  };
};
