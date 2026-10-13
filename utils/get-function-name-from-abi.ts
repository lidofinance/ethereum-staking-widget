import { type Abi, toFunctionSelector } from 'viem';

/**
 * Resolves a 4-byte selector to its function name; null if not in ABI.
 * Framework-neutral (moved from `utilsApi/` so the api server can import
 * it — used to label the `eth_call_address_to` metric).
 */
export const getFunctionNameFromAbi = (
  abi: Abi,
  methodEncoded: string,
): string | null => {
  for (const item of abi) {
    if (
      item.type === 'function' &&
      toFunctionSelector(item) === methodEncoded
    ) {
      return item.name;
    }
  }
  return null;
};
