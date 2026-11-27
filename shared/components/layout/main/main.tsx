import { FC } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';
import { useConfig } from 'config';
import { useRouter } from 'next/router';

import { MainStyle } from './styles';
import { EARN_PATH } from 'consts/urls';
import type { EarnVaultKey } from 'features/earn/consts';
import { isLegacyVault } from 'features/earn/shared/utils/is-legacy-vault';

export const Main: FC<ContainerProps> = (props) => {
  const { size = 'tight', ...rest } = props;
  const { featureFlags } = useConfig().externalConfig;
  const router = useRouter();

  const isEarnListPage = router.pathname === EARN_PATH;
  const isEarnVault = router.pathname.includes(`${EARN_PATH}/[vault]/[action]`);
  const isFullWidthEarnVault =
    isEarnVault && !isLegacyVault(router.query.vault as EarnVaultKey);
  // Earn pages set their own column width; the wide container puts the FAQ button near the screen edge
  const mainSize = isFullWidthEarnVault || isEarnListPage ? 'full' : size;

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
