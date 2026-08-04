import styled, { css } from 'styled-components';

import VaultEthIcon from './vault-eth.svg?react';
import VaultUsdIcon from './vault-usd.svg?react';
import VaultDvvIcon from './vault-dvv.svg?react';
import VaultGgvIcon from './vault-ggv.svg?react';
import VaultStgIcon from './vault-stg.svg?react';
import UpgradeIllustrationIcon from './upgrade.svg?react';
import TokenEarnEthIcon from './token-earneth.svg?react';
import TokenEarnUsdIcon from './token-earnusd.svg?react';
import TokenUsdcIcon from './token-usdc.svg?react';
import TokenUsdtIcon from './token-usdt.svg?react';
import TokenUsdeIcon from './token-usde.svg?react';
import TokenGGIcon from './token-gg.svg?react';
import TokenDvstethIcon from './token-dvsteth.svg?react';
import TokenStrethIcon from './token-streth.svg?react';
import IconChartColumnIncreasingRaw from './icon-chart-column-increasing.svg?react';
import IconChartPieRaw from './icon-chart-pie.svg?react';
import IconRotateCwRaw from './icon-rotate-cw.svg?react';
import PartnerNethermindIconCircle from './partner-nethermind-icon-circle.svg?react';
import PartnerUltrafieldsIconCircle from './partner-ultra-fields-icon-circle.svg?react';
import PartnerVedaIconCircle from './partner-veda-icon-circle.svg?react';
import TokenEthIcon from './token-eth.svg?react';

const themedFill = css`
  path,
  rect {
    &[fill='#273852'] {
      fill: ${({ theme }) => (theme.name === 'dark' ? '#fff' : '#273852')};
    }
  }
`;

const IconChartColumnIncreasing = styled(IconChartColumnIncreasingRaw)`
  ${themedFill}
`;

const IconChartPie = styled(IconChartPieRaw)`
  ${themedFill}
`;

const IconRotateCw = styled(IconRotateCwRaw)`
  ${themedFill}
`;

export {
  VaultEthIcon,
  VaultUsdIcon,
  VaultDvvIcon,
  VaultGgvIcon,
  VaultStgIcon,
  UpgradeIllustrationIcon,
  TokenEarnEthIcon,
  TokenEarnUsdIcon,
  TokenUsdcIcon,
  TokenUsdtIcon,
  TokenUsdeIcon,
  TokenGGIcon,
  TokenDvstethIcon,
  TokenStrethIcon,
  TokenEthIcon,
  IconChartColumnIncreasing,
  IconChartPie,
  IconRotateCw,
  PartnerNethermindIconCircle,
  PartnerUltrafieldsIconCircle,
  PartnerVedaIconCircle,
};
