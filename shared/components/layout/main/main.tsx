import { FC } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';
import { useConfig } from 'config';
import { useRouter } from 'next/router';

import { MainStyle } from './styles';
import { EARN_PATH } from 'consts/urls';
import {
  EARN_VAULTS_V1_DESIGN,
  EarnVaultV1DesignKey,
} from 'features/earn/consts';

export const Main: FC<ContainerProps> = (props) => {
  const { size = 'tight', ...rest } = props;
  const { featureFlags } = useConfig().externalConfig;
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
      isHolidayDecorEnabled={featureFlags.holidayDecorEnabled}
      isEarnVault={isEarnVault}
      {...rest}
    />
  );
};
