import { describe, expect, it } from 'vitest';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getMetricContractAbi } from '../contractAddressesMetricsMap';

describe('METRIC_CONTRACT_ABIS', () => {
  it('has an ABI for every contract name', () => {
    const missing = Object.values(CONTRACT_NAMES).filter(
      (name) => !getMetricContractAbi(name),
    );

    expect(missing).toEqual([]);
  });
});
