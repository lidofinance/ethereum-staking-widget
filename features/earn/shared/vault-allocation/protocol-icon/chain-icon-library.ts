import type { ComponentProps, FC } from 'react';

import { ReactComponent as ArbitrumIcon } from 'assets/earn/allocation/chain/arbitrum.svg';
import { ReactComponent as AvalancheIcon } from 'assets/earn/allocation/chain/avalanche.svg';
import { ReactComponent as BaseIcon } from 'assets/earn/allocation/chain/base.svg';
import { ReactComponent as EthereumIcon } from 'assets/earn/allocation/chain/ethereum.svg';
import { ReactComponent as MantleIcon } from 'assets/earn/allocation/chain/mantle.svg';
import { ReactComponent as MegaEthIcon } from 'assets/earn/allocation/chain/mega-eth.svg';
import { ReactComponent as MonadIcon } from 'assets/earn/allocation/chain/monad.svg';
import { ReactComponent as OptimismIcon } from 'assets/earn/allocation/chain/optimism.svg';
import { ReactComponent as PlasmaIcon } from 'assets/earn/allocation/chain/plasma.svg';
import { ReactComponent as RobinhoodIcon } from 'assets/earn/allocation/chain/robinhood.svg';
import { ReactComponent as FallbackIcon } from 'assets/earn/allocation/chain/fallback.svg';

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
    (key
      ? ALLOCATION_CHAIN_ICONS[key as keyof typeof ALLOCATION_CHAIN_ICONS]
      : undefined) ?? FallbackIcon
  );
};
