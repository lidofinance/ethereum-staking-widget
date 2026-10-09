import { getAddress } from 'viem';
import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';

import { CHAINS } from 'config/chains';
import { LIDO_L2_STAKING_CHAIN_IDS } from 'modules/l2-staking/const';

import optimismSet from 'networks/l2/optimism.json';
import optimismSepoliaSet from 'networks/l2/optimism-sepolia.json';
import unichainSet from 'networks/l2/unichain.json';
import unichainSepoliaSet from 'networks/l2/unichain-sepolia.json';
import baseSet from 'networks/l2/base.json';
import lineaSet from 'networks/l2/linea.json';
import arbitrumSet from 'networks/l2/arbitrum.json';

const L2_SETS: Record<number, { contracts: Record<string, string> }> = {
  [CHAINS.Optimism]: optimismSet,
  [CHAINS.OptimismSepolia]: optimismSepoliaSet,
  [CHAINS.Unichain]: unichainSet,
  [CHAINS.UnichainSepolia]: unichainSepoliaSet,
  [CHAINS.Base]: baseSet,
  [CHAINS.Linea]: lineaSet,
  [CHAINS.Arbitrum]: arbitrumSet,
};

const L2_STAKING_CONTRACTS = [
  'L2wstETH',
  'L2stakingReceiver',
  'L2FastStakeOraclePool',
  'L2FastStakeOracleFeed',
  'weth',
];

describe('networks/l2', () => {
  it.each(Object.entries(L2_SETS))(
    'chain %s has only checksummed addresses',
    (_chainId, { contracts }) => {
      // the RPC metrics lookup compares checksummed addresses
      for (const [name, address] of Object.entries(contracts)) {
        expect(getAddress(address), name).toBe(address);
      }
    },
  );

  it.each(LIDO_L2_STAKING_CHAIN_IDS)(
    'staking chain %s has all staking contracts',
    (chainId) => {
      const { contracts } = L2_SETS[chainId];
      for (const name of L2_STAKING_CONTRACTS) {
        expect(contracts[name], name).toBeDefined();
      }
    },
  );

  // The UI reads the receiver (allowance spender) and wstETH from these
  // files, the transactions use the SDK constants: they must be the same
  // contracts, or the unlock state would disagree with the approval made
  it.each(LIDO_L2_STAKING_CHAIN_IDS)(
    'staking chain %s agrees with the SDK on the receiver and wstETH',
    (chainId) => {
      const { contracts } = L2_SETS[chainId];
      const sdk =
        LIDO_L2_CONTRACT_ADDRESSES[
          chainId as keyof typeof LIDO_L2_CONTRACT_ADDRESSES
        ];
      expect(sdk?.stakeReceiver).toBeDefined();
      expect(contracts.L2stakingReceiver).toBe(
        getAddress(sdk?.stakeReceiver ?? '0x'),
      );
      expect(contracts.L2wstETH).toBe(getAddress(sdk?.wsteth ?? '0x'));
    },
  );
});
