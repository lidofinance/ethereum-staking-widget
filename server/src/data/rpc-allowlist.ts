import {
  METRIC_CONTRACT_ADDRESSES,
  METRIC_CONTRACT_EVENT_ADDRESSES,
} from 'config/networks/rpc-contracts';

/**
 * RPC allowlists — derived from the SAME `getContractAddress()` map the
 * frontend uses (`config/networks/rpc-contracts.ts`), exactly like the
 * legacy `pages/api/rpc.ts` did:
 *
 * - allowedCall = every contract known on the chain (incl. L2 stETH/wstETH
 *   from the SDK's LIDO_L2_CONTRACT_ADDRESSES — the previous PoC port read
 *   only 4 `networks/*.json` files and silently broke `eth_call` on L2s)
 * - allowedLogs = subset that emits events (CONTRACTS_WITH_EVENTS incl.
 *   `usde`, which the PoC port dropped)
 *
 * Chains covered = SUPPORTED_CHAINS (+ Mainnet), same env the frontend
 * reads. Addresses lowercase-normalized: `eth_call.to` / `eth_getLogs
 * .address` may come in any casing.
 */
interface ChainAllowlists {
  call: Set<string>;
  logs: Set<string>;
}

const toSets = (
  source: Record<number, Record<string, string>>,
): Record<number, Set<string>> => {
  const out: Record<number, Set<string>> = {};
  for (const [chainId, addresses] of Object.entries(source)) {
    out[Number(chainId)] = new Set(
      Object.keys(addresses).map((a) => a.toLowerCase()),
    );
  }
  return out;
};

const callSets = toSets(METRIC_CONTRACT_ADDRESSES);
const logsSets = toSets(METRIC_CONTRACT_EVENT_ADDRESSES);

export const allowlists: Record<number, ChainAllowlists> = {};
for (const chainId of Object.keys(callSets)) {
  allowlists[Number(chainId)] = {
    call: callSets[Number(chainId)] ?? new Set(),
    logs: logsSets[Number(chainId)] ?? new Set(),
  };
}

export const isAllowedCallAddress = (
  chainId: number,
  address: string,
): boolean => {
  return allowlists[chainId]?.call.has(address.toLowerCase()) ?? false;
};

export const isAllowedLogsAddress = (
  chainId: number,
  address: string,
): boolean => {
  return allowlists[chainId]?.logs.has(address.toLowerCase()) ?? false;
};
