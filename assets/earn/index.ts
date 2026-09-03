import styled, { css } from 'styled-components';

import Partner7SeasIcon from './partner-7seas.svg?react';
import PartnerVedaIcon from './partner-veda.svg?react';
import PartnerSteakhouseIcon from './partner-steakhouse.svg?react';
import PartnerMellowIcon from './partner-mellow.svg?react';
import PartnerRuntimeLabsIcon from './partner-runtime-labs.svg?react';
import PartnerRuntimeLabsIconInverted from './partner-runtime-labs-inverted.svg?react';

import TokenEthIcon from './token-eth.svg?react';
import TokenEthScalableIcon from './token-eth-scalable.svg?react';
import TokenEthIcon32 from './token-eth-32.svg?react';
import TokenStethIcon from './token-steth.svg?react';
import TokenStethScalableIcon from './token-steth-scalable.svg?react';
import TokenWethIcon from './token-weth.svg?react';
import TokenWethScalableIcon from './token-weth-scalable.svg?react';
import TokenWethIcon32 from './token-weth-32.svg?react';
import TokenWstethIcon from './token-wsteth.svg?react';
import TokenWstethScalableIcon from './token-wsteth-scalable.svg?react';
import TokenWstethIcon32 from './token-wsteth-32.svg?react';
import TokenGGIcon from './token-gg.svg?react';
import TokenDvstethIcon from './token-dvsteth.svg?react';
import TokenObolIconRaw from './token-obol.svg?react';
import TokenSsvIconRaw from './token-ssv.svg?react';
import TokenMellowIcon from './token-mellow.svg?react';
import TokenStethDarkIcon from './token-steth-dark.svg?react';
import TokenStrethIcon from './token-streth.svg?react';

import VaultDVVIcon from './vault-dvv.svg?react';
import VaultGGVIcon from './vault-ggv.svg?react';
import VaultSTGIcon from './vault-stg.svg?react';

import NavIconEarn from './nav-icon-earn.svg?react';

import EarnStgBannerIcon from './earn-stg-banner.svg?react';
import EarnUpToBannerIcon from './earn-up-to-banner.svg?react';

export { default as BaseIcon } from './allocation/base.svg?react';
export { default as ArbitrumIcon } from './allocation/arbitrum.svg?react';
export { default as EthereumIcon } from './allocation/ethereum.svg?react';
export { default as EulerIcon } from './allocation/euler.svg?react';
export { default as MorphoIcon } from './allocation/morpho.svg?react';
export { default as Univ3Icon } from './allocation/uniswap_v3.svg?react';
export { default as AaveV3Icon } from './allocation/aave_v3.svg?react';
export { default as BalancerIcon } from './allocation/balancer.svg?react';
export { default as MerklIcon } from './allocation/merkl.svg?react';
export { default as EtherfiIcon } from './allocation/etherfi.svg?react';
export { default as LineaIcon } from './allocation/linea.svg?react';
export { default as YearnV3Icon } from './allocation/yearn-v3.svg?react';
export { default as KatanaIcon } from './allocation/katana.svg?react';
export { default as PlasmaIcon } from './allocation/plasma.svg?react';
export { default as SparkIcon } from './allocation/spark.svg?react';
export { default as FluidIcon } from './allocation/fluid.svg?react';
export { default as MapleIcon } from './allocation/maple.svg?react';
export { default as GearboxIcon } from './allocation/gearbox.svg?react';
export { default as SteakhouseIcon } from './allocation/steakhouse.svg?react';
export { default as SentoraIcon } from './allocation/sentora.svg?react';
export { default as SkyIcon } from './allocation/sky.svg?react';
export { default as FelixIcon } from './allocation/felix.svg?react';
export { default as MonadIcon } from './allocation/nomad.svg?react';
export { default as HyperliquidIcon } from './allocation/hyperliquid.svg?react';
export { default as HyperlendIcon } from './allocation/hyperlend.svg?react';
export { default as EthenaIcon } from './allocation/ethena.svg?react';
export { default as SyrupIcon } from './allocation/syrup.svg?react';
export { default as AuraIcon } from './allocation/aura.svg?react';
export { default as ReIcon } from './allocation/re.svg?react';
export { default as UsdcIcon } from './allocation/usdc.svg?react';
export { default as SusdeIcon } from './allocation/susde.svg?react';
export { default as UsdtIcon } from './allocation/usdt.svg?react';
export { default as MantleIcon } from './allocation/mantle.svg?react';
export { default as EarnUsdIcon } from './allocation/earnusd.svg?react';

import ShieldCheckIcon from './shield-check.svg?react';

const themedBackground = css`
  path,
  rect {
    &[data-id='background'] {
      fill: ${({ theme }) => (theme.name === 'dark' ? '#34343D' : '#fff')};
    }
    &[data-id='background-border'] {
      stroke: ${({ theme }) => (theme.name === 'dark' ? '#484850' : '#fff')};
    }
  }
`;

const TokenObolIcon = styled(TokenObolIconRaw)`
  ${themedBackground}
`;

const TokenSsvIcon = styled(TokenSsvIconRaw)`
  ${themedBackground}
`;

export {
  Partner7SeasIcon,
  PartnerVedaIcon,
  PartnerSteakhouseIcon,
  PartnerMellowIcon,
  PartnerRuntimeLabsIcon,
  PartnerRuntimeLabsIconInverted,
  TokenStethDarkIcon,
  TokenStrethIcon,
  VaultGGVIcon,
  VaultDVVIcon,
  VaultSTGIcon,
  TokenEthIcon,
  TokenEthScalableIcon,
  TokenEthIcon32,
  TokenStethIcon,
  TokenStethScalableIcon,
  TokenWethIcon,
  TokenWethScalableIcon,
  TokenWethIcon32,
  TokenWstethIcon,
  TokenWstethScalableIcon,
  TokenWstethIcon32,
  TokenGGIcon,
  TokenDvstethIcon,
  TokenObolIcon,
  TokenSsvIcon,
  TokenMellowIcon,
  NavIconEarn,
  EarnStgBannerIcon,
  EarnUpToBannerIcon,
  ShieldCheckIcon,
};
