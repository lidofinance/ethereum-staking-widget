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
 * Increments the eth_call Counter per batch entry. Labels bounded:
 * `address` / `methodEncoded` are kept raw only for allow-listed contracts;
 * for unknown contracts both collapse to `UNKNOWN_LABEL` so prom-client's
 * in-memory label store stays bounded regardless of incoming traffic shape.
 *
 * Per-call try/catch isolates each entry: a malformed call cannot drop
 * metrics for siblings in the same batch.
 *
 * Separate file: lets tests import without pulling in `utilsApi`'s ESM chain.
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
