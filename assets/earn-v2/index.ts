import styled, { css } from 'styled-components';

import { ReactComponent as VaultEthIcon } from './vault-eth.svg';
import { ReactComponent as VaultUsdIcon } from './vault-usd.svg';
import { ReactComponent as VaultDvvIcon } from './vault-dvv.svg';
import { ReactComponent as VaultGgvIcon } from './vault-ggv.svg';
import { ReactComponent as VaultStgIcon } from './vault-stg.svg';
import { ReactComponent as UpgradeIllustrationIcon } from './upgrade.svg';
import { ReactComponent as TokenEarnEthIcon } from './token-earneth.svg';
import { ReactComponent as TokenEarnUsdIcon } from './token-earnusd.svg';
import { ReactComponent as TokenUsdcIcon } from './token-usdc.svg';
import { ReactComponent as TokenUsdtIcon } from './token-usdt.svg';
import { ReactComponent as TokenGGIcon } from './token-gg.svg';
import { ReactComponent as TokenDvstethIcon } from './token-dvsteth.svg';
import { ReactComponent as TokenStrethIcon } from './token-streth.svg';
import { ReactComponent as IconChartColumnIncreasingRaw } from './icon-chart-column-increasing.svg';
import { ReactComponent as IconChartPieRaw } from './icon-chart-pie.svg';
import { ReactComponent as IconRotateCwRaw } from './icon-rotate-cw.svg';
import { ReactComponent as PartnerNethermindIconCircle } from './partner-nethermind-icon-circle.svg';
import { ReactComponent as PartnerUltrafieldsIconCircle } from './partner-ultra-fields-icon-circle.svg';
import { ReactComponent as PartnerVedaIconCircle } from './partner-veda-icon-circle.svg';

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
  TokenGGIcon,
  TokenDvstethIcon,
  TokenStrethIcon,
  IconChartColumnIncreasing,
  IconChartPie,
  IconRotateCw,
  PartnerNethermindIconCircle,
  PartnerUltrafieldsIconCircle,
  PartnerVedaIconCircle,
};
