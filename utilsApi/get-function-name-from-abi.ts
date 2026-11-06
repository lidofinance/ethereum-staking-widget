import { type Abi, toFunctionSelector } from 'viem';

// Selector → name, built once per ABI on first use. The metric collector runs
// this for every batch entry of every request before the route admits it, so a
// lookup must not hash the whole ABI again: that made a maximal body of calls
// to the largest contract block the event loop for seconds
const selectorNamesByAbi = new WeakMap<Abi, Map<string, string>>();

const getSelectorNames = (abi: Abi) => {
  let selectorNames = selectorNamesByAbi.get(abi);
  if (!selectorNames) {
    selectorNames = new Map();
    for (const item of abi) {
      if (item.type === 'function') {
        selectorNames.set(toFunctionSelector(item), item.name);
      }
    }
    selectorNamesByAbi.set(abi, selectorNames);
  }
  return selectorNames;
};

/** Resolves a 4-byte selector to its function name; null if not in ABI. */
export const getFunctionNameFromAbi = (
  abi: Abi,
  methodEncoded: string,
): string | null => getSelectorNames(abi).get(methodEncoded) ?? null;
