import { FC } from 'react';
import { useMatch } from 'react-router';
import { ContainerProps } from '@lidofinance/lido-ui';
import { useConfig } from 'config';

import { MainStyle } from './styles';
import { EARN_PATH } from 'consts/urls';
import { useEarnVaultPageMatch } from 'shared/hooks/use-earn-vault-page-match';
import {
  EARN_VAULTS_V1_DESIGN,
  EarnVaultV1DesignKey,
} from 'features/earn/consts';

export const Main: FC<ContainerProps> = (props) => {
  const { size = 'tight', ...rest } = props;
  const { featureFlags } = useConfig().externalConfig;

  const isEarnListPage = !!useMatch(EARN_PATH);
  const vaultMatch = useEarnVaultPageMatch();
  const isEarnVault = !!vaultMatch;
  const isEarnVaultV1 =
    isEarnVault &&
    EARN_VAULTS_V1_DESIGN.includes(
      vaultMatch.params.vault as EarnVaultV1DesignKey,
    );
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
