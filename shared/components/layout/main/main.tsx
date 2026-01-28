import { FC } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';
import { useConfig } from 'config';
import { useRouter } from 'next/router';

import { MainStyle } from './styles';
import { EARN_PATH } from 'consts/urls';

export const Main: FC<ContainerProps> = (props) => {
  const { size = 'tight', ...rest } = props;
  const { featureFlags } = useConfig().externalConfig;
  const router = useRouter();
  // Needed only for holiday decor to be displayed correctly on earn page (holidayDecorEnabled)
  const isEarnVault = router.pathname.includes(`${EARN_PATH}/[vault]/[action]`);
  const isEarnNew = router.pathname.includes(`earn-new`);
  const isEarnNewVault = router.pathname.includes(`earn-new/eth`); // TODO: update to include all new earn vaults
  const mainSize = isEarnNewVault ? 'full' : isEarnNew ? 'content' : size;

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
