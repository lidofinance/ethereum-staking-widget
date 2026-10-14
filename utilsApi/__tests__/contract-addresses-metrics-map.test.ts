import { describe, expect, it } from 'vitest';

import { CHAINS } from 'consts/chains';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import {
  METRIC_CONTRACT_ADDRESSES,
  getMetricContractAbi,
} from '../contractAddressesMetricsMap';

describe('METRIC_CONTRACT_ABIS', () => {
  it('has an ABI for every contract name', () => {
    const missing = Object.values(CONTRACT_NAMES).filter(
      (name) => !getMetricContractAbi(name),
    );

    expect(missing).toEqual([]);
  });
});

describe('GasPriceOracle predeploy', () => {
  const ORACLE = '0x420000000000000000000000000000000000000F';

  it.each([
    CHAINS.Optimism,
    CHAINS.OptimismSepolia,
    CHAINS.Base,
    CHAINS.Unichain,
    CHAINS.UnichainSepolia,
  ])('is configured on OP-stack chain %s', (chainId) => {
    expect(getContractAddress(chainId, CONTRACT_NAMES.L2GasPriceOracle)).toBe(
      ORACLE,
    );
  });

  // the proxy only lets eth_call through to the mapped addresses, so the L1
  // data fee quote depends on the predeploy being mapped wherever configured
  it('is allowed for eth_call on every supported chain that configures it', () => {
    for (const [chainId, addresses] of Object.entries(
      METRIC_CONTRACT_ADDRESSES,
    )) {
      const oracle = getContractAddress(
        Number(chainId),
        CONTRACT_NAMES.L2GasPriceOracle,
      );
      if (oracle) {
        expect(addresses[oracle]).toBe(CONTRACT_NAMES.L2GasPriceOracle);
      }
    }
  });
});
