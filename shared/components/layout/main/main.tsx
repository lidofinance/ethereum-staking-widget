import { FC } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';

import { useWinterTheme } from 'shared/components/winter-theme';

import { MainStyle } from './styles';
import { EARN_PATH } from 'consts/urls';
import {
  EARN_VAULTS_V1_DESIGN,
  EarnVaultV1DesignKey,
} from 'features/earn/consts';

export const Main: FC<ContainerProps> = (props) => {
  const { size = 'tight', ...rest } = props;
  // reserved from the flag, known on the server: no jump when the theme mounts
  const { requested: isWinterThemeEnabled } = useWinterTheme();
  const router = useRouter();

  const isEarnListPage = router.pathname === EARN_PATH;
  const isEarnVault = router.pathname.includes(`${EARN_PATH}/[vault]/[action]`);
  const isEarnVaultV1 =
    isEarnVault &&
    EARN_VAULTS_V1_DESIGN.includes(router.query.vault as EarnVaultV1DesignKey);
  const isEarnVaultV2 = isEarnVault && !isEarnVaultV1;
  const mainSize = isEarnVaultV2 ? 'full' : isEarnListPage ? 'content' : size;

  return (
    <MainStyle
      size={mainSize}
      forwardedAs="main"
      isWinterThemeEnabled={isWinterThemeEnabled}
      isEarnVault={isEarnVault}
      {...rest}
    />
  );
};
