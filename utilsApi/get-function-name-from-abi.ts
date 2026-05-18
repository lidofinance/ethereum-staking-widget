import { type Abi, toFunctionSelector } from 'viem';

/** Resolves a 4-byte selector to its function name; null if not in ABI. */
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
