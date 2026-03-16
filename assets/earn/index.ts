import styled, { css } from 'styled-components';

import { ReactComponent as Partner7SeasIcon } from './partner-7seas.svg';
import { ReactComponent as PartnerVedaIcon } from './partner-veda.svg';
import { ReactComponent as PartnerSteakhouseIcon } from './partner-steakhouse.svg';
import { ReactComponent as PartnerMellowIcon } from './partner-mellow.svg';
import { ReactComponent as PartnerRuntimeLabsIcon } from './partner-runtime-labs.svg';
import { ReactComponent as PartnerRuntimeLabsIconInverted } from './partner-runtime-labs-inverted.svg';

import { ReactComponent as TokenEthIcon } from './token-eth.svg';
import { ReactComponent as TokenEthScalableIcon } from './token-eth-scalable.svg';
import { ReactComponent as TokenEthIcon32 } from './token-eth-32.svg';
import { ReactComponent as TokenStethIcon } from './token-steth.svg';
import { ReactComponent as TokenStethScalableIcon } from './token-steth-scalable.svg';
import { ReactComponent as TokenWethIcon } from './token-weth.svg';
import { ReactComponent as TokenWethScalableIcon } from './token-weth-scalable.svg';
import { ReactComponent as TokenWethIcon32 } from './token-weth-32.svg';
import { ReactComponent as TokenWstethIcon } from './token-wsteth.svg';
import { ReactComponent as TokenWstethScalableIcon } from './token-wsteth-scalable.svg';
import { ReactComponent as TokenWstethIcon32 } from './token-wsteth-32.svg';
import { ReactComponent as TokenGGIcon } from './token-gg.svg';
import { ReactComponent as TokenDvstethIcon } from './token-dvsteth.svg';
import { ReactComponent as TokenObolIconRaw } from './token-obol.svg';
import { ReactComponent as TokenSsvIconRaw } from './token-ssv.svg';
import { ReactComponent as TokenMellowIcon } from './token-mellow.svg';
import { ReactComponent as TokenStethDarkIcon } from './token-steth-dark.svg';
import { ReactComponent as TokenStrethIcon } from './token-streth.svg';

import { ReactComponent as VaultDVVIcon } from './vault-dvv.svg';
import { ReactComponent as VaultGGVIcon } from './vault-ggv.svg';
import { ReactComponent as VaultSTGIcon } from './vault-stg.svg';

import { ReactComponent as NavIconEarn } from './nav-icon-earn.svg';

import { ReactComponent as EarnStgBannerIcon } from './earn-stg-banner.svg';
import { ReactComponent as EarnUpToBannerIcon } from './earn-up-to-banner.svg';

export { ReactComponent as BaseIcon } from './allocation/base.svg';
export { ReactComponent as ArbitrumIcon } from './allocation/arbitrum.svg';
export { ReactComponent as EthereumIcon } from './allocation/ethereum.svg';
export { ReactComponent as EulerIcon } from './allocation/euler.svg';
export { ReactComponent as MorphoIcon } from './allocation/morpho.svg';
export { ReactComponent as Univ3Icon } from './allocation/uniswap_v3.svg';
export { ReactComponent as AaveV3Icon } from './allocation/aave_v3.svg';
export { ReactComponent as BalancerIcon } from './allocation/balancer.svg';
export { ReactComponent as MerklIcon } from './allocation/merkl.svg';
export { ReactComponent as EtherfiIcon } from './allocation/etherfi.svg';
export { ReactComponent as LineaIcon } from './allocation/linea.svg';
export { ReactComponent as YearnV3Icon } from './allocation/yearn-v3.svg';
export { ReactComponent as KatanaIcon } from './allocation/katana.svg';
export { ReactComponent as PlasmaIcon } from './allocation/plasma.svg';
export { ReactComponent as SparkIcon } from './allocation/spark.svg';
export { ReactComponent as FluidIcon } from './allocation/fluid.svg';
export { ReactComponent as MapleIcon } from './allocation/maple.svg';
export { ReactComponent as GearboxIcon } from './allocation/gearbox.svg';
export { ReactComponent as SteakhouseIcon } from './allocation/steakhouse.svg';
export { ReactComponent as SentoraIcon } from './allocation/sentora.svg';
export { ReactComponent as SkyIcon } from './allocation/sky.svg';
export { ReactComponent as FelixIcon } from './allocation/felix.svg';
export { ReactComponent as MonadIcon } from './allocation/nomad.svg';
export { ReactComponent as HyperliquidIcon } from './allocation/hyperliquid.svg';
export { ReactComponent as HyperlendIcon } from './allocation/hyperlend.svg';
export { ReactComponent as EthenaIcon } from './allocation/ethena.svg';
export { ReactComponent as SyrupIcon } from './allocation/syrup.svg';
export { ReactComponent as AuraIcon } from './allocation/aura.svg';
export { ReactComponent as ReIcon } from './allocation/re.svg';
export { ReactComponent as UsdcIcon } from './allocation/usdc.svg';
export { ReactComponent as SusdeIcon } from './allocation/susde.svg';
export { ReactComponent as UsdtIcon } from './allocation/usdt.svg';

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
};
