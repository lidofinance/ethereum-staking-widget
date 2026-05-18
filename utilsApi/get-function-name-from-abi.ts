import { type Abi, toFunctionSelector } from 'viem';

/**
 * Resolve a 4-byte function selector to its function name by walking an ABI.
 * Returns `null` when no function in the ABI matches the selector.
 */
export const getFunctionNameFromAbi = (
  abi: Abi,
  methodEncoded: string,
): string | null => {
  for (const item of abi) {
    if (item.type === 'function') {
      const selector = toFunctionSelector(
        `${item.name}(${item.inputs.map((i: any) => i.type).join(',')})`,
      );
      if (selector === methodEncoded) {
        return item.name;
      }
    }
  }
  return null;
};
