import {
  decodeFunctionData,
  erc20Abi,
  isAddressEqual,
  Address,
  Hex,
} from 'viem';

import { TRANSACTION_ERROR } from '../consts';

import { sendCallsParamsSchema, sendTransactionParamsSchema } from './schemas';
import type { ApprovalData } from './types';

// WETH.deposit() selector
const WETH_DEPOSIT_SELECTOR = '0xd0e30db0';

export const isWethDeposit = (
  call: { to: Address; data: Hex },
  weth: Address,
) =>
  isAddressEqual(call.to, weth) &&
  call.data.toLowerCase() === WETH_DEPOSIT_SELECTOR;

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
    const [batch] = sendCallsParamsSchema.parse(params);
    // all or nothing: a wrap or approve must not land without its order
    return [{ ...batch, atomicRequired: true }];
  }

  return params;
};

// wallet_sendCalls batch that wraps ETH into the network WETH (Safe ETH sale)
export const hasWethDeposit = (
  method: string,
  params: unknown,
  weth: Address,
): boolean => {
  if (method !== 'wallet_sendCalls') return false;
  const parsed = sendCallsParamsSchema.safeParse(params);
  return (
    parsed.success &&
    parsed.data[0].calls.some((call) => isWethDeposit(call, weth))
  );
};
