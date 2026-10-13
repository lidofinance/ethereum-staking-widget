import type { CHAIN_ID } from 'consts/chains';

export type RpcUrls = Partial<Record<CHAIN_ID, string>>;

/**
 * Returns the map with one chain's custom RPC replaced (or removed when
 * `rpcUrl` is empty), leaving every other chain's entry untouched.
 */
export const assignRpcUrl = (
  rpcUrls: RpcUrls,
  chainId: CHAIN_ID,
  rpcUrl?: string,
): RpcUrls => {
  const { [chainId]: _current, ...otherRpcUrls } = rpcUrls;
  return rpcUrl ? { ...otherRpcUrls, [chainId]: rpcUrl } : otherRpcUrls;
};
