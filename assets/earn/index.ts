import styled, { css } from 'styled-components';

import { ReactComponent as Partner7SeasIcon } from './partner-7seas.svg';
import { ReactComponent as PartnerVedaIcon } from './partner-veda.svg';
import { ReactComponent as PartnerSteakhouseIcon } from './partner-steakhouse.svg';
import { ReactComponent as PartnerMellowIcon } from './partner-mellow.svg';
import { ReactComponent as PartnerRuntimeLabsIcon } from './partner-runtime-labs.svg';
import { ReactComponent as PartnerRuntimeLabsIconInverted } from './partner-runtime-labs-inverted.svg';

import { ReactComponent as TokenEthIcon } from './token-eth.svg';
import { ReactComponent as TokenEthIcon32 } from './token-eth-32.svg';
import { ReactComponent as TokenStethIcon } from './token-steth.svg';
import { ReactComponent as TokenWethIcon } from './token-weth.svg';
import { ReactComponent as TokenWstethIcon } from './token-wsteth.svg';
import { ReactComponent as TokenGGIcon } from './token-gg.svg';
import { ReactComponent as TokenDvstethIcon } from './token-dvsteth.svg';
import { ReactComponent as TokenObolIconRaw } from './token-obol.svg';
import { ReactComponent as TokenSsvIconRaw } from './token-ssv.svg';
import { ReactComponent as TokenMellowIcon } from './token-mellow.svg';
import { ReactComponent as TokenStethDarkIcon } from './token-steth-dark.svg';

import { ReactComponent as VaultDVVIcon } from './vault-dvv.svg';
import { ReactComponent as VaultGGVIcon } from './vault-ggv.svg';
import { ReactComponent as VaultSTGIcon } from './vault-stg.svg';

import { ReactComponent as NavIconEarn } from './nav-icon-earn.svg';

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
  VaultGGVIcon,
  VaultDVVIcon,
  VaultSTGIcon,
  TokenEthIcon,
  TokenEthIcon32,
  TokenStethIcon,
  TokenWethIcon,
  TokenWstethIcon,
  TokenGGIcon,
  TokenDvstethIcon,
  TokenObolIcon,
  TokenSsvIcon,
  TokenMellowIcon,
  NavIconEarn,
};
