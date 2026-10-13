import { describe, expect, it } from 'vitest';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
// ported from develop's utilsApi/contractAddressesMetricsMap — the map
// lives in config/networks/rpc-contracts on this branch
import { getMetricContractAbi } from 'config/networks/rpc-contracts';

describe('METRIC_CONTRACT_ABIS', () => {
  it('has an ABI for every contract name', () => {
    const missing = Object.values(CONTRACT_NAMES).filter(
      (name) => !getMetricContractAbi(name),
    );

    expect(missing).toEqual([]);
  });
});
