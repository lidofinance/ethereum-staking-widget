import type { Counter } from 'prom-client';
import { getAddress } from 'viem';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import {
  METRIC_CONTRACT_ADDRESSES,
  getMetricContractAbi,
  MetricContractName,
} from './contractAddressesMetricsMap';
import { categorizeReferer, UNKNOWN_LABEL } from './categorize-referer';
import { getFunctionNameFromAbi } from './get-function-name-from-abi';

/**
 * Increment the eth_call address Counter for each call in a JSON-RPC batch.
 *
 * Labels are bounded:
 * - `address` / `methodEncoded` are kept RAW only when the contract is in
 *   `METRIC_CONTRACT_ADDRESSES` (then cardinality is bounded by allow-list ×
 *   known function selectors). For unknown contracts both collapse to
 *   `UNKNOWN_LABEL` — attackers can't blow up prom-client's in-memory store by
 *   padding arbitrary `to` / 4-byte selectors. Recover raw values during
 *   forensic investigation of an `'unknown'` spike from nginx access logs.
 * - `referer` is mapped through `categorizeReferer` to a small allow-listed
 *   keyspace.
 *
 * Per-call isolation: a malformed entry in a batch (e.g. invalid `to` that
 * makes `getAddress` throw) does NOT abort metric collection for the
 * following legitimate calls. Without this, a single bad entry would silently
 * drop metrics for the rest of the batch.
 *
 * Lives in its own file so unit tests can import it without pulling in the
 * `utilsApi` index re-export chain (which transitively imports project `.mjs`
 * ESM files that Jest can't parse without extra config).
 */
export const collectRequestAddressMetric = async ({
  calls,
  referer,
  chainId,
  metrics,
}: {
  calls: any[];
  referer: string | undefined;
  chainId: CHAINS;
  metrics: Counter<string>;
}) => {
  const refererLabel = categorizeReferer(referer);
  calls.forEach((call: any) => {
    try {
      if (
        !call ||
        typeof call !== 'object' ||
        call.method !== 'eth_call' ||
        !call.params?.[0]?.to
      ) {
        return;
      }

      const { to, data } = call.params[0];
      const address = getAddress(to);
      const contractName = METRIC_CONTRACT_ADDRESSES?.[chainId]?.[address];
      const methodEncoded = data?.slice(0, 10); // `0x` and 8 next symbols

      let methodDecoded: string = UNKNOWN_LABEL;
      if (!methodEncoded || methodEncoded.length !== 10) {
        console.warn(`Invalid methodEncoded: ${methodEncoded}`);
      } else if (contractName) {
        const abi = getMetricContractAbi(contractName as MetricContractName);
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
          methodEncoded: contractName
            ? methodEncoded || UNKNOWN_LABEL
            : UNKNOWN_LABEL,
          methodDecoded: methodDecoded || UNKNOWN_LABEL,
          referer: refererLabel,
        })
        .inc(1);
    } catch (error) {
      console.warn(
        `[collectRequestAddressMetric] skipping malformed call: ${error}`,
      );
    }
  });
};
