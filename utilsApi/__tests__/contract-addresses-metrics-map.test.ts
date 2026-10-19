import { describe, expect, it } from 'vitest';
import { ethAddress } from 'viem';
import { mainnet } from 'viem/chains';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { WITHDRAWALS_COWSWAP_PROFILE } from 'features/dex-withdrawals/cowswap';
import { SWAP_COWSWAP_PROFILE } from 'features/swap/cowswap';
import {
  CHAINLINK_FEEDS,
  WSTETH_ADDRESS,
} from 'shared/dexes/cowswap/guards/oracles/feeds';

import {
  getMetricContractAbi,
  METRIC_CONTRACT_ADDRESSES,
} from '../contractAddressesMetricsMap';

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

  it.each([
    ['withdrawals', WITHDRAWALS_COWSWAP_PROFILE],
    ['swap', SWAP_COWSWAP_PROFILE],
  ])('allows eth_call to every %s CoW Swap token', (_, profile) => {
    const missing = [...profile.getNetworkTxConfig(mainnet.id).tokens].filter(
      (address) => address !== ethAddress && !allowed.has(address),
    );

    expect(missing).toEqual([]);
  });
});
