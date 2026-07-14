import type { ComponentProps, FC } from 'react';

import { ReactComponent as AaveIcon } from 'assets/earn/allocation/token/aave.svg';
import { ReactComponent as AusdIcon } from 'assets/earn/allocation/token/ausd.svg';
import { ReactComponent as BtcIcon } from 'assets/earn/allocation/token/btc.svg';
import { ReactComponent as CapIcon } from 'assets/earn/allocation/token/cap.svg';
import { ReactComponent as DotIcon } from 'assets/earn/allocation/token/dot.svg';
import { ReactComponent as DvstethIcon } from 'assets/earn/allocation/token/dvsteth.svg';
import { ReactComponent as EarnethIcon } from 'assets/earn/allocation/token/earneth.svg';
import { ReactComponent as EarnusdIcon } from 'assets/earn/allocation/token/earnusd.svg';
import { ReactComponent as EthIcon } from 'assets/earn/allocation/token/eth.svg';
import { ReactComponent as FlexIcon } from 'assets/earn/allocation/token/flex.svg';
import { ReactComponent as FrxusdIcon } from 'assets/earn/allocation/token/frxusd.svg';
import { ReactComponent as GgIcon } from 'assets/earn/allocation/token/gg.svg';
import { ReactComponent as HumaIcon } from 'assets/earn/allocation/token/huma.svg';
import { ReactComponent as IporIcon } from 'assets/earn/allocation/token/ipor.svg';
import { ReactComponent as LdoIcon } from 'assets/earn/allocation/token/ldo.svg';
import { ReactComponent as LlethIcon } from 'assets/earn/allocation/token/lleth.svg';
import { ReactComponent as MellowPointsIcon } from 'assets/earn/allocation/token/mellow-points.svg';
import { ReactComponent as MorphoIcon } from 'assets/earn/allocation/token/morpho.svg';
import { ReactComponent as MsusdIcon } from 'assets/earn/allocation/token/msusd.svg';
import { ReactComponent as ObolIcon } from 'assets/earn/allocation/token/obol.svg';
import { ReactComponent as PyusdIcon } from 'assets/earn/allocation/token/pyusd.svg';
import { ReactComponent as RsethIcon } from 'assets/earn/allocation/token/rseth.svg';
import { ReactComponent as SpusdgIcon } from 'assets/earn/allocation/token/spusdg.svg';
import { ReactComponent as SsvIcon } from 'assets/earn/allocation/token/ssv.svg';
import { ReactComponent as StethIcon } from 'assets/earn/allocation/token/steth.svg';
import { ReactComponent as StrethIcon } from 'assets/earn/allocation/token/streth.svg';
import { ReactComponent as SyrupUsdgIcon } from 'assets/earn/allocation/token/syrup-usdg.svg';
import { ReactComponent as SyrupUsdtIcon } from 'assets/earn/allocation/token/syrup-usdt.svg';
import { ReactComponent as TbdIcon } from 'assets/earn/allocation/token/tbd.svg';
import { ReactComponent as TreeIcon } from 'assets/earn/allocation/token/tree.svg';
import { ReactComponent as UsdcIcon } from 'assets/earn/allocation/token/usdc.svg';
import { ReactComponent as UsdeIcon } from 'assets/earn/allocation/token/usde.svg';
import { ReactComponent as UsdgIcon } from 'assets/earn/allocation/token/usdg.svg';
import { ReactComponent as UsdmIcon } from 'assets/earn/allocation/token/usdm.svg';
import { ReactComponent as UsdtIcon } from 'assets/earn/allocation/token/usdt.svg';
import { ReactComponent as WethIcon } from 'assets/earn/allocation/token/weth.svg';
import { ReactComponent as WstethIcon } from 'assets/earn/allocation/token/wsteth.svg';
import { ReactComponent as YfiIcon } from 'assets/earn/allocation/token/yfi.svg';

type TokenIcon = FC<ComponentProps<'svg'>>;

const createIconLibrary = <T extends Record<string, TokenIcon>>(icons: T): T =>
  icons;

export const ALLOCATION_TOKEN_ICONS = createIconLibrary({
  aave: AaveIcon,
  ausd: AusdIcon,
  btc: BtcIcon,
  cap: CapIcon,
  dot: DotIcon,
  dvsteth: DvstethIcon,
  earneth: EarnethIcon,
  earnusd: EarnusdIcon,
  eth: EthIcon,
  flex: FlexIcon,
  frxusd: FrxusdIcon,
  gg: GgIcon,
  huma: HumaIcon,
  ipor: IporIcon,
  ldo: LdoIcon,
  lleth: LlethIcon,
  'mellow-points': MellowPointsIcon,
  morpho: MorphoIcon,
  msusd: MsusdIcon,
  obol: ObolIcon,
  pyusd: PyusdIcon,
  rseth: RsethIcon,
  spusdg: SpusdgIcon,
  ssv: SsvIcon,
  steth: StethIcon,
  streth: StrethIcon,
  'syrup-usdg': SyrupUsdgIcon,
  'syrup-usdt': SyrupUsdtIcon,
  tree: TreeIcon,
  usdc: UsdcIcon,
  usde: UsdeIcon,
  usdg: UsdgIcon,
  usdm: UsdmIcon,
  usdt: UsdtIcon,
  weth: WethIcon,
  wsteth: WstethIcon,
  yfi: YfiIcon,
});

export const getAllocationTokenIcon = (token?: string): TokenIcon => {
  const key = token?.trim().toLowerCase();
  return (
    (key
      ? ALLOCATION_TOKEN_ICONS[key as keyof typeof ALLOCATION_TOKEN_ICONS]
      : undefined) ?? TbdIcon
  );
};
