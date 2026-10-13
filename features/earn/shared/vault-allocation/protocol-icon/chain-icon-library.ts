import type { ComponentProps, FC } from 'react';

import { getOwnProperty } from 'utils/get-own-property';

import ArbitrumIcon from 'assets/earn/allocation/chain/arbitrum.svg?react';
import AvalancheIcon from 'assets/earn/allocation/chain/avalanche.svg?react';
import BaseIcon from 'assets/earn/allocation/chain/base.svg?react';
import EthereumIcon from 'assets/earn/allocation/chain/ethereum.svg?react';
import MantleIcon from 'assets/earn/allocation/chain/mantle.svg?react';
import MegaEthIcon from 'assets/earn/allocation/chain/mega-eth.svg?react';
import MonadIcon from 'assets/earn/allocation/chain/monad.svg?react';
import OptimismIcon from 'assets/earn/allocation/chain/optimism.svg?react';
import PlasmaIcon from 'assets/earn/allocation/chain/plasma.svg?react';
import RobinhoodIcon from 'assets/earn/allocation/chain/robinhood.svg?react';
import FallbackIcon from 'assets/earn/allocation/chain/fallback.svg?react';

type ChainIcon = FC<ComponentProps<'svg'>>;

const createIconLibrary = <T extends Record<string, ChainIcon>>(icons: T): T =>
  icons;

// Keys match the `chain` field returned by the Mellow allocation API.
export const ALLOCATION_CHAIN_ICONS = createIconLibrary({
  arbitrum: ArbitrumIcon,
  avalanche: AvalancheIcon,
  base: BaseIcon,
  ethereum: EthereumIcon,
  mantle: MantleIcon,
  'mega-eth': MegaEthIcon,
  megaeth: MegaEthIcon,
  monad: MonadIcon,
  optimism: OptimismIcon,
  plasma: PlasmaIcon,
  robinhood: RobinhoodIcon,
});

export const getAllocationChainIcon = (chain?: string): ChainIcon => {
  const key = chain?.trim().toLowerCase();
  return (
    (key ? getOwnProperty(ALLOCATION_CHAIN_ICONS, key) : undefined) ??
    FallbackIcon
  );
};
