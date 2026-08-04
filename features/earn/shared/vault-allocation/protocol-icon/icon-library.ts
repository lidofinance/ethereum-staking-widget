import type { ComponentProps, FC } from 'react';

import { getOwnProperty } from 'utils/get-own-property';

import WstethIcon from 'assets/earn/allocation/protocol/lido.svg?react';
import EarnusdIcon from 'assets/earn/allocation/protocol/earnusd.svg?react';
import AaveIcon from 'assets/earn/allocation/protocol/aave.svg?react';
import AuraIcon from 'assets/earn/allocation/protocol/aura.svg?react';
import AxisIcon from 'assets/earn/allocation/protocol/axis.svg?react';
import BalancerIcon from 'assets/earn/allocation/protocol/balancer.svg?react';
import CapIcon from 'assets/earn/allocation/protocol/cap.svg?react';
import EthenaIcon from 'assets/earn/allocation/protocol/ethena.svg?react';
import EtherFiIcon from 'assets/earn/allocation/protocol/ether-fi.svg?react';
import FluidIcon from 'assets/earn/allocation/protocol/fluid.svg?react';
import KelpIcon from 'assets/earn/allocation/protocol/kelp.svg?react';
import MapleIcon from 'assets/earn/allocation/protocol/maple.svg?react';
import MellowIcon from 'assets/earn/allocation/protocol/mellow.svg?react';
import MorphoIcon from 'assets/earn/allocation/protocol/morpho.svg?react';
import PendleIcon from 'assets/earn/allocation/protocol/pendle-light.svg?react';
import ResolvIcon from 'assets/earn/allocation/protocol/resolv.svg?react';
import SparkIcon from 'assets/earn/allocation/protocol/spark.svg?react';
import StrataIcon from 'assets/earn/allocation/protocol/strata.svg?react';
import FallbackIcon from 'assets/earn/allocation/protocol/fallback.svg?react';
import TenorIcon from 'assets/earn/allocation/protocol/tenor.svg?react';
import TreehouseIcon from 'assets/earn/allocation/protocol/treehouse.svg?react';
import TwyneIcon from 'assets/earn/allocation/protocol/twyne.svg?react';
import UniswapIcon from 'assets/earn/allocation/protocol/uniswap.svg?react';
import VedaIcon from 'assets/earn/allocation/protocol/veda.svg?react';
import NethermindIcon from 'assets/earn/allocation/protocol/nethermind.svg?react';

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
  'mellow-earnusd': EarnusdIcon,
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
  nethermind: NethermindIcon,
});

export const getAllocationProtocolIcon = (
  protocol?: string,
  id?: string,
): AllocationIcon => {
  const key = protocol?.trim().toLowerCase();
  const normalizedId = id?.trim().toLowerCase();

  if (key === 'mellow-core-vault' && normalizedId === 'earnusd') {
    return EarnusdIcon;
  }

  return (
    (key ? getOwnProperty(ALLOCATION_PROTOCOL_ICONS, key) : undefined) ??
    FallbackIcon
  );
};
