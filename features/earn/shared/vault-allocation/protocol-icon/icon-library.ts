import type { ComponentProps, FC } from 'react';

import { ReactComponent as AaveIcon } from 'assets/earn/allocation/protocol/aave.svg';
import { ReactComponent as AuraIcon } from 'assets/earn/allocation/protocol/aura.svg';
import { ReactComponent as AxisIcon } from 'assets/earn/allocation/protocol/axis.svg';
import { ReactComponent as BalancerIcon } from 'assets/earn/allocation/protocol/balancer.svg';
import { ReactComponent as CapIcon } from 'assets/earn/allocation/protocol/cap.svg';
import { ReactComponent as EthenaIcon } from 'assets/earn/allocation/protocol/ethena.svg';
import { ReactComponent as EtherFiIcon } from 'assets/earn/allocation/protocol/ether-fi.svg';
import { ReactComponent as FluidIcon } from 'assets/earn/allocation/protocol/fluid.svg';
import { ReactComponent as KelpIcon } from 'assets/earn/allocation/protocol/kelp.svg';
import { ReactComponent as MapleIcon } from 'assets/earn/allocation/protocol/maple.svg';
import { ReactComponent as MellowIcon } from 'assets/earn/allocation/protocol/mellow.svg';
import { ReactComponent as MorphoIcon } from 'assets/earn/allocation/protocol/morpho.svg';
import { ReactComponent as PendleIcon } from 'assets/earn/allocation/protocol/pendle-light.svg';
import { ReactComponent as ResolvIcon } from 'assets/earn/allocation/protocol/resolv.svg';
import { ReactComponent as SparkIcon } from 'assets/earn/allocation/protocol/spark.svg';
import { ReactComponent as StrataIcon } from 'assets/earn/allocation/protocol/strata.svg';
import { ReactComponent as FallbackIcon } from 'assets/earn/allocation/protocol/fallback.svg';
import { ReactComponent as TenorIcon } from 'assets/earn/allocation/protocol/tenor.svg';
import { ReactComponent as TreehouseIcon } from 'assets/earn/allocation/protocol/treehouse.svg';
import { ReactComponent as TwyneIcon } from 'assets/earn/allocation/protocol/twyne.svg';
import { ReactComponent as UniswapIcon } from 'assets/earn/allocation/protocol/uniswap.svg';
import { ReactComponent as VedaIcon } from 'assets/earn/allocation/protocol/veda.svg';
import { ReactComponent as WstethIcon } from 'assets/earn/allocation/token/wsteth.svg';

export type AllocationIcon = FC<ComponentProps<'svg'>>;

const createIconLibrary = <T extends Record<string, AllocationIcon>>(
  icons: T,
): T => icons;

// Keys match the `protocol` field returned by the Mellow allocation API.
export const ALLOCATION_PROTOCOL_ICONS = createIconLibrary({
  aave: AaveIcon,
  aura: AuraIcon,
  axis: AxisIcon,
  balancer: BalancerIcon,
  cap: CapIcon,
  ethena: EthenaIcon,
  'ether-fi': EtherFiIcon,
  etherfi: EtherFiIcon,
  fluid: FluidIcon,
  kelp: KelpIcon,
  lido: WstethIcon,
  maple: MapleIcon,
  mellow: MellowIcon,
  'mellow-core-vault': MellowIcon,
  'mellow-dvv': MellowIcon,
  morpho: MorphoIcon,
  pendle: PendleIcon,
  resolv: ResolvIcon,
  spark: SparkIcon,
  strata: StrataIcon,
  tenor: TenorIcon,
  treehouse: TreehouseIcon,
  twyne: TwyneIcon,
  uniswap: UniswapIcon,
  veda: VedaIcon,
});

export const getAllocationProtocolIcon = (
  protocol?: string,
): AllocationIcon => {
  const key = protocol?.trim().toLowerCase();
  return (
    (key
      ? ALLOCATION_PROTOCOL_ICONS[key as keyof typeof ALLOCATION_PROTOCOL_ICONS]
      : undefined) ?? FallbackIcon
  );
};
