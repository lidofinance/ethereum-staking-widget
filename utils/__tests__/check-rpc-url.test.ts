import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import { getContractAddress } from 'config/networks/contract-address';

import {
  RPCErrorType,
  checkRpcUrl,
  getRpcCheckAddress,
} from '../check-rpc-url';

describe('getRpcCheckAddress', () => {
  it('probes stETH on an L1 chain', () => {
    expect(getRpcCheckAddress(CHAINS.Mainnet)).toBe(
      getContractAddress(CHAINS.Mainnet, 'lido'),
    );
    expect(getRpcCheckAddress(CHAINS.Mainnet)).toBeDefined();
  });

  it('probes the rebasing stETH on an L2 that deploys it', () => {
    expect(getRpcCheckAddress(CHAINS.Optimism)).toBe(
      LIDO_L2_CONTRACT_ADDRESSES[CHAINS.Optimism]?.steth,
    );
  });

  // Base, Linea and Arbitrum carry only the bridged wstETH; without this
  // fallback the settings form rejects every custom RPC URL for them
  it.each([CHAINS.Base, CHAINS.Linea, CHAINS.Arbitrum])(
    'probes the bridged wstETH on chain %i',
    (chainId) => {
      const expected = LIDO_L2_CONTRACT_ADDRESSES[chainId]?.wsteth;
      expect(expected).toBeDefined();
      expect(getRpcCheckAddress(chainId)).toBe(expected);
    },
  );
});

describe('checkRpcUrl', () => {
  it('rejects a chain without a probe address before touching the network', async () => {
    await expect(
      checkRpcUrl('https://rpc.example', CHAINS.Base, undefined),
    ).resolves.toBe(RPCErrorType.URL_IS_NOT_VALID);
  });

  it('rejects a malformed url before touching the network', async () => {
    await expect(
      checkRpcUrl('not a url', CHAINS.Base, getRpcCheckAddress(CHAINS.Base)),
    ).resolves.toBe(RPCErrorType.URL_IS_NOT_VALID);
  });
});
