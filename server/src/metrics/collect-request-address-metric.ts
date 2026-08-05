import type { Counter } from 'prom-client';
import { getAddress } from 'viem';

import {
  METRIC_CONTRACT_ADDRESSES,
  getMetricContractAbi,
  type MetricContractName,
} from 'config/networks/rpc-contracts';
import { getFunctionNameFromAbi } from 'utils/get-function-name-from-abi';

const UNKNOWN_LABEL = 'unknown';

/**
 * Port of `utilsApi/collect-request-address-metric.ts` — increments the
 * `eth_call_address_to` Counter per batch entry with ABI-decoded function
 * names (the PoC port dropped this; dashboards are keyed on these labels).
 *
 * Labels bounded: `address` / `methodEncoded` are kept raw only for
 * allow-listed contracts; for unknown contracts both collapse to
 * `UNKNOWN_LABEL` so prom-client's in-memory label store stays bounded
 * regardless of incoming traffic shape.
 *
 * Per-call try/catch isolates each entry: a malformed call cannot drop
 * metrics for siblings in the same batch.
 */
export const collectRequestAddressMetric = ({
  calls,
  chainId,
  metrics,
}: {
  calls: unknown[];
  chainId: number;
  metrics: Counter<string>;
}): void => {
  calls.forEach((rawCall) => {
    try {
      const call = rawCall as {
        method?: unknown;
        params?: Array<{ to?: unknown; data?: unknown }>;
      };
      if (
        !call ||
        typeof call !== 'object' ||
        call.method !== 'eth_call' ||
        !call.params?.[0]?.to
      ) {
        return;
      }

      const { to, data } = call.params[0];
      const address = getAddress(to as string);
      const contractName = (
        METRIC_CONTRACT_ADDRESSES as unknown as Record<
          number,
          Record<string, MetricContractName>
        >
      )[chainId]?.[address];
      const methodEncoded =
        typeof data === 'string' ? data.slice(0, 10) : undefined;

      let methodDecoded: string = UNKNOWN_LABEL;
      if (!methodEncoded || methodEncoded.length !== 10) {
        console.warn(`Invalid methodEncoded: ${methodEncoded}`);
      } else if (contractName) {
        const abi = getMetricContractAbi(contractName);
        if (!abi) {
          console.warn(`ABI not found for contract: ${contractName}`);
        } else {
          const functionName = getFunctionNameFromAbi(abi, methodEncoded);
          methodDecoded = functionName || UNKNOWN_LABEL;
        }
      }

      metrics
        .labels({
          address: contractName ? address : UNKNOWN_LABEL,
          contractName: contractName || UNKNOWN_LABEL,
          // raw selector only when it decodes to a known ABI function —
          // otherwise attacker-varied selectors on an allowlisted contract
          // grow the label set without bound
          methodEncoded:
            methodDecoded !== UNKNOWN_LABEL && methodEncoded
              ? methodEncoded
              : UNKNOWN_LABEL,
          methodDecoded: methodDecoded || UNKNOWN_LABEL,
        })
        .inc(1);
    } catch (error) {
      console.warn(
        `[collectRequestAddressMetric] skipping malformed call: ${error}`,
      );
    }
  });
};
