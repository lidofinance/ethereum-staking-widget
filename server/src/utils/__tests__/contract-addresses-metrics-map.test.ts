import { describe, expect, it } from 'vitest';
import { mainnet } from 'viem/chains';

import { CHAINS } from 'consts/chains';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import {
  CHAINLINK_FEEDS,
  WSTETH_ADDRESS,
} from 'modules/dexes/cowswap/guards/oracles/feeds';
// develop's utilsApi/contractAddressesMetricsMap lives in config/networks/rpc-contracts here;
// the CoW profile coverage case needs the React cowswap barrel, so it runs in the root suite
import {
  getMetricContractAbi,
  METRIC_CONTRACT_ADDRESSES,
} from 'config/networks/rpc-contracts';

describe('METRIC_CONTRACT_ABIS', () => {
  it('has an ABI for every contract name', () => {
    const missing = Object.values(CONTRACT_NAMES).filter(
      (name) => !getMetricContractAbi(name),
    );

    expect(missing).toEqual([]);
  });
});

describe('METRIC_CONTRACT_ADDRESSES', () => {
  // /api/rpc allows eth_call only to these addresses
  const allowed = new Set(
    Object.keys(METRIC_CONTRACT_ADDRESSES[mainnet.id]).map((address) =>
      address.toLowerCase(),
    ),
  );

  it('allows eth_call to every CoW Swap oracle feed', () => {
    const missing = [
      ...Object.values(CHAINLINK_FEEDS).map(({ address }) => address),
      WSTETH_ADDRESS,
    ].filter((address) => !allowed.has(address.toLowerCase()));

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
