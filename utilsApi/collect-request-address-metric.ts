import type { Counter } from 'prom-client';
import { getAddress } from 'viem';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import {
  METRIC_CONTRACT_ADDRESSES,
  getMetricContractAbi,
} from './contractAddressesMetricsMap';
import { getFunctionNameFromAbi } from './get-function-name-from-abi';

const UNKNOWN_LABEL = 'unknown';
const ADDRESS_LENGTH = 42; // '0x' + 40 hex chars
const LOG_ERROR_MAX_LENGTH = 200;

// Parser errors can quote their whole input, so keep log lines bounded.
const shortError = (error: unknown) => {
  const text =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return text.length > LOG_ERROR_MAX_LENGTH
    ? `${text.slice(0, LOG_ERROR_MAX_LENGTH)}…`
    : text;
};

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
  chainId,
  metrics,
}: {
  calls: any[];
  chainId: CHAINS;
  metrics: Counter<string>;
}) => {
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
      // Metrics collection is independent of the route's own checks, so verify
      // the shape here rather than assuming a well-formed address.
      if (typeof to !== 'string' || to.length !== ADDRESS_LENGTH) return;
      const address = getAddress(to);
      const contractName = METRIC_CONTRACT_ADDRESSES?.[chainId]?.[address];
      const methodEncoded = data?.slice(0, 10); // `0x` and 8 next symbols

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
          methodEncoded: contractName
            ? methodEncoded || UNKNOWN_LABEL
            : UNKNOWN_LABEL,
          methodDecoded: methodDecoded || UNKNOWN_LABEL,
        })
        .inc(1);
    } catch (error) {
      console.warn(
        `[collectRequestAddressMetric] skipping malformed call: ${shortError(
          error,
        )}`,
      );
    }
  });
};
